import type { MigrationConfig } from "drizzle-orm/migrator";

type APIConfig = {
  fileserverHits: number;
  platform: string;
};

type DBConfig = {
  url: string,
  migrationConfig: MigrationConfig,
}

type Config = {
  api: APIConfig;
  db: DBConfig;
  secret: string;
};

process.loadEnvFile();

function envOrThrow(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};


export const config : Config = {
  api: {
    fileserverHits: 0,
    platform : envOrThrow("PLATFORM")
  },
  db: {
    url:  envOrThrow("DB_URL"),
    migrationConfig: migrationConfig
  },
  secret: envOrThrow("JWT_SECRET")
};

