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

  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return defineConfig({
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
      },
    },
    root: path.resolve(__dirname, "client"),  // Le dossier racine "client"
    build: {
      outDir: path.resolve(__dirname, "dist"),  // Dossier de sortie "dist"
      emptyOutDir: true,
    },
    server: {
      proxy: {
        "/api": {
          target: "https://eternal-shadow-nexus-officiel.onrender.com",  // URL de ton backend
          changeOrigin: true,
          secure: false,  // Utilisé si tu n'as pas de certificat SSL valide (change à `true` si tu as SSL)
        },
      },
    },
  });
};
