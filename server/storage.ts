import { User, Post, Comment, Like, InsertUser, Group, Badge, Category, Notification } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserExperience(userId: number, amount: number): Promise<User>;

  // Post operations
  createPost(userId: number, content: string, categoryId: number, imageUrl?: string, isProject?: boolean): Promise<Post>;
  getPosts(categoryId?: number): Promise<(Post & { user: User })[]>;
  getPost(id: number): Promise<(Post & { user: User }) | undefined>;

  // Social interactions
  createComment(userId: number, postId: number, content: string): Promise<Comment>;
  getComments(postId: number): Promise<(Comment & { user: User })[]>;
  toggleLike(userId: number, postId: number): Promise<boolean>;
  getLikes(postId: number): Promise<number>;

  // Groups
  createGroup(name: string, description: string, imageUrl?: string, isPrivate?: boolean): Promise<Group>;
  getGroups(): Promise<Group[]>;
  joinGroup(userId: number, groupId: number): Promise<void>;
  leaveGroup(userId: number, groupId: number): Promise<void>;

  // Badges
  getBadges(): Promise<Badge[]>;
  getUserBadges(userId: number): Promise<Badge[]>;
  awardBadge(userId: number, badgeId: number): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(name: string, type: 'anime' | 'tech', description?: string): Promise<Category>;

  getRecommendedPosts(categoryId?: number): Promise<(Post & { user: User })[]>;

  // Notifications
  createNotification(userId: number, type: string, content: string, relatedId: number): Promise<Notification>;
  getNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  deleteNotification(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private likes: Map<number, Like>;
  private groups: Map<number, Group>;
  private badges: Map<number, Badge>;
  private categories: Map<number, Category>;
  private userBadges: Map<string, number>; // userId-badgeId -> earnedAt
  private groupMembers: Map<string, boolean>; // userId-groupId -> isAdmin
  private currentId: number;
  private notifications: Map<number, Notification>;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.groups = new Map();
    this.badges = new Map();
    this.categories = new Map();
    this.userBadges = new Map();
    this.groupMembers = new Map();
    this.currentId = 1;
    this.notifications = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Ajouter des catégories par défaut
    this.initializeDefaultCategories();
  }

  private async initializeDefaultCategories() {
    await this.createCategory("Anime & Manga", "anime", "Discussions sur les animes et mangas");
    await this.createCategory("Développement Web", "tech", "Projets et discussions web");
    await this.createCategory("Intelligence Artificielle", "tech", "IA et Machine Learning");
    await this.createCategory("Cybersécurité", "tech", "Sécurité informatique");
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, profilePic: null, bio: null };
    this.users.set(id, user);
    return user;
  }

  async updateUserExperience(userId: number, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    user.experience += amount;
    // Level up logic (simplified)
    if (user.experience >= user.level * 1000) {
      user.level += 1;
    }

    this.users.set(userId, user);
    return user;
  }

  async createPost(userId: number, content: string, categoryId: number, imageUrl?: string, isProject?: boolean): Promise<Post> {
    const id = this.currentId++;
    const post: Post = {
      id,
      userId,
      content,
      categoryId,
      imageUrl: imageUrl || null,
      isProject: isProject || false,
      createdAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async getPosts(categoryId?: number): Promise<(Post & { user: User })[]> {
    let posts = Array.from(this.posts.values());
    if (categoryId) {
      posts = posts.filter(post => post.categoryId === categoryId);
    }
    return posts
      .map((post) => ({
        ...post,
        user: this.users.get(post.userId)!,
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPost(id: number): Promise<(Post & { user: User }) | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    return {
      ...post,
      user: this.users.get(post.userId)!,
    };
  }

  async createComment(userId: number, postId: number, content: string): Promise<Comment> {
    const id = this.currentId++;
    const comment: Comment = {
      id,
      userId,
      postId,
      content,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getComments(postId: number): Promise<(Comment & { user: User })[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.postId === postId)
      .map((comment) => ({
        ...comment,
        user: this.users.get(comment.userId)!,
      }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async toggleLike(userId: number, postId: number): Promise<boolean> {
    const existingLike = Array.from(this.likes.values()).find(
      (like) => like.userId === userId && like.postId === postId,
    );

    if (existingLike) {
      this.likes.delete(existingLike.id);
      return false;
    }

    const id = this.currentId++;
    this.likes.set(id, { id, userId, postId });
    return true;
  }

  async getLikes(postId: number): Promise<number> {
    return Array.from(this.likes.values()).filter(
      (like) => like.postId === postId,
    ).length;
  }

  async createGroup(name: string, description: string, imageUrl?: string, isPrivate = false): Promise<Group> {
    const id = this.currentId++;
    const group: Group = {
      id,
      name,
      description,
      imageUrl: imageUrl || null,
      isPrivate,
      createdAt: new Date(),
    };
    this.groups.set(id, group);
    return group;
  }

  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }

  async joinGroup(userId: number, groupId: number): Promise<void> {
    this.groupMembers.set(`${userId}-${groupId}`, false);
  }

  async leaveGroup(userId: number, groupId: number): Promise<void> {
    this.groupMembers.delete(`${userId}-${groupId}`);
  }

  async getBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async getUserBadges(userId: number): Promise<Badge[]> {
    const userBadgeIds = Array.from(this.userBadges.entries())
      .filter(([key]) => key.startsWith(`${userId}-`))
      .map(([key]) => parseInt(key.split('-')[1]));

    return userBadgeIds.map(id => this.badges.get(id)!);
  }

  async awardBadge(userId: number, badgeId: number): Promise<void> {
    this.userBadges.set(`${userId}-${badgeId}`, Date.now());
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(name: string, type: 'anime' | 'tech', description?: string): Promise<Category> {
    const id = this.currentId++;
    const category: Category = {
      id,
      name,
      type,
      description: description || null,
    };
    this.categories.set(id, category);
    return category;
  }

  async getRecommendedPosts(categoryId?: number): Promise<(Post & { user: User })[]> {
    // Dans cette implémentation simple, nous allons:
    // 1. Filtrer par catégorie si spécifiée
    // 2. Trier par nombre de likes
    let posts = Array.from(this.posts.values());

    if (categoryId) {
      posts = posts.filter(post => post.categoryId === categoryId);
    }

    // Pour chaque post, compter les likes
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        user: this.users.get(post.userId)!,
        likeCount: await this.getLikes(post.id),
      }))
    );

    // Trier par nombre de likes décroissant
    return postsWithLikes
      .sort((a, b) => b.likeCount - a.likeCount)
      .map(({ likeCount, ...post }) => post);
  }

  async createNotification(userId: number, type: string, content: string, relatedId: number): Promise<Notification> {
    const id = this.currentId++;
    const notification: Notification = {
      id,
      userId,
      type,
      content,
      relatedId,
      read: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifications.set(id, notification);
    }
  }

  async deleteNotification(id: number): Promise<void> {
    this.notifications.delete(id);
  }
}

export const storage = new MemStorage();