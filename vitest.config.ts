import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    testTimeout: 60000,
    env: {
      DATABASE_URL: "file:./test.db",
      NOTIFICATION_MODE: "demo",
      CALENDAR_PROVIDER: "local",
      ADMIN_SESSION_SECRET: "test-secret",
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
