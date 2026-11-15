"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ==========================================
// TIPE DATA
// ==========================================
type Rekening = { type: "bank" | "wallet"; label: string; no: string; name: string };
type Orang = { nama: string; keterangan: string };

type Undangan = {
  id: number;
  slug: string;
  nama_anak: string;
  nama_orang_tua: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  foto_cover: string;
  foto_acara: string;
  maps_url: string;
  hiburan: string;
  turut_mengundang: string[];
  orang_berbahagia: Orang[];
  rekening: Rekening[];
  ayat: string;
  akses_token?: string;
  // Dynamic fields
  judul_sampul?: string;
  tanggal_sampul?: string;
  label_acara?: string;
  tempat_singkat?: string;
  hari_acara?: string;
  tanggal_acara?: string;
  jam_acara?: string;
  sekeluarga?: string;
  alamat_keluarga?: string;
  footer_text?: string;
  musik_url?: string;
  musik_judul?: string;
  musik_start?: string;
  musik_end?: string;
  musik_disabled?: boolean;
};

// ==========================================
// SVG ICONS (PROFESSIONAL & CLEAN)
// ==========================================
function IconSave({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function IconKey({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 2l-2 2m-1.5 1.5L16 7l-2-2m-1.5 1.5L11 8l-2-2m-1.5 1.5L6 9" />
      <circle cx="7.5" cy="16.5" r="4.5" />
      <path d="m10.5 13.5 8-8" />
    </svg>
  );
}

function IconCopy({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconExternalLink({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconUsers({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconImage({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IconCalendar({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconCreditCard({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function IconMusic({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconScissors({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
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
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function IconTrash({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconPlus({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ==========================================
// HALAMAN ADMIN UTAMA
// ==========================================
export default function AdminPage() {
  const router = useRouter();
  const configuredSlug = process.env.NEXT_PUBLIC_FIXED_SLUG || "khitanan-zayyan-arkana-alfarizqi";
  const token = process.env.NEXT_PUBLIC_FIXED_TOKEN || "bumarpuah";
  const [activeSlug, setActiveSlug] = useState(configuredSlug);

  const [editing, setEditing] = useState<Undangan | null>(null);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState<{ text: string; tipe: "success" | "error" } | null>(null);
  const [uploading, setUploading] = useState<"cover" | "acara" | "musik" | null>(null);
  const [copiedHostLink, setCopiedHostLink] = useState(false);
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
        const res = await fetch(`/api/admin/u/${activeSlug}?token=${encodeURIComponent(token)}`);
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

        const loadedOrangBerbahagia = parseJson<Orang[]>(u.orang_berbahagia, []);

        setEditing({
          ...u,
          judul_sampul: dj.judul_sampul || "UNDANGAN",
          tanggal_sampul: dj.tanggal_sampul || "Rabu, 18 November 2026",
          label_acara: dj.label_acara || "Khitanan :",
          tempat_singkat: dj.tempat_singkat || "Rambatan Kulon, November 2026",
          hari_acara: dj.hari_acara || "Rabu malam Kamis",
          tanggal_acara: dj.tanggal_acara || "18 – 19 November 2026",
          jam_acara:
            dj.jam_acara ||
            (u.jam ? `Pkl. ${String(u.jam).slice(0, 5)} Wib s/d Selesai` : "Pkl. 08.00 Wib s/d Selesai"),
          sekeluarga: dj.sekeluarga || "Sekeluarga",
          alamat_keluarga:
            dj.alamat_keluarga ||
            "Desa Rambatan Kulon (Bangkir) Rt. 07 Rw. 01\nblok Kangkung Kec. Lohbener\nKab. Indramayu",
          footer_text: dj.footer_text || "Terima kasih atas do'a restu Bapak/Ibu/Saudara/i",
          turut_mengundang: parseJson<string[]>(u.turut_mengundang, []),
          orang_berbahagia:
            loadedOrangBerbahagia.length > 0
              ? loadedOrangBerbahagia
              : [
                  {
                    nama: "Bpk. KASTAM",
                    keterangan: "Bin Bpk. Rekiwan, Alm. - Ibu Minah, Almh.\n(Telukagung)",
                  },
                  {
                    nama: "Ibu SARINIH",
                    keterangan: "Binti Bpk. Kartam, Alm. - Ibu Sari, Almh.\n(Rambatan Kulon-Bangkir)",
                  },
                ],
          rekening: parseJson<Rekening[]>(u.rekening, []),
          musik_url: dj.musik_url || "",
          musik_judul: dj.musik_judul || "",
          musik_start: dj.musik_start || "",
          musik_end: dj.musik_end || "",
          musik_disabled: dj.musik_disabled === true,
          akses_token: u.akses_token || "bumarpuah",
        });
        if (data.musicRecovered) {
          setPesan({
            text: "File musik sebelumnya ditemukan kembali. Klik Simpan Semua Perubahan agar tersambung permanen ke undangan.",
            tipe: "success",
          });
        }
      } catch (err) {
        setPesan({ text: "Terjadi kesalahan saat memuat data: " + String(err), tipe: "error" });
      }
    }
    if (activeSlug && token) {
      muat();
    }
  }, [activeSlug, token]);

  async function handleSave() {
    if (!editing) return;
    setLoading(true);
    setPesan(null);

    try {
      const res = await fetch(`/api/admin/u/${activeSlug}?token=${encodeURIComponent(token)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });

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
          text: "Gagal menyimpan perubahan: " + (errData.error || res.statusText),
          tipe: "error",
        });
      }
    } catch (err) {
      setPesan({ text: "Terjadi kesalahan saat menyimpan: " + String(err), tipe: "error" });
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "foto_cover" | "foto_acara"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field === "foto_cover" ? "cover" : "acara");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", activeSlug);
    formData.append("token", token);
    formData.append("field", field);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (res.ok && editing) {
        setEditing({ ...editing, [field]: data.url });
        setPesan({ text: "Foto berhasil diunggah. Klik Simpan Semua Perubahan agar tampil di undangan.", tipe: "success" });
      } else {
        setPesan({ text: data.error || "Gagal mengunggah foto.", tipe: "error" });
      }
    } catch (error) {
      setPesan({ text: `Terjadi kesalahan saat mengunggah foto: ${String(error)}`, tipe: "error" });
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
    formData.append("token", token);
    formData.append("field", "musik");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const defaultJudul = file.name.replace(/^\d+-/, "").replace(/\.[^.]+$/, "").replace(/-/g, " ");
        setEditing({
          ...editing,
          musik_url: data.url,
          musik_judul: editing.musik_judul || defaultJudul,
          musik_disabled: false,
        });
        setPesan({ text: "Musik berhasil diunggah. Klik Simpan Semua Perubahan agar aktif di undangan.", tipe: "success" });
      } else {
        setPesan({ text: data.error || "Gagal mengunggah musik.", tipe: "error" });
      }
    } catch {
      setPesan({ text: "Terjadi kesalahan saat mengunggah musik.", tipe: "error" });
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  if (!editing) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs text-center max-w-sm w-full">
          <div className="w-9 h-9 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-800 font-semibold text-base mb-1">
            {pesan ? pesan.text : "Memuat Data Admin Undangan..."}
          </p>
          <p className="text-xs text-slate-400">Silakan periksa koneksi basis data PostgreSQL.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-slate-800 p-3 sm:p-4 lg:p-5 font-sans antialiased pb-24">
      <div className="mx-auto grid max-w-[1440px] gap-4 lg:gap-5 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] flex-col rounded-xl border border-slate-200 bg-white p-4 text-slate-600 lg:flex">
          <a href="#identitas" className="mb-8 flex items-center gap-3 px-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white">I</span>
            <span>
              <strong className="block text-sm text-slate-900">InovaInvite</strong>
              <span className="text-[11px] text-slate-500">Pengelolaan undangan</span>
            </span>
          </a>

          <p className="px-3 text-[11px] font-semibold text-slate-400">PENGATURAN</p>
          <nav className="mt-3 space-y-1 text-sm">
            <a href="#identitas" className="flex items-center gap-3 rounded-md bg-slate-100 px-3 py-2.5 font-semibold text-slate-900"><IconKey className="w-4 h-4" />Identitas &amp; akses</a>
            <a href="#media" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-slate-100 hover:text-slate-900"><IconImage className="w-4 h-4" />Foto undangan</a>
            <a href="#acara" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-slate-100 hover:text-slate-900"><IconCalendar className="w-4 h-4" />Waktu &amp; lokasi</a>
            <a href="#keluarga" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-slate-100 hover:text-slate-900"><IconUsers className="w-4 h-4" />Keluarga</a>
            <a href="#amplop" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-slate-100 hover:text-slate-900"><IconCreditCard className="w-4 h-4" />Amplop digital</a>
            <a href="#musik" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-slate-100 hover:text-slate-900"><IconMusic className="w-4 h-4" />Musik latar</a>
          </nav>

          <div className="mt-auto border-t border-slate-200 pt-4">
            <p className="px-1 text-[11px] text-slate-500">Kelola daftar penerima dan RSVP.</p>
            <button type="button" onClick={() => router.push(`/admin/u/${activeSlug}?${editing?.akses_token || token}`)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700">
              <IconUsers className="w-4 h-4" />Kelola tamu
            </button>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">

        {/* 1. TOP HEADER BAR (EXECUTIVE DASHBOARD NAVBAR) */}
        <div className="sticky top-3 z-30 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">PENGATURAN UNDANGAN</span>
                <span className="text-xs text-slate-400 font-mono">
                  Slug: <strong className="text-slate-700">{editing.slug}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Editor Undangan Digital
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Atur informasi acara, foto, musik latar, serta tautan pengelolaan tamu untuk tuan rumah.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <a
                href={`/u/${editing.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl border border-slate-200/90 font-semibold transition"
              >
                <span>Lihat Undangan</span>
                <IconExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <button
                type="button"
                onClick={() => router.push(`/admin/u/${activeSlug}?${editing?.akses_token || token}`)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-2xl font-bold transition shadow-2xs hover:shadow-xs"
              >
                <IconUsers className="w-4 h-4" />
                <span>Kelola Tamu</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold transition shadow-2xs hover:shadow-xs disabled:opacity-50"
              >
                <IconSave className="w-4 h-4" />
                <span>{loading ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </div>
        </div>

        <nav aria-label="Navigasi pengaturan" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
          <a href="#identitas" className="whitespace-nowrap rounded-xl bg-sky-100 px-3 py-2 text-xs font-bold text-sky-800">Identitas</a>
          <a href="#media" className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">Foto</a>
          <a href="#acara" className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">Acara</a>
          <a href="#keluarga" className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">Keluarga</a>
          <a href="#amplop" className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">Amplop</a>
          <a href="#musik" className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">Musik</a>
        </nav>

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
        <section id="identitas" className="scroll-mt-32 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <IconKey className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                1. Akses Tuan Rumah &amp; Identitas Sampul
              </h2>
              <p className="text-xs text-slate-500">
                Token tautan mandiri pemesan acara beserta judul sampul undangan
              </p>
            </div>
          </div>

          {/* KOTAK AKSES TUAN RUMAH (ELEGANT CALLOUT) */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-950 uppercase tracking-wide">
                  Token Akses Tuan Rumah
                </span>
                <span className="text-[10px] bg-sky-200/80 text-sky-800 font-extrabold px-2 py-0.5 rounded-full">
                  Tanpa Password
                </span>
              </div>
              <span className="text-xs text-sky-700/80">
                Cukup bagikan tautan ini ke pemesan / tuan rumah acara
              </span>
            </div>

            <p className="text-xs text-sky-900 leading-relaxed font-medium">
              Beri token sesuai nama pemesan/tuan rumah (contoh: <strong>bumarpuah</strong>). Tuan rumah dapat langsung mengelola dan membagikan undangan tanpa perlu password rumit.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="flex items-center border border-sky-300 rounded-xl bg-white px-3 py-2 shadow-2xs">
                <span className="text-xs text-slate-400 font-mono select-none">?</span>
                <input
                  value={editing.akses_token || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      akses_token: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                    })
                  }
                  className="text-sm font-mono font-bold text-sky-900 bg-transparent outline-none w-36 ml-1"
                  placeholder="bumarpuah"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const hostToken = editing.akses_token || "bumarpuah";
                  const hostUrl = `${window.location.origin}/admin/u/${editing.slug}?${hostToken}`;
                  navigator.clipboard.writeText(hostUrl);
                  setCopiedHostLink(true);
                  setTimeout(() => setCopiedHostLink(false), 2000);
                  setPesan({
                    tipe: "success",
                    text: `Tautan Tuan Rumah berhasil disalin: ${hostUrl}`,
                  });
                }}
                className="text-xs bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-2xs hover:shadow-xs transition inline-flex items-center gap-1.5"
              >
                {copiedHostLink ? (
                  <>
                    <IconCheck className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="w-3.5 h-3.5" />
                    <span>Salin Link Tuan Rumah</span>
                  </>
                )}
              </button>

              <a
                href={`/admin/u/${editing.slug}?${editing.akses_token || "bumarpuah"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-white hover:bg-sky-50 text-sky-800 border border-sky-200/90 px-4 py-2.5 rounded-xl font-bold shadow-2xs transition inline-flex items-center gap-1.5"
              >
                <span>Buka Panel Tuan Rumah</span>
                <IconExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>

          {/* Form Fields Sampul */}
          <div className="grid md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Slug URL Undangan
              </label>
              <input
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-mono font-medium outline-none transition"
                placeholder="slug-url-undangan"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Judul Sampul
              </label>
              <input
                value={editing.judul_sampul || ""}
                onChange={(e) => setEditing({ ...editing, judul_sampul: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
                placeholder="UNDANGAN"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Tanggal di Sampul Depan
              </label>
              <input
                value={editing.tanggal_sampul || ""}
                onChange={(e) => setEditing({ ...editing, tanggal_sampul: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
                placeholder="Rabu, 18 November 2026"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Nama Lengkap Anak (Yang Dikhitan)
              </label>
              <input
                value={editing.nama_anak}
                onChange={(e) => setEditing({ ...editing, nama_anak: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-bold text-slate-900 outline-none transition"
                placeholder="Nama Lengkap Anak"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Label Acara
              </label>
              <input
                value={editing.label_acara || ""}
                onChange={(e) => setEditing({ ...editing, label_acara: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
                placeholder="Khitanan :"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Nama Orang Tua
              </label>
              <input
                value={editing.nama_orang_tua}
                onChange={(e) => setEditing({ ...editing, nama_orang_tua: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
                placeholder="Bpk. Kastam - Ibu Sarinih"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Teks Penutup Keluarga
              </label>
              <input
                value={editing.sekeluarga || ""}
                onChange={(e) => setEditing({ ...editing, sekeluarga: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
                placeholder="Sekeluarga"
              />
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SEKSI 2: FOTO DOKUMENTASI */}
        {/* ======================================================== */}
        <section id="media" className="scroll-mt-32 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <IconImage className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                2. Foto Dokumentasi Undangan
              </h2>
              <p className="text-xs text-slate-500">
                Unggah foto cover depan dan foto profil acara
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Foto Cover */}
            <div className="border border-slate-200/90 p-4 rounded-lg bg-slate-50/30 flex flex-col justify-between space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Foto Cover (Halaman Depan)
                </label>
                <p className="text-xs text-slate-400 mt-0.5 mb-3">Tampil di bingkai lengkung atas</p>
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
                  <p className="text-xs text-sky-700 font-semibold">Mengunggah foto cover...</p>
                )}
                <input
                  value={editing.foto_cover || ""}
                  onChange={(e) => setEditing({ ...editing, foto_cover: e.target.value })}
                  placeholder="Atau tempel URL gambar di sini"
                  className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-xs font-mono outline-none"
                />
              </div>
            </div>

            {/* Foto Acara */}
            <div className="border border-slate-200/90 p-4 rounded-lg bg-slate-50/30 flex flex-col justify-between space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Foto Profil Acara (Foto Bulat)
                </label>
                <p className="text-xs text-slate-400 mt-0.5 mb-3">Tampil di lingkaran detail acara</p>
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
                  <p className="text-xs text-sky-700 font-semibold">Mengunggah foto acara...</p>
                )}
                <input
                  value={editing.foto_acara || ""}
                  onChange={(e) => setEditing({ ...editing, foto_acara: e.target.value })}
                  placeholder="Atau tempel URL gambar di sini"
                  className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-xs font-mono outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SEKSI 3: WAKTU, JADWAL & LOKASI */}
        {/* ======================================================== */}
        <section id="acara" className="scroll-mt-32 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <IconCalendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                3. Waktu, Jadwal &amp; Lokasi Acara
              </h2>
              <p className="text-xs text-slate-500">
                Target hitung mundur (countdown), alamat peta lokasi, serta hiburan
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
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
                onChange={(e) => setEditing({ ...editing, tanggal: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Jam Target Countdown
              </label>
              <input
                type="time"
                value={editing.jam ? String(editing.jam).slice(0, 5) : ""}
                onChange={(e) => setEditing({ ...editing, jam: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Teks Hari Acara
              </label>
              <input
                value={editing.hari_acara || ""}
                onChange={(e) => setEditing({ ...editing, hari_acara: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
                placeholder="Rabu malam Kamis"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Teks Tanggal Acara
              </label>
              <input
                value={editing.tanggal_acara || ""}
                onChange={(e) => setEditing({ ...editing, tanggal_acara: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
                placeholder="18 – 19 November 2026"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Teks Waktu Acara
              </label>
              <input
                value={editing.jam_acara || ""}
                onChange={(e) => setEditing({ ...editing, jam_acara: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
                placeholder="Pkl. 08.00 Wib s/d Selesai"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Hiburan Acara
              </label>
              <input
                value={editing.hiburan || ""}
                onChange={(e) => setEditing({ ...editing, hiburan: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
                placeholder="Seni Reog Vikar Group"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Tempat &amp; Bulan Singkat (Header)
              </label>
              <input
                value={editing.tempat_singkat || ""}
                onChange={(e) => setEditing({ ...editing, tempat_singkat: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
                placeholder="Rambatan Kulon, November 2026"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Tautan Google Maps
              </label>
              <div className="relative">
                <input
                  value={editing.maps_url || ""}
                  onChange={(e) => setEditing({ ...editing, maps_url: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Alamat Lengkap Tempat Acara
              </label>
              <textarea
                value={editing.lokasi}
                onChange={(e) => setEditing({ ...editing, lokasi: e.target.value })}
                rows={2}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition leading-relaxed"
                placeholder="Desa Rambatan Kulon (Bangkir) Rt. 07 Rw. 01 blok Kangkung Kec. Lohbener Kab. Indramayu"
              />
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SEKSI 4: KAMI YANG BERBAHAGIA & TURUT MENGUNDANG */}
        {/* ======================================================== */}
        <section id="keluarga" className="scroll-mt-32 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <IconUsers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  4. Kami yang Berbahagia (Tuan Rumah)
                </h2>
                <p className="text-xs text-slate-500">
                  Daftar nama keluarga yang berbahagia. Ditampilkan di undangan dan template WhatsApp.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditing({
                  ...editing,
                  orang_berbahagia: [...editing.orang_berbahagia, { nama: "", keterangan: "" }],
                })
              }
              className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3.5 py-2 rounded-xl border border-emerald-200/80 transition"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>Tambah Tuan Rumah</span>
            </button>
          </div>

          <div className="space-y-3">
            {editing.orang_berbahagia.map((item, i) => (
              <div key={i} className="grid md:grid-cols-2 gap-3 border border-slate-200/80 bg-slate-50/40 p-4 rounded-2xl relative">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
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
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
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
                        orang_berbahagia: editing.orang_berbahagia.filter((_, idx) => idx !== i),
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

          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Alamat Keluarga Tuan Rumah
              </label>
              <textarea
                value={editing.alamat_keluarga || ""}
                onChange={(e) => setEditing({ ...editing, alamat_keluarga: e.target.value })}
                rows={3}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition leading-relaxed"
                placeholder="Desa Rambatan Kulon (Bangkir) Rt. 07 Rw. 01..."
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Ayat / Kutipan Do&apos;a
              </label>
              <textarea
                value={editing.ayat || ""}
                onChange={(e) => setEditing({ ...editing, ayat: e.target.value })}
                rows={3}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-serif italic outline-none transition leading-relaxed"
                placeholder="Kutipan doa atau ayat..."
              />
            </div>
          </div>

          {/* Turut Mengundang List */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                  <span className="text-xs font-mono font-bold text-slate-400 w-6 text-right select-none">{i + 1}.</span>
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
                        turut_mengundang: editing.turut_mengundang.filter((_, idx) => idx !== i),
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
        </section>

        {/* ======================================================== */}
        {/* SEKSI 5: REKENING & E-WALLET (AMPLOP DIGITAL) */}
        {/* ======================================================== */}
        <section id="amplop" className="scroll-mt-32 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <IconCreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  5. Rekening &amp; E-Wallet (Amplop Digital)
                </h2>
                <p className="text-xs text-slate-500">
                  Daftar opsi transfer tanda kasih untuk para tamu
                </p>
              </div>
            </div>
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
              className="inline-flex items-center gap-1.5 text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold px-3.5 py-2 rounded-xl border border-sky-200/80 transition"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>Tambah Rekening</span>
            </button>
          </div>

          <div className="space-y-3">
            {editing.rekening.map((item, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border border-slate-200/80 bg-slate-50/40 p-4 rounded-2xl items-end">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Tipe
                  </label>
                  <select
                    value={item.type}
                    onChange={(e) => {
                      const arr = [...editing.rekening];
                      arr[i] = { ...arr[i], type: e.target.value as "bank" | "wallet" };
                      setEditing({ ...editing, rekening: arr });
                    }}
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-sm font-semibold outline-none"
                  >
                    <option value="bank">Bank</option>
                    <option value="wallet">E-Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
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
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
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
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
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
                        rekening: editing.rekening.filter((_, idx) => idx !== i),
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
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Ucapan Footer Penutup Halaman
            </label>
            <input
              value={editing.footer_text || ""}
              onChange={(e) => setEditing({ ...editing, footer_text: e.target.value })}
              className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium outline-none transition"
              placeholder="Terima kasih atas do'a restu Bapak/Ibu/Saudara/i"
            />
          </div>
        </section>

        {/* ======================================================== */}
        {/* SEKSI 6: MUSIK LATAR & PEMOTONG DURASI */}
        {/* ======================================================== */}
        <section id="musik" className="scroll-mt-32 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <IconMusic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                6. Musik Latar Undangan &amp; Pengaturan Loop
              </h2>
              <p className="text-xs text-slate-500">
                Putar lagu otomatis saat tamu membuka undangan (dukung potong menit reff / chorus)
              </p>
            </div>
          </div>

          {/* Upload File Musik */}
          <div className="border border-slate-200/90 p-4 rounded-lg bg-slate-50/40 space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
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
              <p className="text-xs text-slate-700 font-semibold">Mengunggah audio... mohon tunggu.</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Judul Lagu (Tersimpan di Metadata)
              </label>
              <input
                value={editing.musik_judul || ""}
                onChange={(e) => setEditing({ ...editing, musik_judul: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-purple-500 font-medium outline-none transition"
                placeholder="Contoh: Raim Laode - Bersenja Gurau"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Atau Tempel URL Audio Langsung
              </label>
              <input
                value={editing.musik_url || ""}
                onChange={(e) => setEditing({ ...editing, musik_url: e.target.value })}
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
                <span>Pengaturan Potongan Menit Lagu (Reff / Bagian Terbaik)</span>
              </h3>
              <p className="text-xs text-purple-800/80 mt-0.5">
                Tamu biasanya melihat undangan secara singkat. Atur bagian lagu langsung ke reff agar langsung terdengar syahdu.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-purple-900 uppercase tracking-wider block mb-1">
                  Mulai Dari (Menit : Detik)
                </label>
                <div className="flex gap-2">
                  <input
                    value={editing.musik_start || ""}
                    onChange={(e) => setEditing({ ...editing, musik_start: e.target.value })}
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
                <p className="text-[11px] text-purple-700/70 mt-1 font-medium">Contoh: <strong>00:45</strong> (mulai di detik ke-45)</p>
              </div>

              <div>
                <label className="text-xs font-bold text-purple-900 uppercase tracking-wider block mb-1">
                  Selesai Pada (Menit : Detik)
                </label>
                <div className="flex gap-2">
                  <input
                    value={editing.musik_end || ""}
                    onChange={(e) => setEditing({ ...editing, musik_end: e.target.value })}
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
                <p className="text-[11px] text-purple-700/70 mt-1 font-medium">Bila tercapai, lagu otomatis berulang (loop) ke menit mulai.</p>
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

              <audio ref={previewAudioRef} controls src={editing.musik_url} className="w-full h-10 rounded-xl" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-500 gap-1 pt-1">
                <p>Judul: <strong className="text-slate-800">{editing.musik_judul || "(belum diisi)"}</strong></p>
                {(editing.musik_start || editing.musik_end) && (
                  <p className="font-mono text-purple-700 font-bold bg-white px-2 py-0.5 rounded-md border border-purple-200">
                    Potongan: {editing.musik_start || "00:00"} → {editing.musik_end || "Akhir"}
                  </p>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, musik_url: "", musik_judul: "", musik_start: "", musik_end: "", musik_disabled: true })}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                  <span>Hapus musik ini</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-400">
              Belum ada file musik yang aktif. Silakan upload file audio MP3/M4A di atas.
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* STICKY BOTTOM SAVE BAR */}
        {/* ======================================================== */}
        <div className="fixed bottom-3 left-3 right-3 max-w-5xl mx-auto bg-white p-3 sm:p-4 rounded-xl shadow-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 z-30">
          <div className="text-center sm:text-left">
            <p className="text-sm font-bold text-slate-900 tracking-tight">Periksa kembali data sebelum menyimpan</p>
            <p className="text-xs text-slate-500">Perubahan data langsung aktif pada seluruh halaman undangan publik.</p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition shadow-xs hover:shadow disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan Data...</span>
              </>
            ) : (
              <>
                <IconSave className="w-4 h-4" />
                <span>Simpan Semua Perubahan</span>
              </>
            )}
          </button>
        </div>

        </div>
      </div>
    </main>
  );
}
