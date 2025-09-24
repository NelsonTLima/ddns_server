import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    allowedHosts: [ "ddns.nelsontlima.com"],
  },
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "./src/assets/"),
      "@components": path.resolve(__dirname, "./src/components/"),
      "@common": path.resolve(__dirname, "./src/common/"),
      "@pages": path.resolve(__dirname, "./src/pages/"),
      "@router": path.resolve(__dirname, "./src/router/"),
    },
  },
});
