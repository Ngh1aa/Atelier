import { defineConfig } from "vite";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const htmlInputs = Object.fromEntries(
  readdirSync(process.cwd())
    .filter((file) => file.endsWith(".html"))
    .map((file) => [file.replace(/\.html$/, ""), resolve(process.cwd(), file)])
);

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: htmlInputs,
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: [".manus.computer"],
  },
});
