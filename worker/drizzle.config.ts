import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/models.ts",
  out: "./migrations",
  dbCredentials: {
    url: ":memory:",
  },
});
