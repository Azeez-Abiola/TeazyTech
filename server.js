import rateLimit from "express-rate-limit"
import express from "express"
import admin from "firebase-admin"
import cookieParser from "cookie-parser"
import fetch from "node-fetch"
import helmet from "helmet"
import pino from "pino"
import { fileURLToPath } from "url"
import path from "path"
import Joi from "joi"
import dotenv from "dotenv"
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer to use Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "thumbnails", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "webp", "gif", "png"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 2MB
});

const postSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  excerpt: Joi.string().required().min(1).max(200).optional(),
  content: Joi.string().required().min(1),
  category: Joi.string().min(2).max(30).required(),
  published_date: Joi.date().iso(),
  status: Joi.string().valid("draft", "published").required(),
  thumbnail: Joi.string().uri().optional(),
  views: Joi.number().default(0),
  viewedIPs: Joi.array().items(Joi.string()).default([])
})

const categorySchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  description: Joi.string().max(200).allow("")
})


const getClientIp = (req) => {
  return req.ip || req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress
}

const logger = pino()

const app = express()

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later',
  keyGenerator: (req) => {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    )
  }
})

app.use(globalLimiter)
const endpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many view requests',
  keyGenerator: (req) => {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    )
  }
})



app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "*"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
)

app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve static files with proper cache headers
app.use(express.static(path.join(__dirname, "dist"), {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Force no-cache for HTML files to ensure updates are loaded
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}))
logger.info("Initializing Firebase Admin SDK...")

let db
try {
  const credentials = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)
  admin.initializeApp({ credential: admin.credential.cert(credentials) })
  db = admin.firestore()
  logger.info("Firebase Admin initialized successfully")
} catch (err) {
  logger.error("Failed to initialize Firebase Admin", err)
  process.exit(1)
}

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY
if (!FIREBASE_API_KEY) {
  logger.error("Missing FIREBASE_API_KEY in .env")
  process.exit(1)
}

const updateUserStats = async (userId, amount) => {
  const adminRef = db.collection("user").doc(userId)
  await db.runTransaction(async (transaction) => {
    const adminDoc = await transaction.get(adminRef)
    if (!adminDoc.exists) throw new Error("User document not found")

    const currentTotal = adminDoc.data().total_posts || 0  
    transaction.update(adminRef, {  
      total_posts: currentTotal + amount  
    })
  })
}



app.post("/api/admin/login", endpointLimiter, async (req, res) => {
  const { email, password } = req.body
  logger.info("Login attempt", { email })

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    )

    const data = await response.json()  
    if (data.error) {  
      logger.warn("Firebase auth error", data.error)  
      return res.status(401).json(data.error)  
    }  

    const user = await admin.auth().getUser(data.localId)  
    const isAdmin = user.customClaims?.admin === true  

    if (!isAdmin) {  
      logger.warn("Admin access denied", { uid: user.uid })  
      return res.status(403).json({   
        error: "Admin access denied",  
        uid: user.uid,  
        email: user.email  
      })  
    }  

    const adminDoc = await db.collection("user").doc(user.uid).get()  
    if (!adminDoc.exists) {  
      logger.error("Missing user document", { uid: user.uid })  
      return res.status(404).json({  
        error: "User document not found",  
        uid: user.uid  
      })  
    }  

    const userData = adminDoc.data()  
    res.cookie("accessToken", data.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      maxAge: 3600 * 1000,
      path: "/",
      sameSite: "strict",
      partitioned: true  
    })
    return res.json({  
      uid: user.uid,  
      email: user.email,  
      ...userData  
    })
  } catch (error) {
    logger.error("Login failed", error)
    return res.status(500).json({
      error: "Login failed",
      message: error.message
    })
  }
})

app.get("/api/admin/me", async (req, res) => {
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json({ error: "Unauthorized" })

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    const user = await admin.auth().getUser(decoded.uid)
    const adminDoc = await db.collection("user").doc(user.uid).get()

    if (!adminDoc.exists) {  
      return res.status(404).json({ error: "User document not found" })  
    }  

    return res.json({  
      uid: user.uid,  
      email: user.email,  
      ...adminDoc.data()  
    })
  } catch (error) {
    logger.error("ME endpoint failed", error)
    return res.status(401).json({
      error: "Invalid token",
      message: error.message
    })
  }
})

app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("accessToken", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  sameSite: "strict"
})
  return res.json({ message: "Logged out" })
})


app.post("/api/admin/create-post", upload.single("thumbnail"), async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await admin.auth().getUser(decoded.uid);
    const isAdmin = user.customClaims?.admin === true;

    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { error, value } = postSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true, // Allow unknown fields for file data
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message.replace(/"/g, ""),
        type: detail.type,
      }));
      return res.status(400).json({ errors });
    }

    const postData = {
      ...value,
      thumbnail: req.file ? req.file.path : null, // Save Cloudinary URL
      author_id: user.uid,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const postRef = await db.collection("posts").add(postData);
    await updateUserStats(user.uid, 1);

    return res.status(201).json({
      message: "Post created successfully",
      postId: postRef.id,
      ...postData,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Post creation failed",
      message: error.message,
    });
  }
})


app.get("/api/admin/posts", async (req, res) => {
  try {
   const postsSnapshot = await db.collection("posts").orderBy("updated_at", "desc").get()  
    const posts = postsSnapshot.docs.map(doc => {
    const data = doc.data()
    const publishedDate = data.updated_at.toDate()
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
    
     const getTimeUnit = (seconds) => {
        const units = [
          { value: 31536000, unit: "year" },
          { value: 2592000, unit: "month" },
          { value: 604800, unit: "week" },
          { value: 86400, unit: "day" },
          { value: 3600, unit: "hour" },
          { value: 60, unit: "minute" },
          { value: 1, unit: "second" }
        ]
        for (const { value, unit } of units) {
          if (seconds >= value) {
            return { value: Math.floor(seconds / value), unit }
          }
        }
        return { value: 0, unit: "second" }
      }
    
      const timeAgo = publishedDate ? (() => {
        const secondsAgo = Math.floor((Date.now() - publishedDate.getTime()) / 1000)
        const { value, unit } = getTimeUnit(secondsAgo)
        return rtf.format(-value, unit)
      })() : "Unknown time"
    
      const formattedDate = publishedDate ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(publishedDate) : null
    
      return {
        id: doc.id,
        ...data,
        published_date: formattedDate,
        timeAgo
      }
    })

    return res.json(posts)
  } catch (error) {
    logger.error("Failed to fetch posts", error)
    return res.status(500).json({
      error: "Failed to fetch posts",
      message: error.message
    })
  }
})


app.get("/api/admin/posts/pagination", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ error: "Invalid page or limit. Limit must be between 1 and 100." })
    }

    // Get total count first
    const totalCountSnapshot = await db.collection("posts").get()
    const totalCount = totalCountSnapshot.size

    // Fetch paginated posts
    const postsSnapshot = await db
      .collection("posts")
      .orderBy("updated_at", "desc")
      .offset(offset)
      .limit(limit)
      .get()

    const posts = postsSnapshot.docs.map(doc => {
      const data = doc.data()
      const publishedDate = data.updated_at?.toDate?.() || null

      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
      
      const getTimeUnit = (seconds) => {
        const units = [
          { value: 31536000, unit: "year" },
          { value: 2592000, unit: "month" },
          { value: 604800, unit: "week" },
          { value: 86400, unit: "day" },
          { value: 3600, unit: "hour" },
          { value: 60, unit: "minute" },
          { value: 1, unit: "second" }
        ]
        for (const { value, unit } of units) {
          if (seconds >= value) {
            return { value: Math.floor(seconds / value), unit }
          }
        }
        return { value: 0, unit: "second" }
      }
    
      const timeAgo = publishedDate ? (() => {
        const secondsAgo = Math.floor((Date.now() - publishedDate.getTime()) / 1000)
        const { value, unit } = getTimeUnit(secondsAgo)
        return rtf.format(-value, unit)
      })() : "Unknown time"
    
      const formattedDate = publishedDate ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(publishedDate) : null
    
      return {
        id: doc.id,
        ...data,
        published_date: formattedDate,
        timeAgo
      }
    })

    return res.json({
      posts,
      pagination: {
        currentPage: page,
        perPage: limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    logger.error("Failed to fetch posts", error)
    return res.status(500).json({
      error: "Failed to fetch posts",
      message: error.message
    })
  }
})

app.get("/api/admin/posts/:postId", async (req, res) => {
  const postId = req.params.postId;
  if (!postId) return res.status(400).json({ error: "Post ID required" });

  try {
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) return res.status(404).json({ error: "Post not found" });

    const postData = postDoc.data();
    
  const dateToFormat = postData.updated_at || postData.created_at;
    let formattedDate = "Date not available"
    
   if (dateToFormat) {
      try {
        const publishedDate = dateToFormat.toDate();
        formattedDate = new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }).format(publishedDate);
      } catch (e) {
        logger.warn("Failed to format date", e);
      }
    }

    return res.json({
      id: postId,
      views: postData.views || 0,
      published_date: formattedDate, 
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt,
      thumbnail: postData.thumbnail,
      category: postData.category,
      status: postData.status
    });
  } catch (error) {
    logger.error("Failed to fetch post", error);
    return res.status(500).json({
      error: "Failed to fetch post",
      message: error.message
    });
  }
});

app.put("/api/admin/posts/:postId", async (req, res) => {
  const token = req.cookies.accessToken
  const postId = req.params.postId

  if (!token) return res.status(401).json({ error: "Unauthorized" })
  if (!postId) return res.status(400).json({ error: "Post ID required" })

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    const user = await admin.auth().getUser(decoded.uid)
    const isAdmin = user.customClaims?.admin === true

    if (!isAdmin) return res.status(403).json({ error: "Admin access required" })  

    const { error, value } = postSchema.validate(req.body, {  
      abortEarly: false,  
      allowUnknown: false  
    })  

    if (error) {  
      const errors = error.details.map(detail => ({  
        field: detail.path[0],  
        message: detail.message.replace(/"/g, ""),  
        type: detail.type  
      }))  
      return res.status(400).json({ errors })  
    }  

    const postRef = db.collection("posts").doc(postId)  
    const postDoc = await postRef.get()  

    if (!postDoc.exists) return res.status(404).json({ error: "Post not found" })  

    const updateData = {  
      ...value,  
      updated_at: admin.firestore.FieldValue.serverTimestamp()  
    }  

    await postRef.update(updateData)  
    const updatedPost = (await postRef.get()).data()  
    
    return res.json({  
      message: "Post updated successfully",  
      postId: postId,  
      ...updatedPost  
    })
  } catch (error) {
    logger.error("Post update failed", error)
    return res.status(500).json({
      error: "Post update failed",
      message: error.message
    })
  }
})

app.delete("/api/admin/posts/:postId", async (req, res) => {
  const token = req.cookies.accessToken;
  const postId = req.params.postId;

  if (!token) return res.status(401).json({ error: "Unauthorized" });
  if (!postId) return res.status(400).json({ error: "Post ID required" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await admin.auth().getUser(decoded.uid);
    const isAdmin = user.customClaims?.admin === true;

    if (!isAdmin) return res.status(403).json({ error: "Admin access required" });

    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) return res.status(404).json({ error: "Post not found" });

    // Get the authorId from the post document
    const postData = postDoc.data();
    const authorId = postData.author_id

    if (!authorId) {
      return res.status(400).json({ error: "Post has no authorId" });
    }

    await postRef.delete();
    
    await updateUserStats(authorId, -1);
    
    return res.json({
      message: "Post deleted successfully",
      postId: postId
    });
  } catch (error) {
    logger.error("Failed to delete post", error);
    return res.status(500).json({
      error: "Failed to delete post",
      message: error.message
    });
  }
});

app.get("/api/admin/posts/category-counts", async (req, res) => {
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json({ error: "Unauthorized" })

  try {
    const postsSnapshot = await db.collection("posts").get()
    const counts = {}

    postsSnapshot.forEach(doc => {  
      const category = doc.data().category  
      counts[category] = (counts[category] || 0) + 1  
    })  

    res.json(Object.entries(counts).map(([name, count]) => ({ name, count })))
  } catch (error) {
    res.status(500).json({ error: "Failed to get category counts" })
  }
})

app.get("/api/admin/categories", async (req, res) => {
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json({ error: "Unauthorized" })

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    const user = await admin.auth().getUser(decoded.uid)
    if (!user.customClaims?.admin) return res.status(403).json({ error: "Admin access required" })

    const categoriesSnapshot = await db.collection("categories").get()
    const postsSnapshot = await db.collection("posts").get()
    
    const postCounts = {}
    postsSnapshot.forEach(doc => {
      const category = doc.data().category
      postCounts[category] = (postCounts[category] || 0) + 1
    })

    const categories = categoriesSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        description: data.description || "",
        postCount: postCounts[data.name] || 0
      }
    })

    res.json(categories)
  } catch (error) {
    logger.error("Failed to fetch categories:", error)
    res.status(500).json({ error: "Failed to fetch categories" })
  }
})

app.post("/api/admin/categories", async (req, res) => {
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json({ error: "Unauthorized" })

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    const user = await admin.auth().getUser(decoded.uid)
    if (!user.customClaims?.admin) return res.status(403).json({ error: "Admin access required" })

    const { error, value } = categorySchema.validate(req.body)
    if (error) return res.status(400).json({ error: error.details[0].message })

    const existingCat = await db.collection("categories").where("name", "==", value.name).limit(1).get()

    if (!existingCat.empty) {
      return res.status(400).json({ error: "Category already exists" })
    }

    const docRef = await db.collection("categories").add({
      name: value.name,
      description: value.description,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    })

    res.status(201).json({ 
      id: docRef.id,
      name: value.name,
      description: value.description,
      postCount: 0
    })
  } catch (error) {
    logger.error("Failed to create category:", error)
    res.status(500).json({ error: "Failed to create category" })
  }
})

app.put("/api/admin/categories/:id", async (req, res) => {
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json({ error: "Unauthorized" })

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    const user = await admin.auth().getUser(decoded.uid)
    if (!user.customClaims?.admin) return res.status(403).json({ error: "Admin access required" })

    const { error, value } = categorySchema.validate(req.body)
    if (error) return res.status(400).json({ error: error.details[0].message })

    const categoryId = req.params.id
    const categoryRef = db.collection("categories").doc(categoryId)
    const categoryDoc = await categoryRef.get()

    if (!categoryDoc.exists) {
      return res.status(404).json({ error: "Category not found" })
    }

    await categoryRef.update({
      name: value.name,
      description: value.description,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    })

    const postsSnapshot = await db.collection("posts").where("category", "==", value.name).get()

    res.json({
      id: categoryId,
      name: value.name,
      description: value.description,
      postCount: postsSnapshot.size
    })
  } catch (error) {
    logger.error("Failed to update category:", error)
    res.status(500).json({ error: "Failed to update category" })
  }
})

app.delete("/api/admin/categories/:id", async (req, res) => {
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json({ error: "Unauthorized" })

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    const user = await admin.auth().getUser(decoded.uid)
    if (!user.customClaims?.admin) return res.status(403).json({ error: "Admin access required" })

    const categoryId = req.params.id
    const categoryRef = db.collection("categories").doc(categoryId)
    const categoryDoc = await categoryRef.get()

    if (!categoryDoc.exists) {
      return res.status(404).json({ error: "Category not found" })
    }

    const categoryName = categoryDoc.data().name
    const postsSnapshot = await db.collection("posts").where("category", "==", categoryName).limit(1).get()

    if (!postsSnapshot.empty) {
      return res.status(400).json({ error: "Cannot delete category with posts" })
    }

    await categoryRef.delete()
    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    logger.error("Failed to delete category:", error)
    res.status(500).json({ error: "Failed to delete category" })
  }
})

app.post("/api/posts/:id/view", endpointLimiter, async (req, res) => {
  console.log('[VIEW TRACKING] Starting request for post:', req.params.id)
  
  try {
    const postId = req.params.id
    console.log('[VIEW TRACKING] Extracted post ID:', postId)

    const clientIp = getClientIp(req)
    console.log('[VIEW TRACKING] Client IP:', clientIp)
    
    if (!postId) {
      console.error('[VIEW TRACKING] Missing post ID')
      return res.status(400).json({ error: 'Post ID is required' })
    }

    const postRef = db.collection("posts").doc(postId)
    console.log('[VIEW TRACKING] Post reference created')
    
    await db.runTransaction(async (transaction) => {
      console.log('[TRANSACTION] Starting transaction')
      
      const postDoc = await transaction.get(postRef)
      console.log('[TRANSACTION] Post document fetched')
      
      if (!postDoc.exists) {
        console.error('[TRANSACTION] Post not found in Firestore')
        throw new Error('Post not found')
      }
      
      const postData = postDoc.data()
      console.log('[TRANSACTION] Post data:', { 
        status: postData.status, 
        views: postData.views,
        hasAuthor: !!postData.author_id
      })
      
      if (postData.status !== "published") {
        console.warn('[TRANSACTION] Attempt to view unpublished post')
        return res.status(403).json({ error: 'Post not published' })
      }

      const viewedIPs = postData.viewedIPs || []
      console.log('[TRANSACTION] Existing IPs:', viewedIPs)
      
      if (!viewedIPs.includes(clientIp)) {
        console.log('[TRANSACTION] New view from IP:', clientIp)
        
        transaction.update(postRef, {
          views: (postData.views || 0) + 1,
          viewedIPs: [...viewedIPs, clientIp],
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        })

        if (postData.author_id) {
          console.log('[TRANSACTION] Updating author stats for:', postData.author_id)
          const adminRef = db.collection("user").doc(postData.author_id)
          transaction.update(adminRef, {
            total_views: admin.firestore.FieldValue.increment(1),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          })
        }
      } else {
        console.log('[TRANSACTION] Duplicate view from IP:', clientIp)
      }
    })
    
    console.log('[VIEW TRACKING] Successfully completed')
    return res.json({ success: true })
    
  } catch (error) {
    console.error('[VIEW TRACKING ERROR] Full error:', {
      message: error.message,
      stack: error.stack,
      postId: req.params?.id,
      timestamp: new Date().toISOString()
    })
    
    return res.status(500).json({ 
      error: 'Failed to track view',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"))
})

app.use((err, req, res, next) => {
  logger.error(err.stack)
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})


const PORT = process.env.PORT || 5000
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`))
