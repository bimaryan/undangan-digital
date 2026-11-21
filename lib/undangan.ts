import pool from "./db";
import { hashPassword } from "./session";

export async function getUndanganBySlug(slug: string) {
  // `tanggal::text` mencegah pergeseran tanggal akibat konversi DATE -> Date
  // menggunakan zona waktu server (lihat countdown & file kalender).
  const res = await pool.query(
    `SELECT u.*, u.tanggal::text AS tanggal, u.jam::text AS jam,
            usr.name AS tenant_name, usr.email AS tenant_email
     FROM undangan u
     LEFT JOIN users usr ON usr.id = u.user_id
     WHERE u.slug = $1`,
    [slug]
  );
  return res.rows[0] || null;
}

export async function getUndanganByToken(token: string) {
  const res = await pool.query(
    `SELECT u.*, u.tanggal::text AS tanggal, u.jam::text AS jam,
            usr.name AS tenant_name, usr.email AS tenant_email
     FROM undangan u
     LEFT JOIN users usr ON usr.id = u.user_id
     WHERE u.akses_token = $1`,
    [token]
  );
  return res.rows[0] || null;
}

export async function getAllUndangan(userId?: number) {
  if (userId) {
    const res = await pool.query(
      `SELECT u.*, u.tanggal::text AS tanggal, u.jam::text AS jam,
              usr.name AS tenant_name, usr.email AS tenant_email
       FROM undangan u
       LEFT JOIN users usr ON usr.id = u.user_id
       WHERE u.user_id = $1
       ORDER BY u.created_at DESC`,
      [userId]
    );
    return res.rows;
  }

  const res = await pool.query(
    `SELECT u.*, u.tanggal::text AS tanggal, u.jam::text AS jam,
            usr.name AS tenant_name, usr.email AS tenant_email
     FROM undangan u
     LEFT JOIN users usr ON usr.id = u.user_id
     ORDER BY u.created_at DESC`
  );
  return res.rows;
}

export async function createUndangan(data: {
  slug: string;
  nama_anak: string;
  nama_orang_tua: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  user_id?: number | null;
  data_json?: Record<string, unknown>;
}) {
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const res = await pool.query(
    `INSERT INTO undangan (slug, nama_anak, nama_orang_tua, tanggal, jam, lokasi, akses_token, user_id, data_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      data.slug,
      data.nama_anak,
      data.nama_orang_tua,
      data.tanggal,
      data.jam,
      data.lokasi,
      token,
      data.user_id || null,
      data.data_json ? JSON.stringify(data.data_json) : null,
    ]
  );
  return res.rows[0];
}

export async function getAllTenants() {
  const res = await pool.query(
    `SELECT u.id, u.email, u.name, u.role, u.created_at,
            COUNT(und.id)::int AS invitation_count
     FROM users u
     LEFT JOIN undangan und ON und.user_id = u.id
     WHERE u.role = 'tenant'
     GROUP BY u.id, u.email, u.name, u.role, u.created_at
     ORDER BY u.created_at DESC`
  );
  return res.rows;
}

export async function createTenantUser(email: string, password: string, name: string) {
  const hash = hashPassword(password);
  const res = await pool.query(
    `INSERT INTO users (email, password_hash, role, name)
     VALUES ($1, $2, 'tenant', $3)
     RETURNING id, email, name, role, created_at`,
    [email.trim().toLowerCase(), hash, name.trim()]
  );
  return res.rows[0];
}

export async function emailExists(email: string): Promise<boolean> {
  const normalized = email.trim();
  const res = await pool.query(
    "SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [normalized]
  );
  if (res.rows.length > 0) return true;

  try {
    const legacy = await pool.query(
      "SELECT 1 FROM admin_users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [normalized]
    );
    return legacy.rows.length > 0;
  } catch {
    return false;
  }
}

export async function deleteTenantUser(id: number) {
  await pool.query(
    `UPDATE undangan
     SET user_id = NULL
     WHERE user_id = (SELECT id FROM users WHERE id = $1 AND role = 'tenant')`,
    [id]
  );
  await pool.query("DELETE FROM users WHERE id = $1 AND role = 'tenant'", [id]);
}

export async function assignUndanganTenant(undanganId: number, userId: number | null) {
  const res = await pool.query(
    "UPDATE undangan SET user_id = $1 WHERE id = $2 RETURNING *",
    [userId, undanganId]
  );
  return res.rows[0];
}

export async function assignUndanganTenantBySlug(slug: string, userId: number | null) {
  const res = await pool.query(
    "UPDATE undangan SET user_id = $1 WHERE slug = $2 RETURNING *",
    [userId, slug]
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
  // admin me-refresh halaman sebelum menekan "Simpan Perubahan".
  await pool.query(
    `UPDATE undangan
     SET data_json = jsonb_set(
       COALESCE(data_json, '{}'::jsonb),
       '{musik_url}',
       to_jsonb($1::text),
       true
     )
     WHERE id = $2`,
    [url, undanganId]
  );
}

export async function updateUndanganLengkap(id: number, body: Record<string, unknown>) {
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
    musik_disabled: body.musik_disabled === true,
  };

  const hasUserId = Object.prototype.hasOwnProperty.call(body, "user_id");
  const rawUserId = body.user_id;
  const parsedUserId =
    rawUserId === null || rawUserId === undefined || rawUserId === ""
      ? null
      : Number(rawUserId);
  const targetUserId =
    parsedUserId !== null && Number.isSafeInteger(parsedUserId) && parsedUserId > 0
      ? parsedUserId
      : null;

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
      akses_token = COALESCE($16, akses_token),
      token_version = CASE
        WHEN $16 IS NOT NULL AND $16 <> akses_token THEN token_version + 1
        ELSE token_version
      END,
      user_id = CASE
        WHEN $18::boolean THEN $19
        ELSE user_id
      END
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
      hasUserId,
      targetUserId,
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

export const tambahTamuBatch = tambahBanyakTamu;

export async function updateTamu(id: number, undanganId: number, nama: string) {
  const res = await pool.query(
    "UPDATE tamu SET nama = $1 WHERE id = $2 AND undangan_id = $3 RETURNING *",
    [nama.trim(), id, undanganId]
  );
  return res.rows[0];
}

export async function updateTamuRsvpManual(
  id: number,
  undanganId: number,
  hadir: boolean | null,
  ucapan?: string
) {
  const res = await pool.query(
    "UPDATE tamu SET hadir = $1, ucapan = COALESCE($2, ucapan), rsvp_at = NOW() WHERE id = $3 AND undangan_id = $4 RETURNING *",
    [hadir, ucapan || null, id, undanganId]
  );
  return res.rows[0];
}

export async function hapusTamu(id: number, undanganId: number) {
  await pool.query("DELETE FROM tamu WHERE id = $1 AND undangan_id = $2", [id, undanganId]);
}

export async function getRsvpByUndangan(undanganId: number) {
  const res = await pool.query(
    "SELECT * FROM rsvp WHERE undangan_id = $1 ORDER BY created_at DESC",
    [undanganId]
  );
  return res.rows;
}

export async function hapusRsvp(id: number, undanganId: number) {
  await pool.query("DELETE FROM rsvp WHERE id = $1 AND undangan_id = $2", [id, undanganId]);
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
