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

## Autentikasi & Multi-Role

Proyek ini memakai tiga jenis akses:

1. **Admin** — login dengan email + password di `/login`. Memiliki akses
   penuh: mengelola semua undangan, membuat akun client/tenant, dan menugaskan
   undangan ke tenant.
2. **Client / Tenant** — mendaftar sendiri di `/register` atau dibuat oleh
   admin, lalu login di `/login` dan diarahkan ke `/dashboard`. Hanya dapat
   melihat dan mengelola undangan miliknya sendiri (isi undangan, tamu, RSVP,
   dan tautan tuan rumah). Pendaftaran publik selalu membuat akun `tenant`.
3. **Tuan rumah** — membuka tautan akses per undangan (token), lalu sesi disimpan
   di cookie `httpOnly`. Tuan rumah hanya bisa mengelola tamu/RSVP, bukan isi
   undangan atau token.

Tidak ada token yang di-hardcode di kode. Token tuan rumah diatur oleh admin atau
tenant pemilik undangan di panel editor dan disimpan di kolom
`undangan.akses_token`.

### 1. Siapkan database

Untuk database baru, import `schema.sql`. Untuk database yang sudah berjalan,
jalankan migrasi secara berurutan:

```bash
psql "$DATABASE_URL" -f migrations/001_auth.sql
psql "$DATABASE_URL" -f migrations/002_multi_role.sql
```

Migrasi `001` menambahkan tabel auth lama, kolom `undangan.token_version`, indeks
unik token, dan indeks relasi tamu/RSVP. Migrasi `002` membuat tabel `users`
(admin & tenant), memindahkan akun `admin_users`, dan menambahkan kolom
`undangan.user_id` sebagai pemilik undangan.

### 2. Buat akun admin

```bash
npm run create-admin -- admin@domain.com "password-ku"
```

Atau tanpa argumen (interaktif):

```bash
npm run create-admin
```

Password disimpan sebagai hash scrypt. Password minimal 8 karakter.

### 3. Buat akun client / tenant

Client dapat mendaftar sendiri di `/register` (nama, email, kata sandi minimal
8 karakter). Akun baru langsung masuk ke `/dashboard` dengan role `tenant`.

Lewat panel admin: buka `/admin` → **Kelola Client** → **Tambah Client Baru**.

Atau lewat CLI:

```bash
npm run create-tenant -- client@domain.com "password-ku" "Nama Client"
```

Setelah akun dibuat, tugaskan undangan ke client dari editor undangan
(**Pemilik Undangan**) atau saat membuat undangan baru. Client kemudian dapat
login dan mengelola undangannya dari `/dashboard`.

### 4. Atur token tuan rumah

1. Login ke `/dashboard` (area client / tenant).
2. Pada bagian **Identitas Sampul**, atur judul sampul, tanggal, nama anak, label acara,
   nama orang tua, dan teks penutup keluarga.
3. Simpan perubahan.

Tidak ada lagi fitur token akses tuan rumah — manajemen tamu & RSVP kini
langsung dari halaman `/dashboard/tamu`.

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
