import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { setupWebSocket } from "./websocket";
import { Client } from "@replit/object-storage";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { isAuthenticated } from "./middlewares/auth"; // Ajout d’un middleware d’auth

const storageClient = new Client();

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

  // Upload de fichiers avec meilleure gestion d’erreur
  app.post("/api/upload", isAuthenticated, async (req, res, next) => {
    try {
      const form = formidable({});
      const [fields, files] = await form.parse(req);
      const file = files.file?.[0];

      if (!file) return res.status(400).json({ error: "No file uploaded" });

      const fileExt = path.extname(file.originalFilename || "");
      const fileName = `${Date.now()}${fileExt}`;

      await storageClient.upload_file(fileName, file.filepath);
      const url = await storageClient.get_signed_url(fileName);

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
