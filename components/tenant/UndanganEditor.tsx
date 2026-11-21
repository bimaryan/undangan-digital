"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Rekening, Orang, Undangan } from "@/types";
import type { EditorSectionId } from "@/lib/dashboard-sections";

// ==========================================
// SVG ICONS (PROFESSIONAL & CLEAN)
// ==========================================
function IconSave({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function IconKey({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 2l-2 2m-1.5 1.5L16 7l-2-2m-1.5 1.5L11 8l-2-2m-1.5 1.5L6 9" />
      <circle cx="7.5" cy="16.5" r="4.5" />
      <path d="m10.5 13.5 8-8" />
    </svg>
  );
}

function IconExternalLink({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconUsers({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconImage({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IconCalendar({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconCreditCard({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function IconMusic({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconScissors({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function IconPlay({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function IconTrash({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconPlus({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TamuButton({ slug }: { slug: string }) {
  return (
    <a
      href={`/dashboard/tamu?slug=${encodeURIComponent(slug)}`}
      className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-700 shadow-2xs transition hover:bg-sky-100"
    >
      <IconUsers className="w-3.5 h-3.5" />
      <span>Kelola Tamu</span>
    </a>
  );
}

/* Gaya bersama untuk label & input form editor (murni Tailwind).
 * `mt-0` menetralkan aturan global `label { margin-top: 16px }` di globals.css. */
const FIELD_LABEL =
  "mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500";
const FIELD_INPUT =
  "mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100";
const FIELD_INPUT_MONO = `${FIELD_INPUT} font-mono`;
const FIELD_INPUT_STRONG = `${FIELD_INPUT} font-bold`;

// ==========================================
// HALAMAN EDITOR UNDANGAN TENANT/CLIENT
// ==========================================
export default function UndanganEditor({
  slug,
  section,
}: {
  slug?: string;
  section?: EditorSectionId;
}) {
  const configuredSlug =
    slug ||
    process.env.NEXT_PUBLIC_FIXED_SLUG ||
    "khitanan-zayyan-arkana-alfarizqi";
  const [activeSlug, setActiveSlug] = useState(configuredSlug);

  const [editing, setEditing] = useState<Undangan | null>(null);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState<{
    text: string;
    tipe: "success" | "error";
  } | null>(null);
  const [uploading, setUploading] = useState<
    "cover" | "acara" | "musik" | null
  >(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);

  const setTimeFromCurrent = (field: "musik_start" | "musik_end") => {
    const audio = previewAudioRef.current;
    if (!audio || !editing) return;
    const cur = audio.currentTime;
    const m = Math.floor(cur / 60);
    const s = Math.floor(cur % 60);
    const formatted = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    setEditing({ ...editing, [field]: formatted });
  };

  const testTrimmedPlay = () => {
    const audio = previewAudioRef.current;
    if (!audio || !editing) return;
    const parseSec = (val?: string) => {
      if (!val) return 0;
      if (val.includes(":")) {
        const [m, s] = val.split(":");
        return (parseFloat(m) || 0) * 60 + (parseFloat(s) || 0);
      }
      return parseFloat(val) || 0;
    };
    const start = parseSec(editing.musik_start);
    audio.currentTime = start;
    audio.play();
  };

  useEffect(() => {
    async function muat() {
      try {
        const res = await fetch(
          `/api/admin/u/${encodeURIComponent(activeSlug)}`,
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.detail || errData.error || "";
          setPesan({
            text: errMsg
              ? `Gagal memuat database: ${errMsg}`
              : "Gagal memuat data dari database. Pastikan database cloud aktif dan token valid.",
            tipe: "error",
          });
          return;
        }
        const data = await res.json();
        const u = data.undangan;
        const dj = u.data_json || {};

        const parseJson = <T,>(val: unknown, fallback: T): T => {
          if (Array.isArray(val)) return val as T;
          if (typeof val === "string") {
            try {
              const parsed = JSON.parse(val);
              if (Array.isArray(parsed)) return parsed as T;
            } catch {}
          }
          return fallback;
        };

        const loadedOrangBerbahagia = parseJson<Orang[]>(
          u.orang_berbahagia,
          [],
        );

        setEditing({
          ...u,
          judul_sampul: dj.judul_sampul || "UNDANGAN",
          tanggal_sampul: dj.tanggal_sampul || "",
          label_acara: dj.label_acara || "Khitanan :",
          tempat_singkat: dj.tempat_singkat || "Rambatan Kulon, November 2026",
          hari_acara: dj.hari_acara || "Rabu malam Kamis",
          tanggal_acara: dj.tanggal_acara || "18 – 19 November 2026",
          jam_acara:
            dj.jam_acara ||
            (u.jam
              ? `Pkl. ${String(u.jam).slice(0, 5)} Wib s/d Selesai`
              : "Pkl. 08.00 Wib s/d Selesai"),
          sekeluarga: dj.sekeluarga || "Sekeluarga",
          alamat_keluarga:
            dj.alamat_keluarga ||
            "Desa Rambatan Kulon (Bangkir) Rt. 07 Rw. 01\nblok Kangkung Kec. Lohbener\nKab. Indramayu",
          footer_text:
            dj.footer_text ||
            "Terima kasih atas do'a restu Bapak/Ibu/Saudara/i",
          turut_mengundang: parseJson<string[]>(u.turut_mengundang, []),
          orang_berbahagia:
            loadedOrangBerbahagia.length > 0
              ? loadedOrangBerbahagia
              : [
                  {
                    nama: "Bpk. KASTAM",
                    keterangan:
                      "Bin Bpk. Rekiwan, Alm. - Ibu Minah, Almh.\n(Telukagung)",
                  },
                  {
                    nama: "Ibu SARINIH",
                    keterangan:
                      "Binti Bpk. Kartam, Alm. - Ibu Sari, Almh.\n(Rambatan Kulon-Bangkir)",
                  },
                ],
          rekening: parseJson<Rekening[]>(u.rekening, []),
          musik_url: dj.musik_url || "",
          musik_judul: dj.musik_judul || "",
          musik_start: dj.musik_start || "",
          musik_end: dj.musik_end || "",
          musik_disabled: dj.musik_disabled === true,
        });
        if (data.musicRecovered) {
          setPesan({
            text: "File musik sebelumnya ditemukan kembali. Klik Simpan Perubahan agar tersambung permanen ke undangan.",
            tipe: "success",
          });
        }
      } catch (err) {
        setPesan({
          text: "Terjadi kesalahan saat memuat data: " + String(err),
          tipe: "error",
        });
      }
    }
    if (activeSlug) {
      muat();
    }
  }, [activeSlug]);

  async function handleSave() {
    if (!editing) return;
    setLoading(true);
    setPesan(null);

    try {
      const res = await fetch(
        `/api/admin/u/${encodeURIComponent(activeSlug)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        },
      );

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.undangan?.slug) {
          setActiveSlug(data.undangan.slug);
        }
        setPesan({
          text: "Berhasil! Seluruh data undangan telah diperbarui dan langsung aktif di website.",
          tipe: "success",
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        setPesan({
          text:
            "Gagal menyimpan perubahan: " + (errData.error || res.statusText),
          tipe: "error",
        });
      }
    } catch (err) {
      setPesan({
        text: "Terjadi kesalahan saat menyimpan: " + String(err),
        tipe: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "foto_cover" | "foto_acara",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field === "foto_cover" ? "cover" : "acara");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", activeSlug);
    formData.append("field", field);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && editing) {
        setEditing({ ...editing, [field]: data.url });
        setPesan({
          text: "Foto berhasil diunggah. Klik Simpan Perubahan agar tampil di undangan.",
          tipe: "success",
        });
      } else {
        setPesan({
          text: data.error || "Gagal mengunggah foto.",
          tipe: "error",
        });
      }
    } catch (error) {
      setPesan({
        text: `Terjadi kesalahan saat mengunggah foto: ${String(error)}`,
        tipe: "error",
      });
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handleUploadMusik = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading("musik");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", activeSlug);
    formData.append("field", "musik");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const defaultJudul = file.name
          .replace(/^\d+-/, "")
          .replace(/\.[^.]+$/, "")
          .replace(/-/g, " ");
        setEditing({
          ...editing,
          musik_url: data.url,
          musik_judul: editing.musik_judul || defaultJudul,
          musik_disabled: false,
        });
        setPesan({
          text: "Musik berhasil diunggah. Klik Simpan Perubahan agar aktif di undangan.",
          tipe: "success",
        });
      } else {
        setPesan({
          text: data.error || "Gagal mengunggah musik.",
          tipe: "error",
        });
      }
    } catch {
      setPesan({
        text: "Terjadi kesalahan saat mengunggah musik.",
        tipe: "error",
      });
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const showSection = (id: EditorSectionId) => !section || section === id;

  if (!editing) {
    return (
      <main className="flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-xs">
          <div className="w-9 h-9 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-800 font-semibold text-base mb-1">
            {pesan ? pesan.text : "Memuat Data Undangan..."}
          </p>
          <p className="text-xs text-slate-400">
            Silakan periksa koneksi basis data PostgreSQL.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* 1. STICKY TOP ACTION BAR */}
      <div className="sticky top-16 z-30 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Editor Undangan Digital
            </span>
          </div>
          <p className="mt-0.5 truncate text-base font-extrabold text-slate-900">
            {editing.nama_anak || "Pengaturan Undangan"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/u/${editing.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
          >
            <span>Buka Undangan</span>
            <IconExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          <TamuButton slug={activeSlug} />

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-50"
          >
            <IconSave className="w-4 h-4" />
            <span>{loading ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>

      {/* NOTIFIKASI PESAN */}
      {pesan && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between gap-3 shadow-2xs transition-all ${
            pesan.tipe === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{pesan.tipe === "success" ? "✓" : "⚠"}</span>
            <span>{pesan.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setPesan(null)}
            className="text-xs opacity-60 hover:opacity-100 px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* SEKSI 1: AKSES MANDIRI TUAN RUMAH & SAMPUL */}
      {/* ======================================================== */}
      {showSection("identitas") && (
        <div
          id="identitas"
          className="min-w-0 scroll-mt-24 space-y-5 rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:space-y-6 sm:px-6 sm:py-6 xl:scroll-mt-32"
        >

          {/* IDENTITAS SAMPUL */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                Identitas Sampul
              </span>
              <span className="h-px flex-1 bg-slate-200" />
              <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                7 field
              </span>
            </div>

            <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={FIELD_LABEL}>Slug URL Undangan</label>
                <input
                  value={editing.slug}
                  onChange={(e) =>
                    setEditing({ ...editing, slug: e.target.value })
                  }
                  className={FIELD_INPUT_MONO}
                  placeholder="slug-url-undangan"
                />
                <p className="mt-1.5 truncate text-[10px] font-medium text-slate-400">
                  Alamat publik:{" "}
                  <span className="font-mono text-slate-500">
                    /u/{editing.slug || "slug-url-undangan"}
                  </span>
                </p>
              </div>

              <div>
                <label className={FIELD_LABEL}>Judul Sampul</label>
                <input
                  value={editing.judul_sampul || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, judul_sampul: e.target.value })
                  }
                  className={FIELD_INPUT}
                  placeholder="UNDANGAN"
                />
              </div>

              <div>
                <label className={FIELD_LABEL}>Tanggal di Sampul Depan</label>
                <input
                  type="date"
                  value={editing.tanggal_sampul || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, tanggal_sampul: e.target.value })
                  }
                  className={FIELD_INPUT}
                />
              </div>

              <div>
                <label className={FIELD_LABEL}>
                  Nama Lengkap Anak (Yang Dikhitan)
                </label>
                <input
                  value={editing.nama_anak}
                  onChange={(e) =>
                    setEditing({ ...editing, nama_anak: e.target.value })
                  }
                  className={FIELD_INPUT_STRONG}
                  placeholder="Nama Lengkap Anak"
                />
              </div>

              <div>
                <label className={FIELD_LABEL}>Label Acara</label>
                <input
                  value={editing.label_acara || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, label_acara: e.target.value })
                  }
                  className={FIELD_INPUT}
                  placeholder="Khitanan :"
                />
              </div>

              <div>
                <label className={FIELD_LABEL}>Nama Orang Tua</label>
                <input
                  value={editing.nama_orang_tua}
                  onChange={(e) =>
                    setEditing({ ...editing, nama_orang_tua: e.target.value })
                  }
                  className={FIELD_INPUT}
                  placeholder="Bpk. Kastam - Ibu Sarinih"
                />
              </div>

              <div>
                <label className={FIELD_LABEL}>Teks Penutup Keluarga</label>
                <input
                  value={editing.sekeluarga || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, sekeluarga: e.target.value })
                  }
                  className={FIELD_INPUT}
                  placeholder="Sekeluarga"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SEKSI 2: FOTO DOKUMENTASI */}
      {/* ======================================================== */}
      {showSection("media") && (
        <div
          id="media"
          className="min-w-0 scroll-mt-24 space-y-5 rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:space-y-6 sm:px-6 sm:py-6 xl:scroll-mt-32"
        >
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            {/* Foto Cover */}
            <div className="border border-slate-200/90 p-4 rounded-lg bg-slate-50/30 flex flex-col justify-between space-y-3">
              <div>
                <label className="mt-0 block text-xs font-bold uppercase tracking-wider text-slate-800">
                  Foto Cover (Halaman Depan)
                </label>
                <p className="text-xs text-slate-400 mt-0.5 mb-3">
                  Tampil di bingkai lengkung atas
                </p>
                {editing.foto_cover ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={editing.foto_cover}
                    alt="Foto Cover"
                    className="w-full h-44 object-cover rounded-2xl border border-slate-200 shadow-2xs mb-2 bg-slate-100"
                  />
                ) : (
                  <div className="w-full h-44 flex items-center justify-center bg-slate-100 text-slate-400 text-xs rounded-2xl border border-dashed border-slate-300 mb-2">
                    Belum ada foto cover (placeholder aktif)
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, "foto_cover")}
                  disabled={uploading !== null}
                  className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer w-full"
                />
                {uploading === "cover" && (
                  <p className="text-xs text-sky-700 font-semibold">
                    Mengunggah foto cover...
                  </p>
                )}
                <input
                  value={editing.foto_cover || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, foto_cover: e.target.value })
                  }
                  placeholder="Atau tempel URL gambar di sini"
                  className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-xs font-mono outline-none"
                />
              </div>
            </div>

            {/* Foto Acara */}
            <div className="border border-slate-200/90 p-4 rounded-lg bg-slate-50/30 flex flex-col justify-between space-y-3">
              <div>
                <label className="mt-0 block text-xs font-bold uppercase tracking-wider text-slate-800">
                  Foto Profil Acara (Foto Bulat)
                </label>
                <p className="text-xs text-slate-400 mt-0.5 mb-3">
                  Tampil di lingkaran detail acara
                </p>
                <div className="flex justify-center mb-2">
                  {editing.foto_acara ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={editing.foto_acara}
                      alt="Foto Acara"
                      className="w-36 h-36 object-cover rounded-full border-4 border-white shadow-sm bg-slate-100"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xs border border-dashed border-slate-300 text-center p-3">
                      Belum ada foto acara
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, "foto_acara")}
                  disabled={uploading !== null}
                  className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer w-full"
                />
                {uploading === "acara" && (
                  <p className="text-xs text-sky-700 font-semibold">
                    Mengunggah foto acara...
                  </p>
                )}
                <input
                  value={editing.foto_acara || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, foto_acara: e.target.value })
                  }
                  placeholder="Atau tempel URL gambar di sini"
                  className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-xs font-mono outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SEKSI 3: WAKTU, JADWAL & LOKASI */}
      {/* ======================================================== */}
      {showSection("acara") && (
        <div
          id="acara"
          className="min-w-0 scroll-mt-24 space-y-5 rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:space-y-6 sm:px-6 sm:py-6 xl:scroll-mt-32"
        >
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Tanggal Target Countdown
              </label>
              <input
                type="date"
                value={
                  editing.tanggal
                    ? typeof editing.tanggal === "string"
                      ? editing.tanggal.slice(0, 10)
                      : new Date(editing.tanggal).toISOString().slice(0, 10)
                    : ""
                }
                onChange={(e) =>
                  setEditing({ ...editing, tanggal: e.target.value })
                }
                className={FIELD_INPUT}
              />
            </div>
            <div>
              <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Jam Target Countdown
              </label>
              <input
                type="time"
                value={editing.jam ? String(editing.jam).slice(0, 5) : ""}
                onChange={(e) =>
                  setEditing({ ...editing, jam: e.target.value })
                }
                className={FIELD_INPUT}
              />
            </div>
            <div>
              <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Teks Hari Acara
              </label>
              <input
                value={editing.hari_acara || ""}
                onChange={(e) =>
                  setEditing({ ...editing, hari_acara: e.target.value })
                }
                className={FIELD_INPUT}
                placeholder="Rabu malam Kamis"
              />
            </div>
            <div>
              <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Teks Tanggal Acara
              </label>
              <input
                value={editing.tanggal_acara || ""}
                onChange={(e) =>
                  setEditing({ ...editing, tanggal_acara: e.target.value })
                }
                className={FIELD_INPUT}
                placeholder="18 – 19 November 2026"
              />
            </div>
            <div>
              <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Teks Waktu Acara
              </label>
              <input
                value={editing.jam_acara || ""}
                onChange={(e) =>
                  setEditing({ ...editing, jam_acara: e.target.value })
                }
                className={FIELD_INPUT}
                placeholder="Pkl. 08.00 Wib s/d Selesai"
              />
            </div>
            <div>
              <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Hiburan Acara
              </label>
              <input
                value={editing.hiburan || ""}
                onChange={(e) =>
                  setEditing({ ...editing, hiburan: e.target.value })
                }
                className={FIELD_INPUT}
                placeholder="Seni Reog Vikar Group"
              />
            </div>
            <div>
              <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Tempat &amp; Bulan Singkat (Header)
              </label>
              <input
                value={editing.tempat_singkat || ""}
                onChange={(e) =>
                  setEditing({ ...editing, tempat_singkat: e.target.value })
                }
                className={FIELD_INPUT}
                placeholder="Rambatan Kulon, November 2026"
              />
            </div>
            <div>
              <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Tautan Google Maps
              </label>
              <div className="relative">
                <input
                  value={editing.maps_url || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, maps_url: e.target.value })
                  }
                  className={FIELD_INPUT}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Alamat Lengkap Tempat Acara
              </label>
              <textarea
                value={editing.lokasi}
                onChange={(e) =>
                  setEditing({ ...editing, lokasi: e.target.value })
                }
                rows={2}
                className={`${FIELD_INPUT} leading-relaxed`}
                placeholder="Desa Rambatan Kulon (Bangkir) Rt. 07 Rw. 01 blok Kangkung Kec. Lohbener Kab. Indramayu"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SEKSI 4: KAMI YANG BERBAHAGIA & TURUT MENGUNDANG */}
      {/* ======================================================== */}
      {showSection("keluarga") && (
        <div
          id="keluarga"
          className="min-w-0 scroll-mt-24 space-y-5 rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:space-y-6 sm:px-6 sm:py-6 xl:scroll-mt-32"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={() =>
                setEditing({
                  ...editing,
                  orang_berbahagia: [
                    ...editing.orang_berbahagia,
                    { nama: "", keterangan: "" },
                  ],
                })
              }
              className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 sm:w-auto"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>Tambah Tuan Rumah</span>
            </button>
          </div>

          <div className="space-y-3">
            {editing.orang_berbahagia.map((item, i) => (
              <div
                key={i}
                className="relative grid min-w-0 grid-cols-1 gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 p-3 sm:p-4 md:grid-cols-2"
              >
                <div>
                  <label className="mt-0 block mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Nama ({i + 1})
                  </label>
                  <input
                    value={item.nama}
                    onChange={(e) => {
                      const arr = [...editing.orang_berbahagia];
                      arr[i] = { ...arr[i], nama: e.target.value };
                      setEditing({ ...editing, orang_berbahagia: arr });
                    }}
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-sm font-bold text-slate-900 outline-none"
                    placeholder="Bpk. KASTAM"
                  />
                </div>
                <div>
                  <label className="mt-0 block mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Keterangan / Silsilah
                  </label>
                  <textarea
                    value={item.keterangan}
                    onChange={(e) => {
                      const arr = [...editing.orang_berbahagia];
                      arr[i] = { ...arr[i], keterangan: e.target.value };
                      setEditing({ ...editing, orang_berbahagia: arr });
                    }}
                    rows={2}
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-xs font-medium outline-none"
                    placeholder="Bin Bpk. ... / Asal daerah"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        orang_berbahagia: editing.orang_berbahagia.filter(
                          (_, idx) => idx !== i,
                        ),
                      })
                    }
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                    <span>Hapus Baris Ini</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 pt-2 md:grid-cols-2">
            <div>
              <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Alamat Keluarga Tuan Rumah
              </label>
              <textarea
                value={editing.alamat_keluarga || ""}
                onChange={(e) =>
                  setEditing({ ...editing, alamat_keluarga: e.target.value })
                }
                rows={3}
                className={`${FIELD_INPUT} leading-relaxed`}
                placeholder="Desa Rambatan Kulon (Bangkir) Rt. 07 Rw. 01..."
              />
            </div>
            <div>
              <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Ayat / Kutipan Do&apos;a
              </label>
              <textarea
                value={editing.ayat || ""}
                onChange={(e) =>
                  setEditing({ ...editing, ayat: e.target.value })
                }
                rows={3}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-serif italic outline-none transition leading-relaxed"
                placeholder="Kutipan doa atau ayat..."
              />
            </div>
          </div>

          {/* Turut Mengundang List */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <label className="mt-0 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Turut Mengundang
              </label>
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    ...editing,
                    turut_mengundang: [...editing.turut_mengundang, ""],
                  })
                }
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1"
              >
                <IconPlus className="w-3.5 h-3.5" />
                <span>Tambah Kerabat</span>
              </button>
            </div>

            <div className="space-y-2">
              {editing.turut_mengundang.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs font-mono font-bold text-slate-400 w-6 text-right select-none">
                    {i + 1}.
                  </span>
                  <input
                    value={item}
                    onChange={(e) => {
                      const arr = [...editing.turut_mengundang];
                      arr[i] = e.target.value;
                      setEditing({ ...editing, turut_mengundang: arr });
                    }}
                    className="border border-slate-200 bg-slate-50/50 p-2.5 rounded-xl text-sm flex-1 focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
                    placeholder="Nama kerabat yang turut mengundang"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        turut_mengundang: editing.turut_mengundang.filter(
                          (_, idx) => idx !== i,
                        ),
                      })
                    }
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                    title="Hapus"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SEKSI 5: REKENING & E-WALLET (AMPLOP DIGITAL) */}
      {/* ======================================================== */}
      {showSection("amplop") && (
        <div
          id="amplop"
          className="min-w-0 scroll-mt-24 space-y-5 rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:space-y-6 sm:px-6 sm:py-6 xl:scroll-mt-32"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={() =>
                setEditing({
                  ...editing,
                  rekening: [
                    ...editing.rekening,
                    { type: "bank", label: "", no: "", name: "" },
                  ],
                })
              }
              className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-sky-200/80 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-100 sm:w-auto"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>Tambah Rekening</span>
            </button>
          </div>

          <div className="space-y-3">
            {editing.rekening.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border border-slate-200/80 bg-slate-50/40 p-4 rounded-2xl items-end"
              >
                <div>
                  <label className="mt-0 block mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Tipe
                  </label>
                  <select
                    value={item.type}
                    onChange={(e) => {
                      const arr = [...editing.rekening];
                      arr[i] = {
                        ...arr[i],
                        type: e.target.value as "bank" | "wallet",
                      };
                      setEditing({ ...editing, rekening: arr });
                    }}
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-sm font-semibold outline-none"
                  >
                    <option value="bank">Bank</option>
                    <option value="wallet">E-Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="mt-0 block mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Label (BCA / DANA / OVO)
                  </label>
                  <input
                    value={item.label}
                    onChange={(e) => {
                      const arr = [...editing.rekening];
                      arr[i] = { ...arr[i], label: e.target.value };
                      setEditing({ ...editing, rekening: arr });
                    }}
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-sm font-bold outline-none"
                    placeholder="BCA / BRI / DANA"
                  />
                </div>
                <div>
                  <label className="mt-0 block mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Nomor Rekening / HP
                  </label>
                  <input
                    value={item.no}
                    onChange={(e) => {
                      const arr = [...editing.rekening];
                      arr[i] = { ...arr[i], no: e.target.value };
                      setEditing({ ...editing, rekening: arr });
                    }}
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-sm font-mono font-bold outline-none"
                    placeholder="1234567890"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="mt-0 block mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Atas Nama Pemilik
                    </label>
                    <input
                      value={item.name}
                      onChange={(e) => {
                        const arr = [...editing.rekening];
                        arr[i] = { ...arr[i], name: e.target.value };
                        setEditing({ ...editing, rekening: arr });
                      }}
                      className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-sm font-medium outline-none"
                      placeholder="Nama Pemilik"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        rekening: editing.rekening.filter(
                          (_, idx) => idx !== i,
                        ),
                      })
                    }
                    className="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                    title="Hapus Rekening"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              Ucapan Footer Penutup Halaman
            </label>
            <input
              value={editing.footer_text || ""}
              onChange={(e) =>
                setEditing({ ...editing, footer_text: e.target.value })
              }
              className={FIELD_INPUT}
              placeholder="Terima kasih atas do'a restu Bapak/Ibu/Saudara/i"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SEKSI 6: MUSIK LATAR & PEMOTONG DURASI */}
      {/* ======================================================== */}
      {showSection("musik") && (
        <div
          id="musik"
          className="min-w-0 scroll-mt-24 space-y-5 rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:space-y-6 sm:px-6 sm:py-6 xl:scroll-mt-32"
        >

          {/* Upload File Musik */}
          <div className="border border-slate-200/90 p-4 rounded-lg bg-slate-50/40 space-y-3">
            <label className="mt-0 block text-xs font-bold uppercase tracking-wider text-slate-800">
              Upload File Musik (MP3, M4A, OGG, AAC - Maks. 20 MB)
            </label>
            <input
              type="file"
              accept="audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/aac,.mp3,.m4a,.ogg,.wav,.aac"
              onChange={handleUploadMusik}
              disabled={uploading !== null}
              className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer w-full"
            />
            {uploading === "musik" && (
              <p className="text-xs text-slate-700 font-semibold">
                Mengunggah audio... mohon tunggu.
              </p>
            )}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Judul Lagu (Tersimpan di Metadata)
              </label>
              <input
                value={editing.musik_judul || ""}
                onChange={(e) =>
                  setEditing({ ...editing, musik_judul: e.target.value })
                }
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-purple-500 font-medium outline-none transition"
                placeholder="Contoh: Raim Laode - Bersenja Gurau"
              />
            </div>
            <div>
              <label className="mt-0 block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Atau Tempel URL Audio Langsung
              </label>
              <input
                value={editing.musik_url || ""}
                onChange={(e) =>
                  setEditing({ ...editing, musik_url: e.target.value })
                }
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-purple-500 font-mono text-xs outline-none transition"
                placeholder="/uploads/nama-file.mp3 atau https://..."
              />
            </div>
          </div>

          {/* KOTAK POTONG DURASI MUSIK (TRIM & LOOP) */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                <IconScissors className="w-4 h-4 text-purple-600" />
                <span>
                  Pengaturan Potongan Menit Lagu (Reff / Bagian Terbaik)
                </span>
              </h3>
              <p className="text-xs text-purple-800/80 mt-0.5">
                Tamu biasanya melihat undangan secara singkat. Atur bagian lagu
                langsung ke reff agar langsung terdengar syahdu.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="mt-0 block mb-1 text-xs font-bold uppercase tracking-wider text-purple-900">
                  Mulai Dari (Menit : Detik)
                </label>
                <div className="flex gap-2">
                  <input
                    value={editing.musik_start || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, musik_start: e.target.value })
                    }
                    className="flex-1 border border-purple-200 bg-white p-2.5 rounded-xl text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="00:30"
                  />
                  {editing.musik_url && (
                    <button
                      type="button"
                      onClick={() => setTimeFromCurrent("musik_start")}
                      title="Isi dengan posisi waktu pemutar audio saat ini"
                      className="text-xs bg-white border border-purple-300 text-purple-700 hover:bg-purple-100 px-3 py-2 rounded-xl font-bold whitespace-nowrap shadow-2xs transition"
                    >
                      Set Posisi Saat Ini
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-purple-700/70 mt-1 font-medium">
                  Contoh: <strong>00:45</strong> (mulai di detik ke-45)
                </p>
              </div>

              <div>
                <label className="mt-0 block mb-1 text-xs font-bold uppercase tracking-wider text-purple-900">
                  Selesai Pada (Menit : Detik)
                </label>
                <div className="flex gap-2">
                  <input
                    value={editing.musik_end || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, musik_end: e.target.value })
                    }
                    className="flex-1 border border-purple-200 bg-white p-2.5 rounded-xl text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="02:15"
                  />
                  {editing.musik_url && (
                    <button
                      type="button"
                      onClick={() => setTimeFromCurrent("musik_end")}
                      title="Isi dengan posisi waktu pemutar audio saat ini"
                      className="text-xs bg-white border border-purple-300 text-purple-700 hover:bg-purple-100 px-3 py-2 rounded-xl font-bold whitespace-nowrap shadow-2xs transition"
                    >
                      Set Posisi Saat Ini
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-purple-700/70 mt-1 font-medium">
                  Bila tercapai, lagu otomatis berulang (loop) ke menit mulai.
                </p>
              </div>
            </div>
          </div>

          {/* Player Preview */}
          {editing.musik_url ? (
            <div className="border border-purple-200 bg-purple-50/50 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                  <IconMusic className="w-3.5 h-3.5" />
                  <span>Preview Pemutar Musik</span>
                </span>
                {(editing.musik_start || editing.musik_end) && (
                  <button
                    type="button"
                    onClick={testTrimmedPlay}
                    className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-2xs transition inline-flex items-center gap-1.5"
                  >
                    <IconPlay className="w-3 h-3" />
                    <span>Uji Bagian Potongan</span>
                  </button>
                )}
              </div>

              <audio
                ref={previewAudioRef}
                controls
                src={editing.musik_url}
                className="w-full h-10 rounded-xl"
              />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-500 gap-1 pt-1">
                <p>
                  Judul:{" "}
                  <strong className="text-slate-800">
                    {editing.musik_judul || "(belum diisi)"}
                  </strong>
                </p>
                {(editing.musik_start || editing.musik_end) && (
                  <p className="font-mono text-purple-700 font-bold bg-white px-2 py-0.5 rounded-md border border-purple-200">
                    Potongan: {editing.musik_start || "00:00"} →{" "}
                    {editing.musik_end || "Akhir"}
                  </p>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      musik_url: "",
                      musik_judul: "",
                      musik_start: "",
                      musik_end: "",
                      musik_disabled: true,
                    })
                  }
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                  <span>Hapus musik ini</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-400">
              Belum ada file musik yang aktif. Silakan upload file audio MP3/M4A
              di atas.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
