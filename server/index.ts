import express from "express";
import { createServer } from "http";
import cors from "cors"; // Ajout de CORS
import { setupWebSocket } from "./websocket";
import { setupAuth } from "./auth";

const app = express();
const server = createServer(app);

// 🔥 Autoriser le frontend à accéder au backend
const FRONTEND_URL = "https://eternal-shadow-nexus-officiel-1.onrender.com";
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

setupAuth(app);
setupWebSocket(server, app);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
