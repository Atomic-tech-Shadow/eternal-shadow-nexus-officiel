import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Charge les variables d'environnement

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Définir le port en utilisant la variable d'environnement ou 3000 par défaut
const PORT = process.env.PORT || 3000;

// Route de test
app.get("/", (req, res) => {
  res.send("🚀 Serveur en ligne !");
});

// Démarrer le serveur
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
});
