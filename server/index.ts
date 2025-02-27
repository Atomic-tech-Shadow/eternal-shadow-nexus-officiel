import express from "express";
import { createServer } from "http";
import { setupWebSocket } from "./websocket";
import { setupAuth } from "./auth";

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

setupAuth(app);
setupWebSocket(server, app);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
