import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { setupWebSocket } from "./websocket";
import { Client } from "@replit/object-storage";
import formidable from "formidable";
import fs from "fs";
import path from "path";

const storageClient = new Client();

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Posts
  app.get("/api/posts", async (req, res) => {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    const recommended = req.query.recommended === "true";

    // Si on demande des recommandations, on filtre en fonction de la catégorie
    // et on ajoute un tri par popularité (likes)
    if (recommended) {
      const posts = await storage.getRecommendedPosts(categoryId);
      return res.json(posts);
    }

    const posts = await storage.getPosts(categoryId);
    res.json(posts);
  });

  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const post = await storage.createPost(
      req.user!.id,
      req.body.content,
      req.body.categoryId,
      req.body.imageUrl,
      req.body.isProject,
    );

    // Award experience for creating a post
    await storage.updateUserExperience(req.user!.id, 50);

    res.json(post);
  });

  // Comments
  app.post("/api/posts/:postId/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const postId = parseInt(req.params.postId);
    const post = await storage.getPost(postId);

    // Détecter les mentions (@username)
    const mentions = req.body.content.match(/@(\w+)/g);
    const mentionedUsers = mentions ? await storage.getUsersByUsernames(
      mentions.map(m => m.substring(1))
    ) : [];

    const comment = await storage.createComment(
      req.user!.id,
      postId,
      req.body.content,
    );

    // Notifier les utilisateurs mentionnés
    for (const user of mentionedUsers) {
      await storage.createNotification(
        user.id,
        "mention",
        `${req.user!.username} vous a mentionné dans un commentaire`,
        comment.id
      );
    }

    // Créer une notification et l'envoyer en temps réel
    if (post && post.userId !== req.user!.id) {
      const notification = await storage.createNotification(
        post.userId,
        "comment",
        `${req.user!.username} a commenté votre post`,
        postId
      );
      app.locals.broadcastNotification(post.userId, notification);
    }

    // Award experience for commenting
    await storage.updateUserExperience(req.user!.id, 10);

    res.json(comment);
  });

  app.get("/api/posts/:postId/comments", async (req, res) => {
    const comments = await storage.getComments(parseInt(req.params.postId));
    res.json(comments);
  });

  // Likes
  app.post("/api/posts/:postId/likes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const postId = parseInt(req.params.postId);
    const post = await storage.getPost(postId);

    const liked = await storage.toggleLike(
      req.user!.id,
      postId,
    );

    if (liked && post && post.userId !== req.user!.id) {
      await storage.createNotification(
        post.userId,
        "like",
        `${req.user!.username} a aimé votre post`,
        postId
      );
    }

    if (liked) {
      await storage.updateUserExperience(req.user!.id, 5);
    }

    res.json({ liked });
  });

  app.get("/api/posts/:postId/likes", async (req, res) => {
    const count = await storage.getLikes(parseInt(req.params.postId));
    res.json({ count });
  });

  // Groups
  app.get("/api/groups", async (req, res) => {
    const groups = await storage.getGroups();
    res.json(groups);
  });

  app.post("/api/groups", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const group = await storage.createGroup(
      req.body.name,
      req.body.description,
      req.body.imageUrl,
      req.body.isPrivate,
    );
    res.json(group);
  });

  app.post("/api/groups/:groupId/join", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.joinGroup(req.user!.id, parseInt(req.params.groupId));
    res.sendStatus(200);
  });

  app.post("/api/groups/:groupId/leave", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.leaveGroup(req.user!.id, parseInt(req.params.groupId));
    res.sendStatus(200);
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Badges
  app.get("/api/badges", async (req, res) => {
    const badges = await storage.getBadges();
    res.json(badges);
  });

  app.get("/api/users/:userId/badges", async (req, res) => {
    const badges = await storage.getUserBadges(parseInt(req.params.userId));
    res.json(badges);
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const notifications = await storage.getNotifications(req.user!.id);
    res.json(notifications);
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.markNotificationAsRead(parseInt(req.params.id));
    res.sendStatus(200);
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteNotification(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // Messages
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const message = await storage.createMessage(
      req.user!.id,
      req.body.receiverId,
      req.body.content
    );
    res.json(message);
  });

  app.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const messages = await storage.getMessages(
      req.user!.id,
      parseInt(req.params.userId)
    );
    res.json(messages);
  });

  // Stories
  app.post("/api/stories", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const story = await storage.createStory(
      req.user!.id,
      req.body.content,
      req.body.imageUrl,
      expiresAt
    );
    res.json(story);
  });

  app.get("/api/stories", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const stories = await storage.getStories();
    res.json(stories);
  });

  app.post("/api/stories/:storyId/views", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.createStoryView(
      parseInt(req.params.storyId),
      req.user!.id
    );
    res.sendStatus(200);
  });


  // Upload de fichiers
  app.post("/api/upload", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];
    
    if (!file) return res.status(400).send("No file uploaded");

    const fileExt = path.extname(file.originalFilename || "");
    const fileName = `${Date.now()}${fileExt}`;
    
    try {
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
      res.status(500).send("Upload failed");
    }
  });

  const httpServer = createServer(app);
  setupWebSocket(httpServer, app);
  return httpServer;
}