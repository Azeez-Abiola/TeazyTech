import rateLimit from "express-rate-limit";
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import cookieParser from "cookie-parser";
import fetch from "node-fetch";
import helmet from "helmet";
import pino from "pino";
import { fileURLToPath } from "url";
import path from "path";
import Joi from "joi";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();
const logger = pino();

logger.info("Configuring Cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

logger.info("Creating Cloudinary storage configuration");
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "thumbnails",
    allowed_formats: ["jpg", "jpeg", "webp", "gif", "png"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  },
});

logger.info("Initializing Multer upload middleware");
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB for files
    fieldSize: 50 * 1024 * 1024 // 50MB for fields (like content)
  },
});

logger.info("Defining Joi schemas");
const postSchema = Joi.object({
  author: Joi.string().required().min(4).max(30),
  title: Joi.string().required().min(1).max(100),
  excerpt: Joi.string().required().min(1).max(200).optional(),
  content: Joi.string().required().min(1),
  category: Joi.string().min(2).max(30).required(),
  published_date: Joi.date().iso().optional(),
  status: Joi.string().valid("draft", "published").required(),
  thumbnail: Joi.alternatives().try(Joi.string().uri(), Joi.any()).optional(),
  views: Joi.number().default(0),
  viewedIPs: Joi.array().items(Joi.string()).default([]),
});

const postUpdateSchema = Joi.object({
  author: Joi.string().min(4).max(30).optional(),
  title: Joi.string().min(1).max(100).optional(),
  excerpt: Joi.string().max(200).allow("").optional(),
  content: Joi.string().min(1).optional(),
  category: Joi.string().min(2).max(30).optional(),
  published_date: Joi.date().iso().optional(),
  status: Joi.string().valid("draft", "published").optional(),
  thumbnail: Joi.alternatives().try(Joi.string().uri(), Joi.any()).optional(),
}).min(1);

const categorySchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  description: Joi.string().max(200).allow(""),
});

logger.info("Defining IP address extraction utility");
const getClientIp = (req) => {
  logger.debug("Attempting to get client IP from request headers");
  return (
    req.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection.remoteAddress
  );
};

logger.info("Initializing Express app");
const app = express();
app.set("trust proxy", true);


logger.info("Creating global rate limiter");
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later",
  keyGenerator: (req) => {
    logger.trace("Generating key for global limiter");
    return (
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "unknown"
    );
  },
  handler: (req, res, next, options) => {
    logger.warn("Global rate limit hit", { ip: req.ip, url: req.originalUrl });
    res.status(options.statusCode).send(options.message);
  },
});

logger.info("Applying global rate limiter");
app.use(globalLimiter);

logger.info("Creating endpoint-specific rate limiter");
const endpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many view requests",
  keyGenerator: (req) => {
    logger.trace("Generating key for endpoint limiter");
    return (
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "unknown"
    );
  },
  handler: (req, res, next, options) => {
    logger.warn("Endpoint rate limit hit", {
      ip: req.ip,
      url: req.originalUrl,
    });
    res.status(options.statusCode).send(options.message);
  },
});

// Global request logger for debugging Vercel routing
app.use((req, res, next) => {
  logger.info(`[REQ] ${req.method} ${req.url}`);
  next();
});



logger.info("Applying security headers with helmet");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://vercel.live",
          "https://*.vercel.live"
        ],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "*"],
        connectSrc: [
          "'self'",
          "https:",
          "https://vercel.live",
          "https://*.vercel.live",
          "https://vercel.com",
          "https://*.vercel.com"
        ],
        fontSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
);

logger.info("Applying body parsers and cookie parser");
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:5173", "https://teazytech.org", "https://www.teazytech.org"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



logger.info("Calculating __dirname for static serving");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
  logger.info("Serving static files from frontend/dist directory");
  // Serve static files with proper cache headers (local dev / non-Vercel hosts)
  app.use(express.static(path.join(process.cwd(), "frontend", "dist"), {
    maxAge: '1h', // Reduced cache time to help with updates
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Force no-cache for ALL files during this debugging phase to ensure updates are loaded
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }));
} else {
  logger.info("Skipping express.static on Vercel — static assets served via @vercel/static");
}

logger.info("Initializing Firebase Admin SDK...");
let db;
try {
  logger.debug("Parsing Firebase Admin Credentials from environment");
  const credentials = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
  admin.initializeApp({ credential: admin.credential.cert(credentials) });
  logger.debug("Getting Firestore instance");
  db = admin.firestore();
  logger.info("Firebase Admin initialized successfully");
} catch (err) {
  logger.error({ err }, "Failed to initialize Firebase Admin");
  process.exit(1);
}

logger.info("Checking for FIREBASE_API_KEY");
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
if (!FIREBASE_API_KEY) {
  logger.error("Missing FIREBASE_API_KEY in .env");
  process.exit(1);
}

logger.info("Defining updateUserStats utility function");
const updateUserStats = async (userId, amount) => {
  logger.info("Starting user stats update transaction", { userId, amount });
  const adminRef = db.collection("user").doc(userId);
  logger.debug("Admin document reference created", { userId });

  await db.runTransaction(async (transaction) => {
    logger.trace("Transaction start");
    const adminDoc = await transaction.get(adminRef);
    logger.trace("Admin document fetched", { exists: adminDoc.exists });

    if (!adminDoc.exists) {
      logger.error("User document not found for stats update", { userId });
      throw new Error("User document not found");
    }

    const currentTotal = adminDoc.data().total_posts || 0;
    logger.debug("Current total posts", { currentTotal });

    transaction.update(adminRef, {
      total_posts: currentTotal + amount,
    });
    logger.info("User stats updated successfully within transaction", {
      userId,
      newTotal: currentTotal + amount,
    });
  });
  logger.info("User stats update transaction committed");
};

// File system diagnostic to see what Vercel actually deployed
app.get("/api/debug/fs", async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const distPath = path.join(process.cwd(), "frontend", "dist");
    const exists = fs.existsSync(distPath);
    let files = [];
    if (exists) {
      files = fs.readdirSync(distPath);
    }
    res.json({
      cwd: process.cwd(),
      dirname: __dirname,
      distPath,
      exists,
      files,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Simple test endpoints moved to top for reliable matching

// Basic admin check logic helper
const checkAdmin = async (admin, db, decoded) => {
  let isAdmin = decoded.admin === true;
  if (!isAdmin) {
    const user = await admin.auth().getUser(decoded.uid);
    isAdmin = user.customClaims?.admin === true;
  }
  if (!isAdmin) {
    const adminDoc = await db.collection("user").doc(decoded.uid).get();
    isAdmin = adminDoc.exists;
    if (!isAdmin) {
      const adminsDoc = await db.collection("users").doc(decoded.uid).get();
      isAdmin = adminsDoc.exists;
    }
  }
  return isAdmin;
};

logger.info("Defining /api/admin/upload-image POST route");
app.post(
  "/api/admin/upload-image",
  upload.single("image"),
  async (req, res, next) => {
    logger.info("Received image upload request");
    const token = req.cookies.accessToken;
    logger.debug("Extracted access token", { hasToken: !!token });

    if (!token) {
      logger.warn("Image upload unauthorized: Missing token");
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      logger.debug("Verifying ID token");
      const decoded = await admin.auth().verifyIdToken(token);
      const isAdmin = await checkAdmin(admin, db, decoded);

      if (!isAdmin) {
        logger.warn("Image upload forbidden: Not admin", { uid: decoded.uid });
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (req.file) {
        return res.json({ url: req.file.path });
      }

      return res.status(400).json({ error: "No file provided" });
    } catch (error) {
      logger.error({ error }, "Upload failed");
      return res.status(500).json({ error: "Upload failed" });
    }
  }
);

logger.info("Defining /api/admin/sign-upload GET route");
app.get("/api/admin/sign-upload", async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const isAdmin = await checkAdmin(admin, db, decoded);

    if (!isAdmin) return res.status(403).json({ error: "Unauthorized" });

    const kind = req.query.kind || "post";
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folderByKind = {
      resource: "resources",
      "resource-thumbnail": "resource-thumbnails",
      post: "thumbnails",
      thumbnail: "thumbnails",
    };
    const params = {
      timestamp,
      folder: folderByKind[kind] || "thumbnails",
    };

    if (kind === "resource") {
      params.public_id = buildRawPublicId({ originalname: req.query.filename || "resource.pdf" });
    }

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET,
    );

    res.json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: params.folder,
      public_id: params.public_id,
      resourceType: kind === "resource" ? "raw" : "image",
    });
  } catch (error) {
    logger.error({ error }, "Signature generation failed");
    res.status(500).json({ error: "Signature failed" });
  }
});
logger.info("Defining /api/admin/login POST route");
app.post("/api/admin/login", endpointLimiter, async (req, res, next) => {
  const { email, password } = req.body;
  logger.info("Login attempt received", { email });

  try {
    logger.debug("Attempting Firebase sign-in with password");
    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
    const response = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    logger.trace("Firebase auth response received", {
      status: response.status,
    });

    const data = await response.json();
    logger.debug("Firebase auth response data", { hasError: !!data.error });

    if (data.error) {
      logger.warn("Firebase authentication error", data.error);
      return res.status(401).json(data.error);
    }

    logger.debug("Fetching user record using localId", {
      localId: data.localId,
    });
    const user = await admin.auth().getUser(data.localId);
    const isAdmin = user.customClaims?.admin === true;
    logger.trace("User record fetched", { uid: user.uid, isAdmin });

    if (!isAdmin) {
      logger.warn("Admin access denied during login", { uid: user.uid });
      return res.status(403).json({
        error: "Admin access denied",
        uid: user.uid,
        email: user.email,
      });
    }

    logger.debug("Fetching user document for admin data");
    const adminDoc = await db.collection("user").doc(user.uid).get();
    logger.trace("User document fetched", { exists: adminDoc.exists });

    if (!adminDoc.exists) {
      logger.error("Missing user document post-login", { uid: user.uid });
      return res.status(404).json({
        error: "User document not found",
        uid: user.uid,
      });
    }

    const userData = adminDoc.data();
    logger.info("Login successful, setting accessToken cookie");

    // Determine cookie domain for production
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      maxAge: 3600 * 1000,
      path: "/",
      sameSite: isProduction ? "none" : "lax",
    };

    // In production, set domain so cookie works on both www and non-www
    if (isProduction) {
      cookieOptions.domain = ".teazytech.org";
    }

    res.cookie("accessToken", data.idToken, cookieOptions);
    return res.json({
      uid: user.uid,
      email: user.email,
      ...userData,
    });
  } catch (error) {
    logger.error({ error }, "Login route failed");
    next(error);
  }
});

logger.info("Defining /api/admin/me GET route");
app.get("/api/admin/me", async (req, res, next) => {
  logger.info("Received ME endpoint request");
  const token = req.cookies.accessToken;
  logger.debug("Extracted access token", { hasToken: !!token });

  if (!token) {
    logger.warn("ME endpoint unauthorized: Missing token");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    logger.debug("Verifying ID token");
    const decoded = await admin.auth().verifyIdToken(token);
    logger.trace("Token decoded", { uid: decoded.uid });
    const user = await admin.auth().getUser(decoded.uid);
    logger.trace("User fetched", { uid: user.uid });
    const adminDoc = await db.collection("user").doc(user.uid).get();
    logger.trace("Admin document fetched", { exists: adminDoc.exists });

    if (!adminDoc.exists) {
      logger.error("ME endpoint failed: User document not found", {
        uid: user.uid,
      });
      return res.status(404).json({ error: "User document not found" });
    }

    logger.info("ME endpoint successful");
    return res.json({
      uid: user.uid,
      email: user.email,
      ...adminDoc.data(),
    });
  } catch (error) {
    logger.error({ error }, "ME endpoint failed in route handler");
    next(error);
  }
});

app.get("/api/debug/auth", async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.json({ error: "No token" });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await admin.auth().getUser(decoded.uid);
    const adminDoc = await db.collection("user").doc(decoded.uid).get();
    const adminsDoc = await db.collection("users").doc(decoded.uid).get();
    res.json({
      uid: decoded.uid,
      tokenClaims: decoded,
      authClaims: user.customClaims,
      userDocExists: adminDoc.exists,
      usersDocExists: adminsDoc.exists,
      userDoc: adminDoc.exists ? adminDoc.data() : null
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

logger.info("Defining /api/admin/logout POST route");
app.post("/api/admin/logout", (req, res) => {
  logger.info("Received logout request, clearing cookie");
  const isProduction = process.env.NODE_ENV === "production";
  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    path: "/",
    sameSite: isProduction ? "none" : "lax",
  };
  if (isProduction) {
    clearOptions.domain = ".teazytech.org";
  }
  res.clearCookie("accessToken", clearOptions);
  logger.info("Logout successful");
  return res.json({ message: "Logged out" });
});

logger.info("Defining /api/admin/create-post POST route");
app.post(
  "/api/admin/create-post",
  upload.single("thumbnail"),
  async (req, res, next) => {
    logger.info("Received create post request");
    console.log(req.body);
    const token = req.cookies.accessToken;
    logger.debug("Extracted access token", { hasToken: !!token });

    if (!token) {
      logger.warn("Create post unauthorized: Missing token");
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      logger.debug("Verifying ID token for post creation");
      const decoded = await admin.auth().verifyIdToken(token);

      // Tier 1: Token Claim
      let isAdmin = decoded.admin === true;
      let reason = isAdmin ? null : "Token missing admin claim";

      // Tier 2: Live Auth Record
      if (!isAdmin) {
        const user = await admin.auth().getUser(decoded.uid);
        isAdmin = user.customClaims?.admin === true;
        if (!isAdmin) reason = "Auth record missing admin claim";
      }

      // Tier 3: Firestore Fallback (check both 'user' and 'users')
      if (!isAdmin) {
        const adminDoc = await db.collection("user").doc(decoded.uid).get();
        isAdmin = adminDoc.exists;
        if (!isAdmin) {
          const adminsDoc = await db.collection("users").doc(decoded.uid).get();
          isAdmin = adminsDoc.exists;
          if (!isAdmin) reason = "No document in 'user' or 'users' collection";
        }
      }

      if (!isAdmin) {
        logger.warn("Create post forbidden: Not admin", { uid: decoded.uid, reason });
        return res.status(403).json({
          error: "Admin access required",
          uid: decoded.uid,
          reason,
          message: "Your account does not have admin privileges. If you are an admin, please try logging out and back in."
        });
      }

      logger.debug("Validating request body against postSchema");
      const { error, value } = postSchema.validate(req.body, {
        abortEarly: false,
        allowUnknown: true,
      });
      logger.trace("Validation result", { hasError: !!error });

      if (error) {
        logger.warn("Post validation failed", { details: error.details });
        const errors = error.details.map((detail) => ({
          field: detail.path[0],
          message: detail.message.replace(/"/g, ""),
          type: detail.type,
        }));
        return res.status(400).json({ errors });
      }

      logger.debug("Constructing post data object");
      // Check for file upload (legacy/fallback) or body URL
      let thumbnailPath = null;
      if (req.file) {
        thumbnailPath = req.file.path;
      } else if (req.body.thumbnail) {
        thumbnailPath = req.body.thumbnail;
      }

      const postData = {
        ...value,
        thumbnail: thumbnailPath,
        author_id: decoded.uid,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      };
      logger.trace("Post data prepared", {
        title: postData.title,
        authorId: postData.author_id,
      });

      logger.debug("Adding post to Firestore");
      const postRef = await db.collection("posts").add(postData);
      logger.info("Post created successfully in Firestore", {
        postId: postRef.id,
      });

      logger.debug("Updating user post stats");
      await updateUserStats(decoded.uid, 1);
      logger.info("User stats updated after post creation");

      return res.status(201).json({
        message: "Post created successfully",
        postId: postRef.id,
        ...postData,
      });
    } catch (error) {
      logger.error({ error }, "Create post failed in route handler");
      next(error);
    }
  },
);

// Helper: robustly parse a date from Firestore data (handles Timestamp, ISO string, formatted string, or seconds)
function parseFirestoreDate(field) {
  if (!field) return null;
  // Firestore Timestamp object
  if (typeof field.toDate === 'function') return field.toDate();
  // Plain object with _seconds (serialized Timestamp)
  if (typeof field === 'object' && field._seconds != null) return new Date(field._seconds * 1000);
  // Number (epoch ms or seconds)
  if (typeof field === 'number') return new Date(field > 1e12 ? field : field * 1000);
  // String (ISO or human-readable)
  if (typeof field === 'string') {
    const d = new Date(field);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function resolvePostDate(data) {
  return parseFirestoreDate(data.published_date)
    || parseFirestoreDate(data.updated_at)
    || parseFirestoreDate(data.created_at)
    || null;
}

logger.info("Defining /api/admin/posts GET route");
app.get("/api/admin/posts", async (req, res, next) => {
  logger.info("Received request for all admin posts");
  try {
    logger.debug("Fetching all posts to sort by display date");
    const postsSnapshot = await db
      .collection("posts")
      .get();
    logger.info("Posts snapshot fetched successfully", {
      count: postsSnapshot.size,
    });

    logger.debug("Mapping and formatting post data");
    const posts = postsSnapshot.docs.map((doc) => {
      const data = doc.data();
      logger.trace("Processing post data", { id: doc.id });
      
      const publishedDate = resolvePostDate(data);
      const sortDate = publishedDate ? publishedDate.getTime() : 0;
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

      const getTimeUnit = (seconds) => {
        const units = [
          { value: 31536000, unit: "year" },
          { value: 2592000, unit: "month" },
          { value: 604800, unit: "week" },
          { value: 86400, unit: "day" },
          { value: 3600, unit: "hour" },
          { value: 60, unit: "minute" },
          { value: 1, unit: "second" },
        ];
        for (const { value, unit } of units) {
          if (seconds >= value) {
            return { value: Math.floor(seconds / value), unit };
          }
        }
        return { value: 0, unit: "second" };
      };

      const timeAgo = publishedDate
        ? (() => {
          const secondsAgo = Math.floor(
            (Date.now() - publishedDate.getTime()) / 1000,
          );
          const { value, unit } = getTimeUnit(secondsAgo);
          return rtf.format(-value, unit);
        })()
        : "Unknown time";

      const formattedDate = publishedDate
        ? new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(publishedDate)
        : null;

      return {
        id: doc.id,
        ...data,
        published_date: formattedDate,
        timeAgo,
        _sortDate: sortDate,
      };
    });

    posts.sort((a, b) => b._sortDate - a._sortDate);
    posts.forEach(p => delete p._sortDate);

    logger.info("Returning all posts data");
    return res.json(posts);
  } catch (error) {
    logger.error({ error }, "Failed to fetch posts in admin/posts route");
    next(error);
  }
});

logger.info("Defining /api/admin/posts/pagination GET route");
app.get("/api/admin/posts/pagination", async (req, res, next) => {
  logger.info("Received request for paginated admin posts", {
    query: req.query,
  });
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    logger.debug("Pagination parameters", { page, limit, offset });

    if (page < 1 || limit < 1 || limit > 100) {
      logger.warn("Invalid pagination parameters received", { page, limit });
      return res.status(400).json({
        error: "Invalid page or limit. Limit must be between 1 and 100.",
      });
    }

    logger.debug("Fetching total count of posts");
    const totalCountSnapshot = await db.collection("posts").get();
    const totalCount = totalCountSnapshot.size;
    logger.trace("Total post count fetched", { totalCount });

    logger.debug("Reusing snapshot to paginate in memory");
    const postsSnapshot = totalCountSnapshot;

    logger.info("Paginated posts fetched successfully", {
      count: postsSnapshot.size,
    });

    logger.debug("Mapping and formatting paginated post data");
    let allPosts = postsSnapshot.docs.map((doc) => {
      const data = doc.data();
      logger.trace("Processing paginated post", { id: doc.id });
      
      const publishedDate = resolvePostDate(data);
      const sortDate = publishedDate ? publishedDate.getTime() : 0;

      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

      const getTimeUnit = (seconds) => {
        const units = [
          { value: 31536000, unit: "year" },
          { value: 2592000, unit: "month" },
          { value: 604800, unit: "week" },
          { value: 86400, unit: "day" },
          { value: 3600, unit: "hour" },
          { value: 60, unit: "minute" },
          { value: 1, unit: "second" },
        ];
        for (const { value, unit } of units) {
          if (seconds >= value) {
            return { value: Math.floor(seconds / value), unit };
          }
        }
        return { value: 0, unit: "second" };
      };

      const timeAgo = publishedDate
        ? (() => {
          const secondsAgo = Math.floor(
            (Date.now() - publishedDate.getTime()) / 1000,
          );
          const { value, unit } = getTimeUnit(secondsAgo);
          return rtf.format(-value, unit);
        })()
        : "Unknown time";

      const formattedDate = publishedDate
        ? new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(publishedDate)
        : null;

      return {
        id: doc.id,
        ...data,
        published_date: formattedDate,
        timeAgo,
        _sortDate: sortDate,
      };
    });

    allPosts.sort((a, b) => b._sortDate - a._sortDate);
    allPosts.forEach(p => delete p._sortDate);
    
    const posts = allPosts.slice(offset, offset + limit);

    const totalPages = Math.ceil(totalCount / limit);
    logger.info("Returning paginated results", {
      currentPage: page,
      totalPages,
    });
    return res.json({
      posts,
      pagination: {
        currentPage: page,
        perPage: limit,
        total: totalCount,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error({ error }, "Failed to fetch paginated posts");
    next(error);
  }
});

logger.info("Defining /api/admin/posts/:postId GET route");
app.get("/api/admin/posts/:postId", async (req, res, next) => {
  const postId = req.params.postId;
  logger.info("Received request for single admin post", { postId });

  if (!postId) {
    logger.warn("Post ID missing in request params");
    return res.status(400).json({ error: "Post ID required" });
  }

  try {
    const postRef = db.collection("posts").doc(postId);
    logger.debug("Post document reference created");
    const postDoc = await postRef.get();
    logger.trace("Post document fetched", { exists: postDoc.exists });

    if (!postDoc.exists) {
      logger.warn("Post not found for ID", { postId });
      return res.status(404).json({ error: "Post not found" });
    }

    const postData = postDoc.data();
    logger.debug("Post data retrieved");

    const publishedDate = resolvePostDate(postData);

    let formattedDate = "Date not available";

    if (publishedDate) {
      logger.trace("Formatting post date");
      try {
        formattedDate = new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(publishedDate);
        logger.trace("Date formatted successfully");
      } catch (e) {
        logger.warn(
          { error: e },
          "Failed to format date",
        );
      }
    }

    logger.info("Returning single post data", { postId });
    return res.json({
      id: postId,
      views: postData.views || 0,
      published_date: formattedDate,
      title: postData.title,
      author: postData.author,
      content: postData.content,
      excerpt: postData.excerpt,
      thumbnail: postData.thumbnail,
      category: postData.category,
      status: postData.status,
    });
  } catch (error) {
    logger.error({ error }, "Failed to fetch single post");
    next(error);
  }
});

logger.info(
  "Defining /api/admin/posts/:postId PATCH route for partial updates",
);
app.patch(
  "/api/admin/posts/:postId",
  upload.single("thumbnail"),
  async (req, res, next) => {
    const token = req.cookies.accessToken;
    const postId = req.params.postId;
    logger.info("Received PATCH request to update post", { postId });

    if (!token) {
      logger.warn("Post update unauthorized: Missing token");
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!postId) {
      logger.warn("Post ID missing for update");
      return res.status(400).json({ error: "Post ID required" });
    }

    try {
      logger.debug("Verifying ID token for update");
      const decoded = await admin.auth().verifyIdToken(token);

      // Tier 1: Token Claim
      let isAdmin = decoded.admin === true;
      let reason = isAdmin ? null : "Token missing admin claim";

      // Tier 2: Live Auth Record
      if (!isAdmin) {
        const user = await admin.auth().getUser(decoded.uid);
        isAdmin = user.customClaims?.admin === true;
        if (!isAdmin) reason = "Auth record missing admin claim";
      }

      // Tier 3: Firestore Fallback (check both 'user' and 'users')
      if (!isAdmin) {
        const adminDoc = await db.collection("user").doc(decoded.uid).get();
        isAdmin = adminDoc.exists;
        if (!isAdmin) {
          const adminsDoc = await db.collection("users").doc(decoded.uid).get();
          isAdmin = adminsDoc.exists;
          if (!isAdmin) reason = "No document in 'user' or 'users' collection";
        }
      }

      if (!isAdmin) {
        logger.warn("Post update forbidden: Not admin", { uid: decoded.uid, reason });
        return res.status(403).json({
          error: "Admin access required",
          uid: decoded.uid,
          reason,
          message: "Your account does not have admin privileges. If you are an admin, please try logging out and back in."
        });
      }

      const updateFields = {};
      if (req.body.title !== undefined) updateFields.title = req.body.title;
      if (req.body.author !== undefined) updateFields.author = req.body.author;
      if (req.body.excerpt !== undefined)
        updateFields.excerpt = req.body.excerpt;
      if (req.body.content !== undefined)
        updateFields.content = req.body.content;
      if (req.body.category !== undefined)
        updateFields.category = req.body.category;
      if (req.body.status !== undefined) updateFields.status = req.body.status;

      if (
        req.body.published_date !== undefined &&
        req.body.published_date !== ""
      ) {
        try {
          updateFields.published_date = new Date(
            req.body.published_date,
          ).toISOString();
        } catch (e) {
          logger.warn("Invalid published_date format", {
            date: req.body.published_date,
          });
          updateFields.published_date = new Date().toISOString();
        }
      }

      if (req.file) {
        updateFields.thumbnail = req.file.path;
        logger.debug("New thumbnail uploaded", {
          thumbnail: updateFields.thumbnail,
        });
      } else if (req.body.thumbnail !== undefined) {
        updateFields.thumbnail = req.body.thumbnail;
      }

      const flexibleUpdateSchema = Joi.object({
        author: Joi.string().min(4).max(30).optional(),
        title: Joi.string().min(1).max(100).optional(),
        excerpt: Joi.string().max(200).allow("").optional(),
        content: Joi.string().min(1).optional(),
        category: Joi.string().min(2).max(30).optional(),
        published_date: Joi.string().isoDate().optional(),
        status: Joi.string().valid("draft", "published").optional(),
        thumbnail: Joi.alternatives()
          .try(Joi.string().uri(), Joi.any())
          .optional(),
      }).min(1);

      logger.debug("Validating update data against schema", {
        fields: Object.keys(updateFields),
        values: updateFields,
      });

      const { error, value } = flexibleUpdateSchema.validate(updateFields, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
      });

      if (error) {
        logger.warn("Post update validation failed", {
          details: error.details,
          updateFields: updateFields,
        });
        const errors = error.details.map((detail) => ({
          field: detail.path[0],
          message: detail.message.replace(/"/g, ""),
          type: detail.type,
        }));
        return res.status(400).json({ errors });
      }

      const postRef = db.collection("posts").doc(postId);
      const postDoc = await postRef.get();
      logger.trace("Post document fetched", { exists: postDoc.exists });

      if (!postDoc.exists) {
        logger.warn("Post not found for update", { postId });
        return res.status(404).json({ error: "Post not found" });
      }

      logger.debug("Constructing update data for Firestore");
      const updateData = {
        ...value,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (updateData.published_date) {
        try {
          updateData.published_date = admin.firestore.Timestamp.fromDate(
            new Date(updateData.published_date),
          );
        } catch (e) {
          logger.warn("Failed to convert published_date to timestamp", {
            error: e.message,
          });
          updateData.published_date =
            admin.firestore.FieldValue.serverTimestamp();
        }
      }

      logger.trace("Update data prepared", { fields: Object.keys(updateData) });
      logger.debug("Applying update to Firestore");
      await postRef.update(updateData);
      logger.info("Post updated successfully in Firestore", { postId });

      const updatedPostData = (await postRef.get()).data();
      logger.trace("Updated post data fetched from Firestore");

      return res.json({
        message: "Post updated successfully",
        postId: postId,
        ...updatedPostData,
      });
    } catch (error) {
      logger.error({ error }, "Post update failed in route handler");
      next(error);
    }
  },
);

logger.info("Defining /api/admin/posts/:postId DELETE route");
app.delete("/api/admin/posts/:postId", async (req, res, next) => {
  const token = req.cookies.accessToken;
  const postId = req.params.postId;
  logger.info("Received DELETE request to delete post", { postId });

  if (!token) {
    logger.warn("Post delete unauthorized: Missing token");
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!postId) {
    logger.warn("Post ID missing for delete");
    return res.status(400).json({ error: "Post ID required" });
  }

  try {
    logger.debug("Verifying ID token for delete");
    const decoded = await admin.auth().verifyIdToken(token);

    // Tier 1: Token Claim
    let isAdmin = decoded.admin === true;

    // Tier 2: Live Auth Record
    if (!isAdmin) {
      const user = await admin.auth().getUser(decoded.uid);
      isAdmin = user.customClaims?.admin === true;
    }

    // Tier 3: Firestore Fallback
    if (!isAdmin) {
      const adminDoc = await db.collection("user").doc(decoded.uid).get();
      isAdmin = adminDoc.exists;
    }

    if (!isAdmin) {
      logger.warn("Post delete forbidden: Not admin", { uid: decoded.uid });
      return res.status(403).json({
        error: "Admin access required",
        uid: decoded.uid,
        message: "Your account does not have admin privileges on this environment."
      });
    }

    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();
    logger.trace("Post document fetched", { exists: postDoc.exists });

    if (!postDoc.exists) {
      logger.warn("Post not found for deletion", { postId });
      return res.status(404).json({ error: "Post not found" });
    }

    const postData = postDoc.data();
    const authorId = postData.author_id;
    logger.debug("Post data retrieved for deletion", { authorId });

    if (!authorId) {
      logger.warn("Post missing authorId, cannot update user stats", {
        postId,
      });
      return res.status(400).json({ error: "Post has no authorId" });
    }

    logger.debug("Deleting post document");
    await postRef.delete();
    logger.info("Post deleted successfully", { postId });

    logger.debug("Updating author stats after deletion");
    await updateUserStats(authorId, -1);
    logger.info("Author stats updated after post deletion");

    return res.json({
      message: "Post deleted successfully",
      postId: postId,
    });
  } catch (error) {
    logger.error({ error }, "Failed to delete post");
    next(error);
  }
});

logger.info("Defining /api/admin/posts/category-counts GET route");
app.get("/api/admin/posts/category-counts", async (req, res, next) => {
  logger.info("Received request for category counts");
  const token = req.cookies.accessToken;
  logger.debug("Extracted access token", { hasToken: !!token });

  if (!token) {
    logger.warn("Category count unauthorized: Missing token");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    logger.debug("Fetching all posts to calculate counts");
    const postsSnapshot = await db.collection("posts").get();
    const counts = {};
    logger.info("Posts fetched for counting", { count: postsSnapshot.size });

    logger.trace("Iterating through posts to aggregate category counts");
    postsSnapshot.forEach((doc) => {
      const category = doc.data().category;
      counts[category] = (counts[category] || 0) + 1;
      logger.trace("Count updated for category", {
        category,
        currentCount: counts[category],
      });
    });

    logger.debug("Formatting counts into array of objects");
    const result = Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));
    logger.info("Category counts calculated and returned");

    res.json(result);
  } catch (error) {
    logger.error({ error }, "Failed to get category counts");
    next(error);
  }
});

logger.info("Defining /api/admin/categories GET route");
app.get("/api/admin/categories", async (req, res, next) => {
  logger.info("Received request for admin categories");
  const token = req.cookies.accessToken;
  logger.debug("Extracted access token", { hasToken: !!token });

  if (!token) {
    logger.warn("Categories fetch unauthorized: Missing token");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    logger.debug("Verifying admin privileges");
    const decoded = await admin.auth().verifyIdToken(token);
    // Tier 1: Token Claim
    let isAdmin = decoded.admin === true;
    let reason = isAdmin ? null : "Token missing admin claim";

    // Tier 2: Live Auth Record
    if (!isAdmin) {
      const userRec = await admin.auth().getUser(decoded.uid);
      isAdmin = userRec.customClaims?.admin === true;
      if (!isAdmin) reason = "Auth record missing admin claim";
    }

    // Tier 3: Firestore Fallback (check both 'user' and 'users')
    if (!isAdmin) {
      const adminDoc = await db.collection("user").doc(decoded.uid).get();
      isAdmin = adminDoc.exists;
      if (!isAdmin) {
        const adminsDoc = await db.collection("users").doc(decoded.uid).get();
        isAdmin = adminsDoc.exists;
        if (!isAdmin) reason = "No document in 'user' or 'users' collection";
      }
    }

    if (!isAdmin) {
      logger.warn("Categories fetch forbidden: Not admin", { uid: decoded.uid, reason });
      return res.status(403).json({
        error: "Admin access required",
        uid: decoded.uid,
        reason,
        message: "Your account does not have admin privileges. If you are an admin, please try logging out and back in."
      });
    }
    logger.trace("Admin verified");

    logger.debug("Fetching categories and all posts");
    const categoriesSnapshot = await db.collection("categories").get();
    const postsSnapshot = await db.collection("posts").get();
    logger.info("Categories and posts fetched", {
      catCount: categoriesSnapshot.size,
      postCount: postsSnapshot.size,
    });

    logger.debug("Calculating post counts per category");
    const postCounts = {};
    postsSnapshot.forEach((doc) => {
      const category = doc.data().category;
      postCounts[category] = (postCounts[category] || 0) + 1;
    });
    logger.trace("Post counts aggregated");

    logger.debug("Mapping category data with post counts");
    const categories = categoriesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description || "",
        postCount: postCounts[data.name] || 0,
      };
    });

    logger.info("Categories fetched and returned successfully");
    res.json(categories);
  } catch (error) {
    logger.error({ error }, "Failed to fetch categories");
    next(error);
  }
});

logger.info("Defining /api/admin/categories POST route");
app.post("/api/admin/categories", async (req, res, next) => {
  logger.info("Received request to create category");
  const token = req.cookies.accessToken;
  logger.debug("Extracted access token", { hasToken: !!token });

  if (!token) {
    logger.warn("Category creation unauthorized: Missing token");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    logger.debug("Verifying admin privileges");
    const decoded = await admin.auth().verifyIdToken(token);

    // Tier 1: Token Claim
    let isAdmin = decoded.admin === true;

    // Tier 2: Live Auth Record
    if (!isAdmin) {
      const user = await admin.auth().getUser(decoded.uid);
      isAdmin = user.customClaims?.admin === true;
    }

    // Tier 3: Firestore Fallback
    if (!isAdmin) {
      const adminDoc = await db.collection("user").doc(decoded.uid).get();
      isAdmin = adminDoc.exists;
    }

    if (!isAdmin) {
      logger.warn("Category creation forbidden: Not admin", { uid: decoded.uid });
      return res.status(403).json({
        error: "Admin access required",
        uid: decoded.uid,
        message: "Your account does not have admin privileges on this environment."
      });
    }
    logger.trace("Admin verified");

    logger.debug("Validating request body against categorySchema");
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      logger.warn("Category validation failed", {
        details: error.details[0].message,
      });
      return res.status(400).json({ error: error.details[0].message });
    }
    logger.trace("Validation successful", { categoryName: value.name });

    logger.debug("Checking for existing category name");
    const existingCat = await db
      .collection("categories")
      .where("name", "==", value.name)
      .limit(1)
      .get();
    logger.trace("Existing category check done", {
      exists: !existingCat.empty,
    });

    if (!existingCat.empty) {
      logger.warn("Category creation failed: Category already exists", {
        name: value.name,
      });
      return res.status(400).json({ error: "Category already exists" });
    }

    logger.debug("Adding new category to Firestore");
    const docRef = await db.collection("categories").add({
      name: value.name,
      description: value.description,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    logger.info("Category created successfully", {
      categoryId: docRef.id,
      name: value.name,
    });

    res.status(201).json({
      id: docRef.id,
      name: value.name,
      description: value.description,
      postCount: 0,
    });
  } catch (error) {
    logger.error({ error }, "Failed to create category");
    next(error);
  }
});

logger.info("Defining /api/admin/categories/:id PUT route");
app.put("/api/admin/categories/:id", async (req, res, next) => {
  logger.info("Received request to update category", {
    categoryId: req.params.id,
  });
  const token = req.cookies.accessToken;
  logger.debug("Extracted access token", { hasToken: !!token });

  if (!token) {
    logger.warn("Category update unauthorized: Missing token");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    logger.debug("Verifying admin privileges");
    const decoded = await admin.auth().verifyIdToken(token);

    // Tier 1: Token Claim
    let isAdmin = decoded.admin === true;

    // Tier 2: Live Auth Record
    if (!isAdmin) {
      const user = await admin.auth().getUser(decoded.uid);
      isAdmin = user.customClaims?.admin === true;
    }

    // Tier 3: Firestore Fallback
    if (!isAdmin) {
      const adminDoc = await db.collection("user").doc(decoded.uid).get();
      isAdmin = adminDoc.exists;
    }

    if (!isAdmin) {
      logger.warn("Category update forbidden: Not admin", { uid: decoded.uid });
      return res.status(403).json({
        error: "Admin access required",
        uid: decoded.uid,
        message: "Your account does not have admin privileges on this environment."
      });
    }
    logger.trace("Admin verified");

    logger.debug("Validating request body against categorySchema");
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      logger.warn("Category update validation failed", {
        details: error.details[0].message,
      });
      return res.status(400).json({ error: error.details[0].message });
    }
    logger.trace("Validation successful", { newName: value.name });

    const categoryId = req.params.id;
    const categoryRef = db.collection("categories").doc(categoryId);
    const categoryDoc = await categoryRef.get();
    logger.trace("Category document fetched", { exists: categoryDoc.exists });

    if (!categoryDoc.exists) {
      logger.warn("Category update failed: Category not found", { categoryId });
      return res.status(404).json({ error: "Category not found" });
    }

    logger.debug("Updating category document in Firestore");
    await categoryRef.update({
      name: value.name,
      description: value.description,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    logger.info("Category document updated successfully", { categoryId });

    logger.debug("Fetching posts with the new category name to get count");
    const postsSnapshot = await db
      .collection("posts")
      .where("category", "==", value.name)
      .get();
    logger.trace("Post count fetched for updated category", {
      count: postsSnapshot.size,
    });

    res.json({
      id: categoryId,
      name: value.name,
      description: value.description,
      postCount: postsSnapshot.size,
    });
  } catch (error) {
    logger.error({ error }, "Failed to update category");
    next(error);
  }
});

logger.info("Defining /api/admin/categories/:id DELETE route");
app.delete("/api/admin/categories/:id", async (req, res, next) => {
  logger.info("Received request to delete category", {
    categoryId: req.params.id,
  });
  const token = req.cookies.accessToken;
  logger.debug("Extracted access token", { hasToken: !!token });

  if (!token) {
    logger.warn("Category delete unauthorized: Missing token");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    logger.debug("Verifying admin privileges");
    const decoded = await admin.auth().verifyIdToken(token);

    // Tier 1: Token Claim
    let isAdmin = decoded.admin === true;

    // Tier 2: Live Auth Record
    if (!isAdmin) {
      const user = await admin.auth().getUser(decoded.uid);
      isAdmin = user.customClaims?.admin === true;
    }

    // Tier 3: Firestore Fallback
    if (!isAdmin) {
      const adminDoc = await db.collection("user").doc(decoded.uid).get();
      isAdmin = adminDoc.exists;
    }

    if (!isAdmin) {
      logger.warn("Category delete forbidden: Not admin", { uid: decoded.uid });
      return res.status(403).json({
        error: "Admin access required",
        uid: decoded.uid,
        message: "Your account does not have admin privileges on this environment."
      });
    }
    logger.trace("Admin verified");

    const categoryId = req.params.id;
    const categoryRef = db.collection("categories").doc(categoryId);
    const categoryDoc = await categoryRef.get();
    logger.trace("Category document fetched", { exists: categoryDoc.exists });

    if (!categoryDoc.exists) {
      logger.warn("Category delete failed: Category not found", { categoryId });
      return res.status(404).json({ error: "Category not found" });
    }

    const categoryName = categoryDoc.data().name;
    logger.debug("Checking for existing posts in this category", {
      categoryName,
    });
    const postsSnapshot = await db
      .collection("posts")
      .where("category", "==", categoryName)
      .limit(1)
      .get();
    logger.trace("Posts check done", { hasPosts: !postsSnapshot.empty });

    if (!postsSnapshot.empty) {
      logger.warn("Category delete failed: Posts exist in category", {
        categoryName,
      });
      return res
        .status(400)
        .json({ error: "Cannot delete category with posts" });
    }

    logger.debug("Deleting category document");
    await categoryRef.delete();
    logger.info("Category deleted successfully", { categoryId });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    logger.error({ error }, "Failed to delete category");
    next(error);
  }
});

logger.info("Defining /api/posts/:id/view POST route for view tracking");
app.post("/api/posts/:id/view", endpointLimiter, async (req, res, next) => {
  logger.info("Starting view tracking request", { postId: req.params.id });

  try {
    const postId = req.params.id;
    logger.debug("Extracted post ID", { postId });

    const clientIp = getClientIp(req);
    logger.debug("Client IP identified", { clientIp });

    if (!postId) {
      logger.warn("View tracking failed: Missing post ID");
      return res.status(400).json({ error: "Post ID is required" });
    }

    const postRef = db.collection("posts").doc(postId);
    logger.debug("Post reference created");

    await db.runTransaction(async (transaction) => {
      logger.trace("View tracking transaction started");

      const postDoc = await transaction.get(postRef);
      logger.trace("Post document fetched in transaction", {
        exists: postDoc.exists,
      });

      if (!postDoc.exists) {
        logger.warn("View tracking failed: Post not found in Firestore", {
          postId,
        });
        throw new Error("Post not found");
      }

      const postData = postDoc.data();
      logger.trace("Post data retrieved in transaction", {
        status: postData.status,
      });

      if (postData.status !== "published") {
        logger.warn("View tracking aborted: Attempt to view unpublished post", {
          postId,
        });
        res.status(403).json({ error: "Post not published" });
        return;
      }

      logger.info("View recorded", { postId, clientIp });

      transaction.update(postRef, {
        views: admin.firestore.FieldValue.increment(1),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.debug("Post view count updated in transaction");

      if (postData.author_id) {
        logger.debug("Updating author's total view count", {
          authorId: postData.author_id,
        });
        const adminRef = db.collection("user").doc(postData.author_id);
        transaction.update(adminRef, {
          total_views: admin.firestore.FieldValue.increment(1),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        logger.trace("Author stats update queued in transaction");
      }
    });

    logger.info(
      "View tracking successfully completed and transaction committed",
      { postId },
    );
    return res.json({ success: true });
  } catch (error) {
    if (error.message === "Post not found") {
      logger.warn("View tracking post not found", { postId: req.params.id });
      return res.status(404).json({ error: "Post not found" });
    }
    logger.error({ error }, "View tracking failed in route handler");
    next(error);
  }
});

logger.info("Defining /api/admin/analytics GET route");
app.get("/api/admin/analytics", async (req, res, next) => {
  logger.info("Received request for admin analytics");
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = await admin.auth().verifyIdToken(token).catch(() => null);
    if (!decoded) return res.status(401).json({ error: "Unauthorized" });

    const isAdmin = await checkAdmin(admin, db, decoded);
    if (!isAdmin) return res.status(403).json({ error: "Unauthorized" });

    // 1. Fetch all posts to calculate totals and category distribution
    const postsSnapshot = await db.collection("posts").get();
    const posts = [];
    let totalViews = 0;
    const categoryCounts = {};

    postsSnapshot.forEach(doc => {
      const data = doc.data();
      const postViews = parseInt(data.views) || 0;
      totalViews += postViews;
      
      const cat = data.category || "Uncategorized";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      const publishedDate = resolvePostDate(data);

      posts.push({
        id: doc.id,
        title: data.title,
        views: postViews,
        category: data.category,
        author: data.author,
        published_date: publishedDate ? publishedDate.toISOString() : null
      });
    });

    // 2. Sort for top viewed posts
    const topPosts = [...posts]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // 3. Category data for summaries
    const categories = Object.keys(categoryCounts).map(name => ({
      name,
      count: categoryCounts[name],
      percentage: ((categoryCounts[name] / (posts.length || 1)) * 100).toFixed(1)
    }));

    // 4. Calculate total authors (from the user collection)
    const usersSnapshot = await db.collection("user").get();
    const totalAuthors = usersSnapshot.size;

    logger.info("Analytics calculated successfully", { totalPosts: posts.length, totalViews });
    return res.json({
      totalPosts: posts.length,
      totalViews,
      totalAuthors,
      topPosts,
      categories,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error }, "Failed to fetch analytics");
    next(error);
  }
});

// ══════════════════════════════════════════════════════════
//  RESOURCES — raw file storage config (Cloudinary)
// ══════════════════════════════════════════════════════════

// Cloudinary's free plan caps raw files at 10 MB — enforce the same limit
// here so oversized uploads fail fast with a clear message instead of a 500.
const MAX_RESOURCE_FILE_BYTES = 10 * 1024 * 1024;

const rawStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "resources",
    resource_type: "raw",
    allowed_formats: ["pdf", "doc", "docx", "pptx", "xlsx", "zip"],
  },
});

const rawUpload = multer({
  storage: rawStorage,
  limits: { fileSize: MAX_RESOURCE_FILE_BYTES },
});

const resourceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESOURCE_FILE_BYTES },
});

const resourceFileFields = [
  { name: "thumbnail", maxCount: 1 },
  { name: "file", maxCount: 1 },
];

// Multer middleware for resource uploads that turns size-limit errors
// into a clear 400 instead of falling through to the global 500 handler
const resourceFilesUpload = (req, res, next) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_RESOURCE_FILE_BYTES },
  }).fields(resourceFileFields)(req, res, (err) => {
    if (err?.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File is too large — the maximum upload size is 10 MB.",
      });
    }
    next(err);
  });

// Cloudinary rejections (size, format, etc.) carry a 4xx http_code —
// surface their message to the admin instead of a generic 500
const isCloudinaryClientError = (err) =>
  typeof err?.http_code === "number" && err.http_code >= 400 && err.http_code < 500;

// Helper: upload buffer to Cloudinary
const uploadBufferToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err); else resolve(result);
    }).end(buffer);
  });

const RESOURCE_RAW_EXTENSIONS = new Set([
  "pdf", "doc", "docx", "pptx", "xlsx", "zip",
]);

const MIME_TO_EXT = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "pptx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.ms-excel": "xlsx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function fileExtension(file) {
  const fromName = path.extname(file.originalname || "").slice(1).toLowerCase();
  if (fromName) return fromName;
  return MIME_TO_EXT[file.mimetype] || "";
}

function sanitizeFilename(name) {
  return (name || "file").replace(/[^\w.\-]+/g, "_");
}

function buildRawPublicId(file) {
  const ext = fileExtension(file);
  const safe = sanitizeFilename(file.originalname);
  const hasExt = ext && safe.toLowerCase().endsWith(`.${ext}`);
  const filename = hasExt ? safe : ext ? `${safe}.${ext}` : safe;
  return `resource_${Date.now()}_${filename}`;
}

async function uploadResourceThumbnail(file) {
  const ext = fileExtension(file);
  return uploadBufferToCloudinary(file.buffer, {
    folder: "resource-thumbnails",
    resource_type: "image",
    filename: file.originalname,
    ...(ext ? { format: ext } : {}),
    transformation: [{ width: 800, height: 500, crop: "fill" }],
  });
}

async function uploadResourceDocument(file) {
  const ext = fileExtension(file);
  if (!ext) {
    const err = new Error(
      "Could not determine file type. Use PDF, DOC, DOCX, PPTX, XLSX, or ZIP.",
    );
    err.http_code = 400;
    throw err;
  }
  if (!RESOURCE_RAW_EXTENSIONS.has(ext)) {
    const err = new Error(
      `File type ".${ext}" is not supported. Allowed: PDF, DOC, DOCX, PPTX, XLSX, ZIP.`,
    );
    err.http_code = 400;
    throw err;
  }
  return uploadBufferToCloudinary(file.buffer, {
    folder: "resources",
    resource_type: "raw",
    public_id: buildRawPublicId(file),
    filename: file.originalname,
  });
}

const resourceSchema = Joi.object({
  title: Joi.string().required().min(2).max(120),
  description: Joi.string().required().min(5).max(1000),
  category: Joi.string().valid("guides", "tools", "webinars", "research").required(),
  price: Joi.number().min(0).required(),
  status: Joi.string().valid("published", "draft").default("published"),
  featured: Joi.boolean().default(false),
});

function parseBooleanField(value) {
  return value === true || value === "true";
}

function isCloudinaryUrl(url) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (typeof url !== "string" || !cloud) return false;
  return (
    url.includes(`res.cloudinary.com/${cloud}/`) ||
    url.includes(`res.cloudinary.com/${cloud.replace(/_/g, "-")}/`)
  );
}

const maybeResourceUpload = (req, res, next) => {
  const type = req.headers["content-type"] || "";
  if (type.includes("multipart/form-data")) {
    return resourceFilesUpload(req, res, next);
  }
  next();
};

async function createResourceRecord(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const isAdmin = await checkAdmin(admin, db, decoded);
    if (!isAdmin) return res.status(403).json({ error: "Admin access required" });

    const { fileUrl: bodyFileUrl, thumbnailUrl: bodyThumbUrl, ...fields } = req.body;

    let fileUrl = bodyFileUrl || null;
    let thumbnailUrl = bodyThumbUrl || null;

    if (req.files?.file?.[0]) {
      const result = await uploadResourceDocument(req.files.file[0]);
      fileUrl = result.secure_url;
    }
    if (req.files?.thumbnail?.[0]) {
      const result = await uploadResourceThumbnail(req.files.thumbnail[0]);
      thumbnailUrl = result.secure_url;
    }

    const payload = {
      ...fields,
      price: Number(fields.price),
      featured: fields.featured !== undefined
        ? parseBooleanField(fields.featured)
        : false,
    };
    const { error, value } = resourceSchema.validate(payload, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map(d => d.message).join(", ") });
    }

    if (!fileUrl || !isCloudinaryUrl(fileUrl)) {
      return res.status(400).json({
        error: fileUrl
          ? "Uploaded file URL is invalid. Please try uploading again."
          : "A resource file is required",
      });
    }
    if (thumbnailUrl && !isCloudinaryUrl(thumbnailUrl)) {
      return res.status(400).json({ error: "Invalid thumbnail URL" });
    }

    const doc = await db.collection("resources").add({
      ...value,
      price: Number(value.price),
      featured: Boolean(value.featured),
      thumbnailUrl: thumbnailUrl || null,
      fileUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ id: doc.id, message: "Resource created" });
  } catch (err) {
    logger.error({ err }, "Create resource failed");
    if (isCloudinaryClientError(err)) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

// ── Admin: Create Resource ──────────────────────────────
logger.info("Defining /api/admin/resources POST route");
app.post("/api/admin/resources", maybeResourceUpload, createResourceRecord);

// ── Admin: List Resources ───────────────────────────────
logger.info("Defining /api/admin/resources GET route");
app.get("/api/admin/resources", async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const isAdmin = await checkAdmin(admin, db, decoded);
    if (!isAdmin) return res.status(403).json({ error: "Admin access required" });

    const snap = await db.collection("resources").get();
    const resources = snap.docs
      .map(d => ({ id: d.id, ...d.data(), _ts: d.data().createdAt?._seconds || 0 }))
      .sort((a, b) => b._ts - a._ts)
      .map(({ _ts, ...rest }) => rest);
    return res.json(resources);
  } catch (err) {
    logger.error({ err }, "List resources failed");
    next(err);
  }
});

// ── Admin: List Purchases ────────────────────────────────
logger.info("Defining /api/admin/purchases GET route");
app.get("/api/admin/purchases", async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const isAdmin = await checkAdmin(admin, db, decoded);
    if (!isAdmin) return res.status(403).json({ error: "Admin access required" });

    const [purchasesSnap, resourcesSnap] = await Promise.all([
      db.collection("purchases").get(),
      db.collection("resources").get(),
    ]);

    // Build a resourceId -> resource map
    const resourceMap = {};
    resourcesSnap.docs.forEach(d => {
      resourceMap[d.id] = { id: d.id, ...d.data() };
    });

    const purchases = purchasesSnap.docs
      .map(d => {
        const data = d.data();
        const resource = resourceMap[data.resourceId] || {};
        return {
          id: d.id,
          ...data,
          resourceTitle: resource.title || "Unknown Resource",
          resourceCategory: resource.category || "uncategorized",
          _ts: data.purchasedAt?._seconds || 0,
        };
      })
      .sort((a, b) => b._ts - a._ts)
      .map(({ _ts, ...rest }) => rest);

    return res.json(purchases);
  } catch (err) {
    logger.error({ err }, "List purchases failed");
    next(err);
  }
});

// ── Admin: Update Resource ──────────────────────────────
logger.info("Defining /api/admin/resources/:id PATCH route");
app.patch("/api/admin/resources/:id", async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const isAdmin = await checkAdmin(admin, db, decoded);
    if (!isAdmin) return res.status(403).json({ error: "Admin access required" });

    const { id } = req.params;
    const updates = {};
    const {
      title,
      description,
      category,
      price,
      status,
      featured,
      fileUrl,
      thumbnailUrl,
    } = req.body;
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (category) updates.category = category;
    if (price !== undefined && price !== "") updates.price = Number(price);
    if (status) updates.status = status;

    if (featured !== undefined) {
      updates.featured = parseBooleanField(featured);
    }

    if (fileUrl) {
      if (!isCloudinaryUrl(fileUrl)) {
        return res.status(400).json({ error: "Invalid resource file URL" });
      }
      updates.fileUrl = fileUrl;
    }

    if (thumbnailUrl) {
      if (!isCloudinaryUrl(thumbnailUrl)) {
        return res.status(400).json({ error: "Invalid thumbnail URL" });
      }
      updates.thumbnailUrl = thumbnailUrl;
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await db.collection("resources").doc(id).update(updates);
    return res.json({ message: "Resource updated" });
  } catch (err) {
    logger.error({ err }, "Update resource failed");
    next(err);
  }
});

// ── Admin: Delete Resource ──────────────────────────────
logger.info("Defining /api/admin/resources/:id DELETE route");
app.delete("/api/admin/resources/:id", async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const isAdmin = await checkAdmin(admin, db, decoded);
    if (!isAdmin) return res.status(403).json({ error: "Admin access required" });

    await db.collection("resources").doc(req.params.id).delete();
    return res.json({ message: "Resource deleted" });
  } catch (err) {
    logger.error({ err }, "Delete resource failed");
    next(err);
  }
});

// ── Public: Featured published resources ───────────────
logger.info("Defining /api/resources/featured GET route");
app.get("/api/resources/featured", async (req, res, next) => {
  try {
    const snap = await db.collection("resources").get();
    const featured = snap.docs
      .map((d) => ({ id: d.id, ...d.data(), _createdAt: d.data().createdAt?._seconds || 0 }))
      .filter((r) => r.status === "published" && r.featured === true)
      .sort((a, b) => b._createdAt - a._createdAt)
      .map(({ fileUrl, _createdAt, ...safe }) => safe);

    return res.json(featured);
  } catch (err) {
    logger.error({ err }, "Fetch featured resources failed");
    next(err);
  }
});

// ── Public: List published resources ───────────────────
logger.info("Defining /api/resources GET route");
app.get("/api/resources", async (req, res, next) => {
  try {
    // Fetch all, then filter in memory to avoid Firestore composite index requirement
    const snap = await db.collection("resources").get();
    const resources = snap.docs
      .map(d => {
        const data = d.data();
        const { fileUrl, ...safe } = data;
        return { id: d.id, ...safe, _createdAt: data.createdAt?._seconds || 0 };
      })
      .filter(r => r.status === "published")
      .sort((a, b) => b._createdAt - a._createdAt)
      .map(({ _createdAt, ...rest }) => rest);
    return res.json(resources);
  } catch (err) {
    logger.error({ err }, "Public list resources failed");
    next(err);
  }
});

// Helper to send a congratulatory email with Resend
const sendCongratulatoryEmail = async (email, resourceTitle, downloadUrl) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    logger.warn("Resend API Key not configured. Skipping email.");
    return;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "Teazy Tech <hello@teazytech.org>";
  const siteUrl = (process.env.SITE_URL || "https://teazytech.org").replace(/\/$/, "");
  const logoUrl = `${siteUrl}/images/logo/teazy-tech-logo-icon.png`;
  
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
      <div style="text-align: center; margin-bottom: 25px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto;">
          <tr>
            <td style="vertical-align: middle; padding-right: 12px;">
              <img src="${logoUrl}" alt="Teazy Tech" width="40" height="40" style="display: block; border: 0; outline: none;" />
            </td>
            <td style="vertical-align: middle;">
              <h2 style="color: #2F6FCC; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Teazy Tech</h2>
            </td>
          </tr>
        </table>
      </div>
      <div style="background: linear-gradient(135deg, #2F6FCC, #1a4d99); color: #ffffff; padding: 35px 25px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 26px; font-weight: bold; line-height: 1.2;">Thank You for Your Purchase!</h1>
        <p style="margin: 12px 0 0; font-size: 16px; opacity: 0.9;">Your payment was verified successfully.</p>
      </div>
      <div style="color: #1a202c; line-height: 1.6; font-size: 15px; margin-bottom: 35px; padding: 0 5px;">
        <p style="font-size: 16px;">Hello,</p>
        <p>Your payment for <strong>${resourceTitle}</strong> went through successfully. We are excited to help you transform your classroom with this resource!</p>
        <p>Click the button below to download the resource file directly to your device:</p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${downloadUrl}" target="_blank" style="background-color: #2F6FCC; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 6px 16px rgba(47, 111, 204, 0.3); transition: all 0.2s ease;">Download Resource</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;" />
        <p style="color: #718096; font-size: 13px; word-break: break-all;">If the button above does not work, copy and paste this link into your browser:<br/>
        <a href="${downloadUrl}" style="color: #2F6FCC; text-decoration: underline;">${downloadUrl}</a></p>
      </div>
      <div style="border-top: 1px solid #edf2f7; padding-top: 25px; text-align: center; color: #a0aec0; font-size: 12px; line-height: 1.5;">
        <p>This is an automated email regarding your transaction on Teazy Tech.</p>
        <p>&copy; ${new Date().getFullYear()} Teazy Tech. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: `Successful Purchase: ${resourceTitle}`,
        html: htmlContent,
      }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      logger.error({ data }, "Resend API returned an error");
    } else {
      logger.info({ emailId: data.id }, "Successfully sent congratulations email via Resend");
    }
  } catch (err) {
    logger.error({ err }, "Failed to send congratulations email via Resend");
  }
};

// Helper to notify the official inbox via Resend
const OFFICIAL_EMAIL = process.env.CONTACT_EMAIL || "hello@teazytech.org";

const sendNotificationEmail = async ({ subject, html, replyTo }) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    logger.warn("Resend API Key not configured. Skipping notification email.");
    return false;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "Teazy Tech <hello@teazytech.org>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [OFFICIAL_EMAIL],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    logger.error({ data }, "Resend API returned an error for notification email");
    return false;
  }
  logger.info({ emailId: data.id }, "Notification email sent via Resend");
  return true;
};

// ── Public: Newsletter subscription ─────────────────────
logger.info("Defining /api/newsletter/subscribe POST route");
app.post("/api/newsletter/subscribe", endpointLimiter, async (req, res, next) => {
  const schema = Joi.object({ email: Joi.string().email().required() });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: "Please provide a valid email address" });
  }

  try {
    const sent = await sendNotificationEmail({
      subject: "New newsletter subscriber",
      replyTo: value.email,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px;">
          <h2 style="color: #2F6FCC;">New Newsletter Subscriber</h2>
          <p>Someone just subscribed to the Teazy Tech newsletter:</p>
          <p style="font-size: 18px; font-weight: bold;">${value.email}</p>
          <p style="color: #718096; font-size: 12px;">Sent automatically from teazytech.org</p>
        </div>
      `,
    });

    if (!sent) {
      return res.status(503).json({ error: "Email service unavailable. Please try again later." });
    }
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Newsletter subscription failed");
    next(err);
  }
});

// ── Public: Contact form ─────────────────────────────────
logger.info("Defining /api/contact POST route");
app.post("/api/contact", endpointLimiter, async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(5).max(20).required(),
    message: Joi.string().min(2).max(2000).required(),
  });
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error: error.details.map((d) => d.message).join(", ") });
  }

  const escapeHtml = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  try {
    const sent = await sendNotificationEmail({
      subject: `New contact message from ${value.name}`,
      replyTo: value.email,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px;">
          <h2 style="color: #2F6FCC;">New Contact Form Message</h2>
          <p><strong>Name:</strong> ${escapeHtml(value.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(value.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(value.phone)}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f7fafc; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(value.message)}</p>
          <p style="color: #718096; font-size: 12px;">Reply directly to this email to respond to the sender.</p>
        </div>
      `,
    });

    if (!sent) {
      return res.status(503).json({ error: "Email service unavailable. Please try again later." });
    }
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Contact form submission failed");
    next(err);
  }
});

// ── Public: Verify payment & return download URL ────────
logger.info("Defining /api/resources/:id/verify GET route");
app.get("/api/resources/:id/verify", async (req, res, next) => {
  const { id } = req.params;
  const { ref, email } = req.query;

  if (!ref || !email) {
    return res.status(400).json({ error: "Missing ref or email" });
  }

  try {
    const docSnap = await db.collection("resources").doc(id).get();
    if (!docSnap.exists) return res.status(404).json({ error: "Resource not found" });

    const resource = docSnap.data();
    if (resource.status !== "published") return res.status(403).json({ error: "Resource not available" });

    const isFree = Number(resource.price) === 0;

    if (!isFree && ref !== "FREE") {
      // Verify with Paystack
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackSecret) return res.status(500).json({ error: "Payment service not configured" });

      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
        headers: { Authorization: `Bearer ${paystackSecret}` },
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.status || verifyData.data?.status !== "success") {
        return res.status(402).json({ error: "Payment not confirmed" });
      }

      const paidAmount = Number(verifyData.data.amount);
      const expectedAmount = Math.round(Number(resource.price) * 100);
      if (paidAmount !== expectedAmount) {
        logger.warn(
          { paidAmount, expectedAmount, resourceId: id, ref },
          "Paystack amount mismatch",
        );
        return res.status(402).json({ error: "Payment amount mismatch" });
      }

      if (verifyData.data.currency && verifyData.data.currency !== "NGN") {
        return res.status(402).json({ error: "Invalid payment currency" });
      }

      // Check that the metadata matches
      const metaResourceId = verifyData.data?.metadata?.resource_id;
      if (metaResourceId && metaResourceId !== id) {
        return res.status(400).json({ error: "Payment reference mismatch" });
      }

      // Log the purchase
      await db.collection("purchases").add({
        resourceId: id,
        email,
        paystackRef: ref,
        amount: verifyData.data.amount / 100,
        purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send congratulations email asynchronously
      sendCongratulatoryEmail(email, resource.title, resource.fileUrl).catch(err => {
        logger.error({ err }, "Async sendCongratulatoryEmail failed");
      });
    }

    // Return the file URL (direct Cloudinary URL)
    return res.json({ downloadUrl: resource.fileUrl });
  } catch (err) {
    logger.error({ err }, "Verify resource payment failed");
    next(err);
  }
});

logger.info("Defining catch-all route for SPA client-side routing");

if (!isVercel) {
  app.get("*", (req, res) => {
    const isAsset = req.path.includes('.') || req.path.startsWith('/assets/');

    if (isAsset) {
      logger.warn("Asset not found, avoiding SPA catch-all", {
        path: req.originalUrl,
      });
      return res.status(404).end();
    }

    logger.info("Serving SPA index.html for catch-all route", {
      path: req.originalUrl,
    });
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(process.cwd(), "frontend", "dist", "index.html"));
  });
}



logger.info("Defining global error handler middleware");
app.use((err, req, res, next) => {
  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name,
        status: err.status,
      },
      url: req.originalUrl,
      method: req.method,
      ip: getClientIp(req),
      body: req.body,
      params: req.params,
      query: req.query,
      traceId: req.id || undefined,
    },
    "Global Error Handler caught an exception",
  );

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.name || "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
    traceId: req.id || undefined,
  });
});

const PORT = process.env.PORT || 8080;
logger.info("Starting server listen", { port: PORT });
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
