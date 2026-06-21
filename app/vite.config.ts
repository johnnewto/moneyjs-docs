import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

const moneyjsRoot = process.env.MONEYJS_ROOT
  ? path.resolve(process.env.MONEYJS_ROOT)
  : fileURLToPath(new URL("../moneyjs", import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@sfcr/core": path.join(moneyjsRoot, "packages/core/src/index.ts"),
      "@sfcr/notebook-core": path.join(moneyjsRoot, "packages/notebook-core/src/index.ts"),
      "@web": path.join(moneyjsRoot, "packages/web/src")
    }
  },
  base: command === "serve" ? "/" : process.env.VITE_BASE_PATH ?? "/"
}));
