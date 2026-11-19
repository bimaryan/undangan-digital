-- ========================================================
-- SKEMA BASIS DATA POSTGRESQL (undangan_db)
-- ========================================================

-- 1. Tabel Utama: undangan
CREATE TABLE IF NOT EXISTS undangan (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  nama_anak VARCHAR(255) NOT NULL,
  nama_orang_tua VARCHAR(255) NOT NULL,
  tanggal DATE NOT NULL,
  jam TIME WITHOUT TIME ZONE NOT NULL,
  lokasi TEXT NOT NULL,
  akses_token VARCHAR(255) NOT NULL,
  foto_cover TEXT,
  foto_acara TEXT,
  maps_url TEXT,
  hiburan TEXT,
  turut_mengundang JSONB DEFAULT '[]'::jsonb,
  orang_berbahagia JSONB DEFAULT '[]'::jsonb,
  rekening JSONB DEFAULT '[]'::jsonb,
  ayat TEXT,
  data_json JSONB DEFAULT '{}'::jsonb,
  token_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Token tuan rumah harus unik dan mudah dibagikan. token_version dipakai untuk
-- membatalkan sesi tuan rumah yang lama saat token dirotasi admin.
CREATE UNIQUE INDEX IF NOT EXISTS undangan_akses_token_unique
  ON undangan (LOWER(akses_token));

-- 1b. Akun admin (login email + password). Password disimpan sebagai hash
-- scrypt, dibuat lewat `npm run create-admin`. Tidak ada kredensial di kode.
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  session_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_lower_unique
  ON admin_users (LOWER(email));

-- Berkas foto dan musik dari panel admin. Disimpan di database agar tidak
-- hilang setelah redeploy atau restart server.
CREATE TABLE IF NOT EXISTS uploaded_media (
  id VARCHAR(64) PRIMARY KEY,
  undangan_id INTEGER NOT NULL REFERENCES undangan(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL CHECK (size > 0),
  content BYTEA NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Tabel Tamu: tamu
CREATE TABLE IF NOT EXISTS tamu (
  id SERIAL PRIMARY KEY,
  undangan_id INTEGER REFERENCES undangan(id) ON DELETE CASCADE,
  nama VARCHAR(255) NOT NULL,
  hadir BOOLEAN DEFAULT NULL,
  jumlah_orang INTEGER DEFAULT 1,
  ucapan TEXT,
  rsvp_at TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Konfirmasi Kehadiran: rsvp
CREATE TABLE IF NOT EXISTS rsvp (
  id SERIAL PRIMARY KEY,
  undangan_id INTEGER REFERENCES undangan(id) ON DELETE CASCADE,
  nama VARCHAR(255) NOT NULL,
  hadir BOOLEAN NOT NULL DEFAULT TRUE,
  ucapan TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Indeks untuk mempercepat panel admin & pencocokan RSVP per undangan.
CREATE INDEX IF NOT EXISTS tamu_undangan_idx ON tamu (undangan_id);
CREATE INDEX IF NOT EXISTS rsvp_undangan_idx ON rsvp (undangan_id);

-- Data Awal Contoh Undangan
-- Token di bawah hanya contoh. Ganti lewat panel /admin setelah login.
INSERT INTO undangan (
  id, slug, nama_anak, nama_orang_tua, tanggal, jam, lokasi, akses_token, hiburan, ayat, turut_mengundang, orang_berbahagia, rekening, data_json
) VALUES (
  1,
  'khitanan-zayyan-arkana-alfarizqi',
  'Zayyan Arkana Alfarizqi',
  'Bpk. Kastam - Ibu Sarinih',
  '2026-11-18',
  '08:00:00',
  'Desa Rambatan Kulon (Bangkir) Rt. 07 Rw. 01 blok Kangkung Kec. Lohbener Kab. Indramayu',
  'ganti-token-tuan-rumah',
  'Seni Reog Vikar Group',
  'Dizana zakaria memohon kepada Tuhannya ia berkata : Ya Tuhanku anugerahkanlah aku seorang anak yang baik dari sisimu, sesungguhnya engkau maha mendengar do''a',
  '[
    "Bpk. Sardi - Ibu Dariyah, Arahan Kidul",
    "Bpk. Salim - Ibu Sat, Bangkir Gg. Macan",
    "Bpk. Kusen, Alm. - Ibu Rofiah, Lobener Lor blok Masjid",
    "Bpk. H. Tanya, Karanggetas"
  ]'::jsonb,
  '[
    {
      "nama": "Bpk. KASTAM",
      "keterangan": "Bin Bpk. Rekiwan, Alm. - Ibu Minah, Almh.\n(Telukagung)"
    },
    {
      "nama": "Ibu SARINIH",
      "keterangan": "Binti Bpk. Kartam, Alm. - Ibu Sari, Almh.\n(Rambatan Kulon-Bangkir)"
    }
  ]'::jsonb,
  '[
    { "type": "bank", "label": "BCA", "no": "[NO. REKENING]", "name": "[NAMA PEMILIK]" },
    { "type": "bank", "label": "BRI", "no": "[NO. REKENING]", "name": "[NAMA PEMILIK]" },
    { "type": "bank", "label": "Mandiri", "no": "[NO. REKENING]", "name": "[NAMA PEMILIK]" },
    { "type": "bank", "label": "BNI", "no": "[NO. REKENING]", "name": "[NAMA PEMILIK]" },
    { "type": "bank", "label": "BSI", "no": "[NO. REKENING]", "name": "[NAMA PEMILIK]" },
    { "type": "wallet", "label": "DANA", "no": "[NO. HP]", "name": "[NAMA PEMILIK]" },
    { "type": "wallet", "label": "OVO", "no": "[NO. HP]", "name": "[NAMA PEMILIK]" },
    { "type": "wallet", "label": "GoPay", "no": "[NO. HP]", "name": "[NAMA PEMILIK]" }
  ]'::jsonb,
  '{
    "judul_sampul": "UNDANGAN",
    "tanggal_sampul": "Rabu, 18 November 2026",
    "label_acara": "Khitanan :",
    "tempat_singkat": "Rambatan Kulon, November 2026",
    "hari_acara": "Rabu malam Kamis",
    "tanggal_acara": "18 – 19 November 2026",
    "jam_acara": "Pkl. 08.00 Wib s/d Selesai",
    "sekeluarga": "Sekeluarga",
    "alamat_keluarga": "Desa Rambatan Kulon (Bangkir) Rt. 07 Rw. 01\nblok Kangkung Kec. Lohbener\nKab. Indramayu",
    "footer_text": "Terima kasih atas do''a restu Bapak/Ibu/Saudara/i"
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

