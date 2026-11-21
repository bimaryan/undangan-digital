import pool from "./db";
import type { UploadedMedia, UploadedMediaReference } from "@/types/media";

export type { UploadedMedia, UploadedMediaReference };

let tableReady: Promise<void> | undefined;

/** Media must survive a server restart or deployment. */
function ensureMediaTable() {
  if (!tableReady) {
    tableReady = pool
      .query(`
        CREATE TABLE IF NOT EXISTS uploaded_media (
          id VARCHAR(64) PRIMARY KEY,
          undangan_id INTEGER NOT NULL REFERENCES undangan(id) ON DELETE CASCADE,
          filename VARCHAR(255) NOT NULL,
          content_type VARCHAR(100) NOT NULL,
          size INTEGER NOT NULL CHECK (size > 0),
          content BYTEA NOT NULL,
          created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
        )
      `)
      .then(() => undefined)
      .catch((error) => {
        tableReady = undefined;
        throw error;
      });
  }

  return tableReady;
}

export async function saveUploadedMedia(media: UploadedMedia) {
  await ensureMediaTable();
  await pool.query(
    `INSERT INTO uploaded_media (id, undangan_id, filename, content_type, size, content)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [media.id, media.undangan_id, media.filename, media.content_type, media.size, media.content]
  );
}

export async function getUploadedMedia(id: string) {
  await ensureMediaTable();
  const result = await pool.query<UploadedMedia>(
    `SELECT id, undangan_id, filename, content_type, size, content
     FROM uploaded_media
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getLatestUploadedAudioForUndangan(
  undanganId: number
): Promise<UploadedMediaReference | null> {
  await ensureMediaTable();
  const result = await pool.query<UploadedMediaReference>(
    `SELECT id, filename, content_type, size
     FROM uploaded_media
     WHERE undangan_id = $1 AND content_type LIKE 'audio/%'
     ORDER BY created_at DESC
     LIMIT 1`,
    [undanganId]
  );
  return result.rows[0] ?? null;
}
