import { Pool, PoolConfig } from "pg";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const config: PoolConfig = connectionString
  ? {
      connectionString,
      ssl:
        process.env.DB_SSL === "true" ||
        (process.env.NODE_ENV === "production" && !connectionString.includes("localhost"))
          ? { rejectUnauthorized: false }
          : undefined,
    }
  : {
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "root",
      database: process.env.PGDATABASE || "undangan_db",
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    };

const pool = new Pool(config);

export default pool;