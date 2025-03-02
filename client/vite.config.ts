import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async () => {
  const plugins = [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
  ];

  // Ajoute le plugin Cartographer uniquement en développement sur Replit
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return defineConfig({
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),  // Corrige l’alias pour `src/`
        "@shared": path.resolve(__dirname, "..", "shared"),  // Corrige l’alias pour `shared/`
      },
    },
    root: __dirname,  // Définit la racine à `client/`
    build: {
      outDir: path.resolve(__dirname, "dist"), // Sortie dans "client/dist"
      emptyOutDir: true,
    },
    server: {
      proxy: process.env.NODE_ENV === "development" ? {
        "/api": {
          target: "http://localhost:3000",  // En dev, le backend tourne localement
          changeOrigin: true,
          secure: false,
        },
      } : undefined, // Désactive le proxy en production
    },
  });
};
