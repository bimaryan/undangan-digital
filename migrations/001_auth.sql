-- ========================================================
-- Migrasi: login admin + token tuan rumah yang dikelola admin
-- Jalankan sekali pada database yang sudah berisi data:
--   psql "$DATABASE_URL" -f migrations/001_auth.sql
-- ========================================================

BEGIN;

-- Versi token dipakai untuk membatalkan sesi tuan rumah lama saat rotasi.
ALTER TABLE undangan
  ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 1;

-- Token tuan rumah unik agar tidak bisa dipakai untuk dua undangan.
CREATE UNIQUE INDEX IF NOT EXISTS undangan_akses_token_unique
  ON undangan (LOWER(akses_token));

-- Akun admin. Password di-hash oleh `npm run create-admin`.
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_lower_unique
  ON admin_users (LOWER(email));

-- Indeks untuk panel admin & pencocokan RSVP.
CREATE INDEX IF NOT EXISTS tamu_undangan_idx ON tamu (undangan_id);
CREATE INDEX IF NOT EXISTS rsvp_undangan_idx ON rsvp (undangan_id);

COMMIT;
