-- ========================================================
-- Migrasi: keamanan sesi admin
-- Jalankan setelah 001_auth.sql dan 002_multi_role.sql:
--   psql "$DATABASE_URL" -f migrations/003_admin_session.sql
-- ========================================================

BEGIN;

-- Versi sesi admin. Setiap perubahan password atau "keluar dari semua
-- perangkat" menaikkan nilai ini sehingga cookie admin lama tidak berlaku.
-- Sumber utama akun ada di `users`; `admin_users` dipertahankan sebagai
-- kompatibilitas mundur.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;

COMMIT;
