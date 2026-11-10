import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base relativa: o mesmo build funciona na Vercel (raiz) e no GitHub Pages
// (/nome-do-repo/), porque o site é uma página única sem rotas.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["recharts"],
          motion: ["framer-motion"],
        },
      },
    },
  },
  test: { environment: "node" },
});
