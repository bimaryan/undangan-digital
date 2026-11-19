# Undangan Digital

Aplikasi undangan pernikahan/khitanan berbasis Next.js + PostgreSQL.

## Menjalankan Proyek

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
# isi DATABASE_URL / PGHOST dkk. dan AUTH_SECRET
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Autentikasi

Proyek ini memakai dua jenis akses:

1. **Admin** — login dengan email + password di `/admin/login`.
2. **Tuan rumah** — membuka tautan akses per undangan (token), lalu sesi disimpan
   di cookie `httpOnly`. Tuan rumah hanya bisa mengelola tamu/RSVP, bukan isi
   undangan atau token.

Tidak ada token yang di-hardcode di kode. Token tuan rumah diatur oleh admin di
panel `/admin` dan disimpan di kolom `undangan.akses_token`.

### 1. Siapkan database

Untuk database baru, import `schema.sql`. Untuk database yang sudah berjalan,
jalankan migrasi sekali:

```bash
psql "$DATABASE_URL" -f migrations/001_auth.sql
psql "$DATABASE_URL" -f migrations/002_admin_session.sql
```

Migrasi 001 menambahkan tabel `admin_users`, kolom `undangan.token_version`,
indeks unik token, dan indeks relasi tamu/RSVP. Migrasi 002 menambahkan
`admin_users.session_version` untuk membatalkan sesi admin lama.

### 2. Buat akun admin

```bash
npm run create-admin -- admin@domain.com "password-ku"
```

Atau tanpa argumen (interaktif):

```bash
npm run create-admin
```

Password disimpan sebagai hash scrypt. Password minimal 8 karakter. Menjalankan
ulang perintah untuk email yang sama akan mengganti password dan mengakhiri
semua sesi admin lama.

### 3. Ubah password dari panel

Buka `/admin/akun` dari sidebar editor. Halaman ini meminta password saat ini,
lalu mengganti password dan mengeluarkan semua sesi admin di perangkat lain.
Tersedia juga tombol **Keluar dari semua perangkat**.

### 4. Atur token tuan rumah

1. Login ke `/admin`.
2. Pada bagian **Token Akses Tuan Rumah**, isi token (6–32 karakter, huruf kecil,
   angka, `-`, `_`) atau klik **Token Baru**.
3. Klik **Simpan Perubahan**.
4. Salin **Link Tuan Rumah** dan kirim ke tuan rumah.

Tautan berbentuk `/admin/u/<slug>?token=<token>`. Saat dibuka, token ditukar
menjadi cookie sesi lalu URL dibersihkan. Mengganti token akan otomatis
mengakhiri sesi tuan rumah yang lama.

## Environment Penting

- `AUTH_SECRET` — wajib, minimal 32 karakter, untuk menandatangani cookie sesi.
- `DATABASE_URL` **atau** `PGHOST`/`PGPORT`/`PGUSER`/`PGPASSWORD`/`PGDATABASE`.
- `NEXT_PUBLIC_FIXED_SLUG` — slug default saat membuka `/` (hanya redirect,
  bukan kredensial).

Lihat `.env.example` untuk daftar lengkap.

## Build

```bash
npm run build
npm start
```
