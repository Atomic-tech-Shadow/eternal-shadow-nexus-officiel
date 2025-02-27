import express from "express";
import { setupAuth } from "./auth.js";

const app = express();

setupAuth(app);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
