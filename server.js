import express from "express";
import path from "path";
import cors from "cors";

const app = express();

// Middleware CORS (si ton frontend et backend sont séparés)
app.use(cors());

// Définir le dossier contenant le frontend compilé
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "client", "dist")));

// Servir le frontend pour toutes les routes non API
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
