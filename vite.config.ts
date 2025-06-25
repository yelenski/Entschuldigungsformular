import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: '/',
  root: "client",
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "client/src"),
    },
  },
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "https://entschuldigungsformular-backend.onrender.com",
  //       changeOrigin: true,
  //       secure: true,
  //     },
  //   },
  // },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
});
