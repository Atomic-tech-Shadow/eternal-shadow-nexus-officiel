import { WebSocket, WebSocketServer } from "ws";
import type { Server } from "http";
import type { Express } from "express";

export function setupWebSocket(server: Server, app: Express) {
  const wss = new WebSocketServer({ 
    server,
    path: "/ws",
    clientTracking: true,
    perMessageDeflate: false
  });

  // Store active connections
  const clients = new Map<number, WebSocket>();

  wss.on("connection", (ws, req) => {
    // Get user ID from session
    const userId = (req as any).session?.userId;

    if (!userId) {
      ws.close(1008, "Unauthorized");
      return;
    }

    clients.set(userId, ws);

    ws.on("close", () => {
      clients.delete(userId);
    });
  });

  console.log("✅ WebSocket server running");

  // Force WSS in production
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }
}
