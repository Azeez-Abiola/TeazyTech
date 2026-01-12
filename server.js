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
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

logger.info("Calculating __dirname for static serving");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

logger.info("Serving static files from dist directory");
// Serve static files with proper cache headers
app.use(express.static(path.join(__dirname, "dist"), {
  maxAge: '1h', // Reduced cache time to help with updates
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Force no-cache for HTML files to ensure updates are loaded
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    // Also force fresh assets for js files
    if (path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}))

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
      logger.trace("Token decoded", { uid: decoded.uid });
      const user = await admin.auth().getUser(decoded.uid);
      logger.trace("User fetched", { isAdmin: user.customClaims?.admin });

      if (!user.customClaims?.admin) {
        logger.warn("Image upload forbidden: Not admin", { uid: user.uid });
        return res.status(403).json({ error: "Admin access required" });
      }

      if (!req.file || !req.file.path) {
        logger.warn("Image upload failed: No image uploaded");
        return res
          .status(400)
          .json({ success: false, message: "No image uploaded" });
      }

      const imageUrl = req.file.path;
      logger.info("Image uploaded successfully", { url: imageUrl });
      return res.status(200).json({ success: true, url: imageUrl });
    } catch (error) {
      logger.error({ error }, "Image upload failed in route handler");
      next(error);
    }
  },
);

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
    res.cookie("accessToken", data.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600 * 1000,
      path: "/",
      sameSite: "lax",
      partitioned: true,
    });
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

logger.info("Defining /api/admin/logout POST route");
app.post("/api/admin/logout", (req, res) => {
  logger.info("Received logout request, clearing cookie");
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
  });
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
      logger.trace("Token decoded", { uid: decoded.uid });
      const user = await admin.auth().getUser(decoded.uid);
      const isAdmin = user.customClaims?.admin === true;
      logger.trace("User fetched", { isAdmin });

      if (!isAdmin) {
        logger.warn("Create post forbidden: Not admin", { uid: user.uid });
        return res.status(403).json({ error: "Admin access required" });
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
      const postData = {
        ...value,
        thumbnail: req.file ? req.file.path : null,
        author_id: user.uid,
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
      await updateUserStats(user.uid, 1);
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

logger.info("Defining /api/admin/posts GET route");
app.get("/api/admin/posts", async (req, res, next) => {
  logger.info("Received request for all admin posts");
  try {
    logger.debug("Fetching all posts, ordered by updated_at");
    const postsSnapshot = await db
      .collection("posts")
      .orderBy("updated_at", "desc")
      .get();
    logger.info("Posts snapshot fetched successfully", {
      count: postsSnapshot.size,
    });

    logger.debug("Mapping and formatting post data");
    const posts = postsSnapshot.docs.map((doc) => {
      const data = doc.data();
      logger.trace("Processing post data", { id: doc.id });
      const publishedDate = data.updated_at?.toDate?.() || null;
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
      };
    });

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

    logger.debug("Fetching paginated posts from Firestore");
    const postsSnapshot = await db
      .collection("posts")
      .orderBy("updated_at", "desc")
      .offset(offset)
      .limit(limit)
      .get();

    logger.info("Paginated posts fetched successfully", {
      count: postsSnapshot.size,
    });

    logger.debug("Mapping and formatting paginated post data");
    const posts = postsSnapshot.docs.map((doc) => {
      const data = doc.data();
      logger.trace("Processing paginated post", { id: doc.id });
      const publishedDate = data.updated_at?.toDate?.() || null;

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
      };
    });

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

    const dateToFormat = postData.updated_at || postData.created_at;
    let formattedDate = "Date not available";

    if (dateToFormat) {
      logger.trace("Formatting post date");
      try {
        const publishedDate = dateToFormat.toDate();
        formattedDate = new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(publishedDate);
        logger.trace("Date formatted successfully");
      } catch (e) {
        logger.warn(
          { error: e },
          "Failed to format date from Firestore timestamp",
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
      logger.trace("Token decoded", { uid: decoded.uid });
      const user = await admin.auth().getUser(decoded.uid);
      const isAdmin = user.customClaims?.admin === true;
      logger.trace("User fetched", { isAdmin });

      if (!isAdmin) {
        logger.warn("Post update forbidden: Not admin", { uid: user.uid });
        return res.status(403).json({ error: "Admin access required" });
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
    logger.trace("Token decoded", { uid: decoded.uid });
    const user = await admin.auth().getUser(decoded.uid);
    const isAdmin = user.customClaims?.admin === true;
    logger.trace("User fetched", { isAdmin });

    if (!isAdmin) {
      logger.warn("Post delete forbidden: Not admin", { uid: user.uid });
      return res.status(403).json({ error: "Admin access required" });
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
    const user = await admin.auth().getUser(decoded.uid);
    if (!user.customClaims?.admin) {
      logger.warn("Categories fetch forbidden: Not admin", { uid: user.uid });
      return res.status(403).json({ error: "Admin access required" });
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
    const user = await admin.auth().getUser(decoded.uid);
    if (!user.customClaims?.admin) {
      logger.warn("Category creation forbidden: Not admin", { uid: user.uid });
      return res.status(403).json({ error: "Admin access required" });
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
    const user = await admin.auth().getUser(decoded.uid);
    if (!user.customClaims?.admin) {
      logger.warn("Category update forbidden: Not admin", { uid: user.uid });
      return res.status(403).json({ error: "Admin access required" });
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
    const user = await admin.auth().getUser(decoded.uid);
    if (!user.customClaims?.admin) {
      logger.warn("Category delete forbidden: Not admin", { uid: user.uid });
      return res.status(403).json({ error: "Admin access required" });
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

      const viewedIPs = postData.viewedIPs || [];
      logger.trace("Existing viewed IPs", { count: viewedIPs.length });

      if (!viewedIPs.includes(clientIp)) {
        logger.info("New unique view recorded", { postId, clientIp });

        transaction.update(postRef, {
          views: (postData.views || 0) + 1,
          viewedIPs: [...viewedIPs, clientIp],
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        logger.debug("Post view count and IP updated in transaction");

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
      } else {
        logger.debug("Duplicate view from IP, skipping count increment", {
          postId,
          clientIp,
        });
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

logger.info("Defining catch-all route for SPA client-side routing");
app.get("*", (req, res) => {
  // Check if the request is for an asset (contains a dot and extension)
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
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

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
