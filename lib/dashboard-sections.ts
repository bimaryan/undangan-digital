/**
 * Daftar bagian editor undangan pada dashboard client/tenant.
 * Dipakai bersama oleh sidebar (DashboardShell), halaman konten
 * (`app/dashboard/[section]`), dan komponen UndanganEditor.
 */
export const EDITOR_SECTIONS = [
  "identitas",
  "media",
  "acara",
  "keluarga",
  "amplop",
  "musik",
] as const;

export type EditorSectionId = (typeof EDITOR_SECTIONS)[number];

export const EDITOR_SECTION_META: Record<
  EditorSectionId,
  { label: string; description: string }
> = {
  identitas: {
    label: "Identitas & Akses",
    description: "Token akses tuan rumah, judul sampul, dan identitas pemesan acara.",
  },
  media: {
    label: "Foto Cover & Acara",
    description: "Unggah foto cover halaman depan dan foto dokumentasi acara.",
  },
  acara: {
    label: "Waktu & Lokasi Acara",
    description: "Atur tanggal, jam, lokasi, dan tautan peta acara.",
  },
  keluarga: {
    label: "Keluarga & Pengundang",
    description: "Daftar keluarga dan pihak yang turut mengundang.",
  },
  amplop: {
    label: "Amplop Digital",
    description: "Rekening bank dan dompet digital untuk amplop online.",
  },
  musik: {
    label: "Musik Latar",
    description: "Pilih musik yang diputar saat undangan dibuka tamu.",
  },
};

export function isEditorSection(value: string): value is EditorSectionId {
  return (EDITOR_SECTIONS as readonly string[]).includes(value);
}
