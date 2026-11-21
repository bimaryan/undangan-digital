#!/usr/bin/env node
/**
 * Membuat akun client / tenant baru.
 *
 * Pemakaian:
 *   node --env-file-if-exists=.env.local scripts/create-tenant.mjs client@domain.com "password-ku" "Nama Tenant"
 */
import { randomBytes, scryptSync } from "node:crypto";
import readline from "node:readline/promises";
import process from "node:process";
import pg from "pg";

const { Client } = pg;

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function createClientConfig() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (connectionString) {
    return {
      connectionString,
      ssl:
        process.env.DB_SSL === "true" ||
        (process.env.NODE_ENV === "production" && !connectionString.includes("localhost"))
          ? { rejectUnauthorized: false }
          : undefined,
    };
  }

  return {
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "root",
    database: process.env.PGDATABASE || "undangan_db",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  };
}

async function askHidden(question) {
  process.stdout.write(question);
  const stdin = process.stdin;
  const wasRaw = stdin.isRaw;
  stdin.setRawMode?.(true);
  stdin.resume();

  return new Promise((resolve) => {
    let password = "";
    function onData(chunk) {
      const char = chunk.toString("utf8");
      if (char === "\n" || char === "\r" || char === "\u0004") {
        stdin.removeListener("data", onData);
        stdin.setRawMode?.(wasRaw);
        process.stdout.write("\n");
        resolve(password);
      } else if (char === "\u0003") {
        process.exit(130);
      } else if (char === "\u007f" || char === "\b") {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write("\b \b");
        }
      } else {
        password += char;
        process.stdout.write("*");
      }
    }
    stdin.on("data", onData);
  });
}

async function main() {
  const [, , argEmail, argPassword, argName] = process.argv;
  let email = (argEmail || "").trim().toLowerCase();
  let password = argPassword || "";
  let name = argName || "";

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    if (!email) {
      email = (await rl.question("Email tenant: ")).trim().toLowerCase();
    }
    if (!name) {
      name = (await rl.question("Nama tenant / nama pengantin: ")).trim();
    }
    if (!password) {
      rl.close();
      password = await askHidden("Password tenant (tidak ditampilkan): ");
    }
  } finally {
    rl.close();
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email tidak valid.");
  }
  if (password.length < 8) {
    throw new Error("Password minimal 8 karakter.");
  }

  const client = new Client(createClientConfig());
  await client.connect();

  try {
    const hash = hashPassword(password);
    const result = await client.query(
      `INSERT INTO users (email, password_hash, role, name)
       VALUES ($1, $2, 'tenant', $3)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name
       RETURNING id, email, name, role`,
      [email, hash, name || email.split("@")[0]]
    );

    console.log(`\nAkun client/tenant siap: ${result.rows[0].email} (${result.rows[0].name})`);
    console.log("Tenant dapat login di /login untuk mengelola undangan miliknya.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("\nGagal membuat akun tenant:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
