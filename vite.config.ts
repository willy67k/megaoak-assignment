import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue(), vueDevTools(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    base: env.VITE_BASE_URL,
    server:
      mode === "development"
        ? {
            host: "0.0.0.0",
            https: {
              key: fs.readFileSync("./localhost+2-key.pem"),
              cert: fs.readFileSync("./localhost+2.pem"),
            },
          }
        : undefined,
  };
});
