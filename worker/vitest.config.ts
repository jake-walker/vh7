import path from "node:path";
import { defineWorkersProject, readD1Migrations } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersProject(async () => {
  const migrationsPath = path.join(__dirname, "migrations");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    test: {
      setupFiles: ["./test/apply-migrations.ts"],
      poolOptions: {
        singleWorker: true,
        workers: {
          wrangler: {
            configPath: "../wrangler.jsonc",
          },
          miniflare: {
            bindings: {
              MIGRATIONS: migrations,
            },
            compatabilityFlags: ["service_binding_extra_handlers"]
          },
        },
      },
    },
  };
});
