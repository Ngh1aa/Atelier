import { defineConfig } from "vite";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));
const pages = Object.fromEntries(
  readdirSync(rootDirectory)
    .filter((file) => file.endsWith(".html"))
    .map((file) => [file.replace(/\.html$/, ""), resolve(rootDirectory, file)]),
);

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: pages,
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: [".manus.computer"],
  },
});
