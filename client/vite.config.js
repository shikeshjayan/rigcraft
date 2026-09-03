import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Injects a Content-Security-Policy into the built index.html only.
// Dev mode is intentionally untouched so HMR / React Refresh keep working.
const cspPlugin = () => ({
  name: "rigcraft-csp",
  apply: "build",
  transformIndexHtml(html) {
    const policy = [
      "default-src 'self'",
      // Any VITE_*/runtime JS ships from self; Google OAuth and Razorpay
      // inject their own <script> tags at runtime.
      "script-src 'self' https://accounts.google.com https://checkout.razorpay.com",
      // MUI/emotion + framer-motion inject inline styles at runtime.
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' ws: wss: https: http://localhost:*",
      "frame-src https://accounts.google.com https://checkout.razorpay.com",
    ].join("; ");
    return {
      html,
      tags: [
        {
          tag: "meta",
          attrs: { "http-equiv": "Content-Security-Policy", content: policy },
          injectTo: "head-prepend",
        },
      ],
    };
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cspPlugin()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@mui/x-data-grid")) return "mui-data-grid";
            if (id.includes("@mui/icons-material")) return "mui-icons";
            if (id.includes("@mui/material") || id.includes("@emotion")) return "mui";
            if (id.includes("socket.io") || id.includes("engine.io")) return "socketio";
            if (id.includes("@google/generative-ai")) return "gemini";
            if (id.includes("framer-motion")) return "framer";
            if (id.includes("react-phone-number-input") || id.includes("libphonenumber")) return "phone";
            if (id.includes("@tanstack/react-query")) return "react-query";
            if (id.includes("react-router")) return "router";
            if (id.includes("react-hook-form") || id.includes("@hookform")) return "forms";
            if (id.includes("zod")) return "zod";
          }
        },
      },
    },
  },
});