// prisma.config.ts

import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url: "postgresql://postgres:postgres@localhost:5432/kasir_sembako?schema=public",
  },
  migrations: {
    path: "./prisma/migrations",
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} ./prisma/seed.ts",
  },
});