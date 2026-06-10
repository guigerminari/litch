import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "assets/brand/favicon.png",
        "assets/brand/litch-logo-square-512x512.png",
        "assets/brand/litch-circle-400x400.png"
      ],
      manifest: {
        name: "Litch RPG",
        short_name: "Litch",
        description: "MMORPG de batalha, masmorras, arena e progressao em tempo real.",
        theme_color: "#12141f",
        background_color: "#12141f",
        display: "standalone",
        start_url: "/",
        scope: "/",
        lang: "pt-BR",
        icons: [
          {
            src: "assets/brand/litch-logo-square-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "assets/brand/litch-circle-400x400.png",
            sizes: "400x400",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "assets/brand/favicon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/socket.io": {
        target: "http://127.0.0.1:3001",
        ws: true,
        changeOrigin: true
      }
    }
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: [".loca.lt"],
    proxy: {
      "/socket.io": {
        target: "http://127.0.0.1:3001",
        ws: true,
        changeOrigin: true
      }
    }
  }
});
