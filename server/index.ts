import express from "express";
import { createServer } from "http";
import { setupWebSocket } from "./websocket";
import { setupAuth } from "./auth";

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

setupAuth(app); // Intégrer Firebase Auth

setupWebSocket(server, app);

server.listen(process.env.PORT || 3000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
});
