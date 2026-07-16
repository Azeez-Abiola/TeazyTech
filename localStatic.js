import path from "path";
import express from "express";
import pino from "pino";

const logger = pino();
const distDir = path.join(process.cwd(), "frontend", "dist");

export function mountLocalStatic(app) {
  logger.info("Serving static files from frontend/dist directory");

  app.use(
    express.static(distDir, {
      maxAge: "1h",
      etag: true,
      lastModified: true,
      setHeaders: (res) => {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      },
    }),
  );

  app.get("/api/debug/fs", async (req, res) => {
    try {
      const fs = await import("fs");
      const exists = fs.existsSync(distDir);
      const files = exists ? fs.readdirSync(distDir) : [];

      res.json({
        cwd: process.cwd(),
        distDir,
        exists,
        files,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("*", (req, res) => {
    const isAsset =
      req.path.includes(".") || req.path.startsWith("/assets/");

    if (isAsset) {
      return res.status(404).end();
    }

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.join(distDir, "index.html"));
  });
}

export function startLocalServer(app) {
  const port = process.env.PORT || 8080;
  app.listen(port, () => logger.info(`Server running on port ${port}`));
}
