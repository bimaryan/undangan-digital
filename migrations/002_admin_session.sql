-- ========================================================
-- Migrasi: keamanan sesi admin
-- Jalankan setelah 001_auth.sql:
--   psql "$DATABASE_URL" -f migrations/002_admin_session.sql
-- ========================================================

BEGIN;

-- Versi sesi admin. Setiap perubahan password atau "keluar dari semua
-- perangkat" menaikkan nilai ini sehingga cookie admin lama tidak berlaku.
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;

COMMIT;
