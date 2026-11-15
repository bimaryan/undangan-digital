import pool from "./db";

export async function getUndanganBySlug(slug: string) {
  const res = await pool.query("SELECT * FROM undangan WHERE slug = $1", [slug]);
  return res.rows[0] || null;
}

export async function getUndanganByToken(token: string) {
  const res = await pool.query("SELECT * FROM undangan WHERE akses_token = $1", [token]);
  return res.rows[0] || null;
}

export async function getAllUndangan() {
  const res = await pool.query("SELECT * FROM undangan ORDER BY created_at DESC");
  return res.rows;
}

export async function createUndangan(data: {
  slug: string;
  nama_anak: string;
  nama_orang_tua: string;
  tanggal: string;
  jam: string;
  lokasi: string;
}) {
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const res = await pool.query(
    `INSERT INTO undangan (slug, nama_anak, nama_orang_tua, tanggal, jam, lokasi, akses_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [data.slug, data.nama_anak, data.nama_orang_tua, data.tanggal, data.jam, data.lokasi, token]
  );
  return res.rows[0];
}

export async function attachUploadedMedia(
  undanganId: number,
  field: "foto_cover" | "foto_acara" | "musik",
  url: string
) {
  if (field === "foto_cover") {
    await pool.query(
      "UPDATE undangan SET foto_cover = $1 WHERE id = $2",
      [url, undanganId]
    );
    return;
  }

  if (field === "foto_acara") {
    await pool.query(
      "UPDATE undangan SET foto_acara = $1 WHERE id = $2",
      [url, undanganId]
    );
    return;
  }

  // Musik disimpan di JSON karena metadata lagu (judul dan titik loop) juga
  // berada di sana. URL disimpan segera setelah upload agar tetap ada walau
  // admin me-refresh sebelum menekan tombol Simpan keseluruhan formulir.
  await pool.query(
    `UPDATE undangan
     SET data_json = jsonb_set(
       jsonb_set(COALESCE(data_json, '{}'::jsonb), '{musik_url}', to_jsonb($1::text), true),
       '{musik_disabled}',
       'false'::jsonb,
       true
     )
     WHERE id = $2`,
    [url, undanganId]
  );
}

export async function updateUndanganLengkap(id: number, body: Record<string, unknown>) {
  // `data_json` ikut ada di payload admin sebagai nilai lama dari database.
  // Terapkan lebih dulu agar nilai form terbaru di bawahnya (termasuk URL musik
  // hasil upload) tidak tertimpa lagi saat disimpan.
  const previousDataJson =
    typeof body.data_json === "object" && body.data_json !== null
      ? (body.data_json as Record<string, unknown>)
      : {};

  const dataJson = {
    ...previousDataJson,
    judul_sampul: body.judul_sampul || "UNDANGAN",
    tanggal_sampul: body.tanggal_sampul || "Rabu, 18 November 2026",
    label_acara: body.label_acara || "Khitanan :",
    tempat_singkat: body.tempat_singkat || "Rambatan Kulon, November 2026",
    hari_acara: body.hari_acara || "Rabu malam Kamis",
    tanggal_acara: body.tanggal_acara || "18 – 19 November 2026",
    jam_acara: body.jam_acara || "Pkl. 08.00 Wib s/d Selesai",
    sekeluarga: body.sekeluarga || "Sekeluarga",
    alamat_keluarga: body.alamat_keluarga || "",
    footer_text: body.footer_text || "Terima kasih atas do'a restu Bapak/Ibu/Saudara/i",
    musik_url: body.musik_url || "",
    musik_judul: body.musik_judul || "",
    musik_start: body.musik_start || "",
    musik_end: body.musik_end || "",
    // Menyimpan pilihan hapus secara eksplisit agar berkas audio lama tidak
    // otomatis dimunculkan lagi oleh mekanisme pemulihan di panel admin.
    musik_disabled: body.musik_disabled === true,
  };

  const res = await pool.query(
    `UPDATE undangan SET
      slug = COALESCE($1, slug),
      nama_anak = $2,
      nama_orang_tua = $3,
      tanggal = $4,
      jam = $5,
      lokasi = $6,
      foto_cover = $7,
      foto_acara = $8,
      maps_url = $9,
      hiburan = $10,
      turut_mengundang = $11,
      orang_berbahagia = $12,
      rekening = $13,
      ayat = $14,
      data_json = $15,
      akses_token = COALESCE($16, akses_token)
     WHERE id = $17 RETURNING *`,
    [
      body.slug || null,
      body.nama_anak,
      body.nama_orang_tua,
      body.tanggal,
      body.jam,
      body.lokasi,
      body.foto_cover || null,
      body.foto_acara || null,
      body.maps_url || null,
      body.hiburan || null,
      JSON.stringify(body.turut_mengundang || []),
      JSON.stringify(body.orang_berbahagia || []),
      JSON.stringify(body.rekening || []),
      body.ayat || null,
      JSON.stringify(dataJson),
      body.akses_token || null,
      id,
    ]
  );
  return res.rows[0];
}

export async function getTamuByUndangan(undanganId: number) {
  const res = await pool.query(
    `SELECT 
      t.id,
      t.undangan_id,
      t.nama,
      COALESCE(t.hadir, r.hadir) AS hadir,
      COALESCE(t.ucapan, r.ucapan) AS ucapan,
      COALESCE(t.rsvp_at, r.created_at) AS rsvp_at,
      t.created_at
     FROM tamu t
     LEFT JOIN LATERAL (
       SELECT hadir, ucapan, created_at 
       FROM rsvp 
       WHERE undangan_id = t.undangan_id AND LOWER(TRIM(nama)) = LOWER(TRIM(t.nama))
       ORDER BY created_at DESC 
       LIMIT 1
     ) r ON true
     WHERE t.undangan_id = $1
     ORDER BY t.id ASC`,
    [undanganId]
  );
  return res.rows;
}

export async function tambahTamu(undanganId: number, nama: string) {
  const res = await pool.query(
    "INSERT INTO tamu (undangan_id, nama) VALUES ($1, $2) RETURNING *",
    [undanganId, nama.trim()]
  );
  return res.rows[0];
}

export async function tambahBanyakTamu(undanganId: number, daftarNama: string[]) {
  const hasil = [];
  for (const nama of daftarNama) {
    const bersih = nama.trim();
    if (bersih) {
      const res = await pool.query(
        "INSERT INTO tamu (undangan_id, nama) VALUES ($1, $2) RETURNING *",
        [undanganId, bersih]
      );
      hasil.push(res.rows[0]);
    }
  }
  return hasil;
}

export async function updateTamu(id: number, nama: string) {
  const res = await pool.query(
    "UPDATE tamu SET nama = $1 WHERE id = $2 RETURNING *",
    [nama.trim(), id]
  );
  return res.rows[0];
}

export async function updateTamuRsvpManual(id: number, hadir: boolean | null, ucapan?: string) {
  const res = await pool.query(
    "UPDATE tamu SET hadir = $1, ucapan = COALESCE($2, ucapan), rsvp_at = NOW() WHERE id = $3 RETURNING *",
    [hadir, ucapan || null, id]
  );
  return res.rows[0];
}

export async function hapusTamu(id: number) {
  await pool.query("DELETE FROM tamu WHERE id = $1", [id]);
}

export async function getRsvpByUndangan(undanganId: number) {
  const res = await pool.query(
    "SELECT * FROM rsvp WHERE undangan_id = $1 ORDER BY created_at DESC",
    [undanganId]
  );
  return res.rows;
}

export async function hapusRsvp(id: number) {
  await pool.query("DELETE FROM rsvp WHERE id = $1", [id]);
}

export async function simpanRsvp(
  undanganId: number,
  nama: string,
  hadir: string,
  ucapan: string,
  tamuId?: number | null
) {
  const isHadir = hadir === "Hadir";

  // 1. Simpan catatan riwayat ke tabel rsvp
  const res = await pool.query(
    `INSERT INTO rsvp (undangan_id, nama, hadir, ucapan) VALUES ($1, $2, $3, $4) RETURNING *`,
    [undanganId, nama, isHadir, ucapan]
  );

  // 2. Perbarui data kehadiran & ucapan langsung pada baris tamu terkait
  if (tamuId) {
    await pool.query(
      `UPDATE tamu SET hadir = $1, ucapan = $2, rsvp_at = NOW() WHERE id = $3 AND undangan_id = $4`,
      [isHadir, ucapan, tamuId, undanganId]
    );
  } else if (nama && nama.trim()) {
    await pool.query(
      `UPDATE tamu SET hadir = $1, ucapan = $2, rsvp_at = NOW() 
       WHERE id = (
         SELECT id FROM tamu 
         WHERE undangan_id = $3 AND LOWER(TRIM(nama)) = LOWER(TRIM($4))
         ORDER BY id ASC LIMIT 1
       )`,
      [isHadir, ucapan, undanganId, nama.trim()]
    );
  }

  return res.rows[0];
}
