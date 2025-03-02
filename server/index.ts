import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000; // Utilise le port défini par Render

app.get("/", (req, res) => {
  res.send("🚀 Serveur en ligne !");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
});
