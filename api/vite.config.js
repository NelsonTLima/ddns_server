// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      reporter: ["text", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "vite.config.js",
        "eslint.config.js",
        "**/index.js",
        "main.js",
        "src/config/",
      ],
    },
  },
});
