import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    // Unit tests live next to the code. e2e/ belongs to Playwright, whose `test` Vitest can't run.
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
