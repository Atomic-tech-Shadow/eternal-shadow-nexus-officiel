import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { setupWebSocket } from "./websocket";
import formidable from "formidable";
import path from "path";
import { isAuthenticated } from "./middlewares/auth";
import admin from "./firebaseAdmin"; // Correction de l'import

const bucket = admin.storage().bucket(); // Accès au bucket Firebase

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/posts", async (req, res, next) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const recommended = req.query.recommended === "true";
      const posts = recommended ? await storage.getRecommendedPosts(categoryId) : await storage.getPosts(categoryId);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/posts", isAuthenticated, async (req, res, next) => {
    try {
      const post = await storage.createPost(
        req.user!.id,
        req.body.content,
        req.body.categoryId,
        req.body.imageUrl,
        req.body.isProject
      );
      await storage.updateUserExperience(req.user!.id, 50);
      res.json(post);
    } catch (error) {
      next(error);
    }
  });

  // Upload de fichiers avec Firebase Storage
  app.post("/api/upload", isAuthenticated, async (req, res, next) => {
    try {
      const form = formidable({ multiples: false }); // Désactivation des multiples fichiers
      const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      });

      const file = files.file?.[0];
      if (!file) return res.status(400).json({ error: "No file uploaded" });

      const fileExt = path.extname(file.originalFilename || "");
      const fileName = `uploads/${Date.now()}${fileExt}`;

      // Upload du fichier sur Firebase Storage
      await bucket.upload(file.filepath, {
        destination: fileName,
        metadata: { contentType: file.mimetype || "application/octet-stream" },
      });

      // Génération d'une URL signée (valide 1 an)
      const [url] = await bucket.file(fileName).getSignedUrl({
        action: "read",
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 an
      });

      const media = await storage.createMediaFile(
        req.user!.id,
        fields.type?.[0] || "post",
        url
      );

      res.json(media);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Middleware de gestion d’erreur global
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  const httpServer = createServer(app);
  setupWebSocket(httpServer, app);
  return httpServer;
                                                                                       }
