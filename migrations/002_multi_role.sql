-- ========================================================
-- Migrasi: Multi-Role (Admin, Client / Tenant, Host)
-- ========================================================

BEGIN;

-- 1. Tabel users untuk menampung Admin & Client/Tenant
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'tenant', -- 'admin' | 'tenant'
  name VARCHAR(255),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
  ON users (LOWER(email));

-- 2. Migrasikan akun dari admin_users ke users jika ada
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    INSERT INTO users (email, password_hash, role, name, created_at)
    SELECT email, password_hash, 'admin', 'Administrator', created_at
    FROM admin_users
    ON CONFLICT (LOWER(email)) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = 'admin';
  END IF;
END $$;

-- 3. Tambahkan kolom user_id pada tabel undangan sebagai pemilik (tenant)
ALTER TABLE undangan
  ADD COLUMN IF NOT EXISTS user_id INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'undangan_user_id_fkey'
  ) THEN
    ALTER TABLE undangan
      ADD CONSTRAINT undangan_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS undangan_user_id_idx ON undangan (user_id);

COMMIT;
