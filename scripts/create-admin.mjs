#!/usr/bin/env node
/**
 * Membuat atau mengganti akun admin.
 *
 * Pemakaian:
 *   npm run create-admin -- admin@domain.com "password-ku"
 *   ADMIN_EMAIL=admin@domain.com ADMIN_PASSWORD="password-ku" npm run create-admin
 *
 * Jika argumen tidak diberikan, script akan menanyakannya secara interaktif.
 * Password disimpan sebagai hash scrypt, bukan teks biasa.
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

  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    let value = "";

    const cleanup = () => {
      stdin.removeListener("data", onData);
      stdin.setRawMode?.(wasRaw ?? false);
      stdin.pause();
      process.stdout.write("\n");
    };

    const onData = (chunk) => {
      const text = chunk.toString("utf8");
      for (const char of text) {
        if (char === "\r" || char === "\n") {
          cleanup();
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          cleanup();
          reject(new Error("Dibatalkan."));
          return;
        }
        if (char === "\u007f" || char === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        value += char;
        process.stdout.write("*");
      }
    };

    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

async function main() {
  const [, , argEmail, argPassword] = process.argv;
  let email = (argEmail || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  let password = argPassword || process.env.ADMIN_PASSWORD || "";

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    if (!email) {
      email = (await rl.question("Email admin: ")).trim().toLowerCase();
    }
    if (!password) {
      rl.close();
      password = await askHidden("Password admin (tidak ditampilkan): ");
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
    const result = await client.query(
      `INSERT INTO admin_users (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         session_version = admin_users.session_version + 1
       RETURNING email`,
      [email, hashPassword(password)]
    );

    console.log(`\nAkun admin siap: ${result.rows[0].email}`);
    console.log("Login di /admin/login. Jangan simpan password di dalam kode atau repository.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("\nGagal membuat akun admin:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
