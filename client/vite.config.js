import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    host: "0.0.0.0",
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "::1",
      "*vercel.app",
      "www.jankaritag.in",
      "jankaritag.in",
    ],
  },
});
