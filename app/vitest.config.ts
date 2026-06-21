import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

const moneyjsRoot = process.env.MONEYJS_ROOT
  ? path.resolve(process.env.MONEYJS_ROOT)
  : fileURLToPath(new URL("../moneyjs", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@sfcr/core": path.join(moneyjsRoot, "packages/core/src/index.ts"),
      "@sfcr/notebook-core": path.join(moneyjsRoot, "packages/notebook-core/src/index.ts"),
      "@web": path.join(moneyjsRoot, "packages/web/src")
    }
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.{ts,mjs}"]
  }
});
