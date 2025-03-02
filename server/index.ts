import express from "express";
import path from "path";

const app = express();
const __dirname = path.resolve();

// Servir les fichiers du frontend
app.use(express.static(path.join(__dirname, "client", "dist")));

// Renvoyer index.html pour toutes les routes non API
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
