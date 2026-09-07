import { defineConfig } from "vite";
import { readdirSync, readFileSync } from "node:fs";
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
  plugins: [{
    name: "atelier-runtime-catalogue",
    apply: "build",
    generateBundle() {
      // Commerce fetches these stable URLs at runtime; HTML imports alone do
      // not include the JSON or every dynamically selected product image.
      const catalogue = readFileSync(resolve(rootDirectory, "src/data/products.json"));
      this.emitFile({ type: "asset", fileName: "src/data/products.json", source: catalogue });
      const products = JSON.parse(catalogue.toString("utf8"));
      const media = new Set(products.flatMap(({ images = [], fallback }) => [...images, fallback].filter(Boolean)));
      for (const asset of media) {
        const fileName = asset.replace(/^\.\//, "");
        this.emitFile({ type: "asset", fileName, source: readFileSync(resolve(rootDirectory, fileName)) });
      }
    },
  }],
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
