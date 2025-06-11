import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: "client",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
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
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
