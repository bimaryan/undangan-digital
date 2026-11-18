"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";

// ==========================================
// TIPE DATA
// ==========================================
type Undangan = {
  id: number;
  slug: string;
  nama_anak: string;
  nama_orang_tua: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  akses_token?: string;
  orang_berbahagia?: Array<{ nama: string; keterangan?: string }> | string;
  data_json?: {
    label_acara?: string;
    tanggal_acara?: string;
    jam_acara?: string;
    sekeluarga?: string;
    alamat_keluarga?: string;
  };
};

type Tamu = {
  id: number;
  nama: string;
  hadir?: boolean | null;
  ucapan?: string | null;
  rsvp_at?: string | null;
  created_at?: string;
};

type Rsvp = {
  id: number;
  nama: string;
  hadir: boolean;
  ucapan: string;
  created_at: string;
};

// ==========================================
// SVG ICONS (PROFESSIONAL & CLEAN)
// ==========================================
function IconWhatsApp({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.19 8.19 0 01-5.82 2.41c-1.45 0-2.88-.38-4.14-1.11l-.3-.17-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.44c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.41.08-.17.04-.32-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.78 2.71 4.31 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.07-.1-.23-.17-.48-.29z" />
    </svg>
  );
}

function IconCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconCheckCircle({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconXCircle({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function IconClock({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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

function IconLink({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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

function IconSearch({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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

function IconUserPlus({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

function IconMessageSquare({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconEdit({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

function IconRefresh({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function IconShieldLock({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <circle cx="12" cy="11" r="2" />
      <path d="M12 13v3" />
    </svg>
  );
}

function IconSparkles({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
function KelolaContent() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [undangan, setUndangan] = useState<Undangan | null>(null);
  const [tamu, setTamu] = useState<Tamu[]>([]);
  const [rsvpList, setRsvpList] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const keluar = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace(`/admin/u/${params.slug}/akses`);
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  // Input states
  const [namaTamuBaru, setNamaTamuBaru] = useState("");
  const [inputBanyakTamu, setInputBanyakTamu] = useState("");
  const [modeTambah, setModeTambah] = useState<"single" | "bulk">("single");
  const [prosesTambah, setProsesTambah] = useState(false);

  // Edit modal
  const [editingTamu, setEditingTamu] = useState<Tamu | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editHadir, setEditHadir] = useState<boolean | null>(null);
  const [editUcapan, setEditUcapan] = useState("");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKirim, setFilterKirim] = useState<
    "all" | "hadir" | "berhalangan" | "unconfirmed" | "sent" | "unsent"
  >("all");

  // Tab: Tamu vs RSVP
  const [activeTab, setActiveTab] = useState<"tamu" | "rsvp">("tamu");

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Status tracking tamu yang sudah dibagikan (disimpan di LocalStorage).
  // Dibaca setelah data termuat agar render server & client konsisten.
  const [sentMap, setSentMap] = useState<Record<number, boolean>>({});

  const toggleSent = (tamuId: number) => {
    setSentMap((prev) => {
      const updated = { ...prev, [tamuId]: !prev[tamuId] };
      try {
        localStorage.setItem(`undangan_sent_${params.slug}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const markAsSent = (tamuId: number) => {
    setSentMap((prev) => {
      const updated = { ...prev, [tamuId]: true };
      try {
        localStorage.setItem(`undangan_sent_${params.slug}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Muat data undangan, tamu, dan RSVP
  const muat = async () => {
    if (!params.slug) return;
    try {
      const res = await fetch(`/api/admin/u/${params.slug}`);
      if (!res.ok) {
        setError(
          "Sesi akses tidak valid atau halaman undangan tidak ditemukan. Buka kembali tautan akses dari admin."
        );
        return;
      }
      const data = await res.json();
      setUndangan(data.undangan);
      setTamu(data.tamu || []);
      setRsvpList(data.rsvp || []);
      setError("");
    } catch (err) {
      setError("Gagal terhubung ke server: " + String(err));
    }
  };

  useEffect(() => {
    let mounted = true;
    const muatAwal = async () => {
      if (!params.slug) return;
      try {
        const res = await fetch(`/api/admin/u/${params.slug}`);
        if (!mounted) return;
        if (!res.ok) {
          setError(
            "Sesi akses tidak valid atau halaman undangan tidak ditemukan. Buka kembali tautan akses dari admin."
          );
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        setUndangan(data.undangan);
        setTamu(data.tamu || []);
        setRsvpList(data.rsvp || []);
        setError("");
        setLoading(false);
        try {
          const saved = localStorage.getItem(`undangan_sent_${params.slug}`);
          if (saved) setSentMap(JSON.parse(saved));
        } catch {}
      } catch (err) {
        if (!mounted) return;
        setError("Gagal terhubung ke server: " + String(err));
        setLoading(false);
      }
    };
    muatAwal();
    return () => {
      mounted = false;
    };
  }, [params.slug]);

  // Tambah 1 Tamu Baru
  const tambahSatu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaTamuBaru.trim() || !params.slug) return;

    setProsesTambah(true);
    try {
      const res = await fetch(`/api/admin/u/${params.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: namaTamuBaru.trim() }),
      });
      if (res.ok) {
        setNamaTamuBaru("");
        await muat();
      }
    } finally {
      setProsesTambah(false);
    }
  };

  // Tambah Banyak Tamu Sekaligus (Bulk Import)
  const tambahBanyak = async () => {
    if (!inputBanyakTamu.trim() || !params.slug) return;
    const baris = inputBanyakTamu
      .split("\n")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    if (baris.length === 0) return;

    setProsesTambah(true);
    try {
      const res = await fetch(`/api/admin/u/${params.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daftar_nama: baris }),
      });
      if (res.ok) {
        setInputBanyakTamu("");
        setModeTambah("single");
        await muat();
      }
    } finally {
      setProsesTambah(false);
    }
  };

  // Simpan perubahan nama tamu & kehadiran (Edit)
  const simpanEditNama = async () => {
    if (!editingTamu || !editNama.trim() || !params.slug) return;
    try {
      const res = await fetch(`/api/admin/u/${params.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tamuId: editingTamu.id,
          nama: editNama.trim(),
          hadir: editHadir,
          ucapan: editUcapan.trim(),
        }),
      });
      if (res.ok) {
        setEditingTamu(null);
        await muat();
      }
    } catch {}
  };

  // Hapus tamu
  const hapus = async (id: number, nama: string) => {
    if (!confirm(`Hapus tamu "${nama}" dari daftar undangan?`)) return;
    await fetch(`/api/admin/u/${params.slug}?tamuId=${id}`, {
      method: "DELETE",
    });
    muat();
  };

  // Hapus RSVP (jika spam)
  const hapusRsvp = async (id: number) => {
    if (!confirm("Hapus pesan ucapan/konfirmasi kehadiran ini?")) return;
    await fetch(`/api/admin/u/${params.slug}?rsvpId=${id}`, {
      method: "DELETE",
    });
    muat();
  };

  // Generator Tautan Undangan Khusus Tamu (dengan &tid= agar tercatat akurat)
  const getGuestLink = (tamuNama: string, tamuId?: number) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const namaSlug = tamuNama
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const tidParam = tamuId ? `&tid=${tamuId}` : "";
    return `${origin}/u/${params.slug}/${namaSlug || "tamu"}?to=${encodeURIComponent(tamuNama)}${tidParam}`;
  };

  // Generator Teks Pesan WhatsApp Siap Kirim
  const getWaMessage = (tamuNama: string, tamuId?: number) => {
    const link = getGuestLink(tamuNama, tamuId);
    const namaAnak = undangan?.nama_anak || "Zayyan Arkana Alfarizqi";
    const labelAcara = (undangan?.data_json?.label_acara || "Khitanan :")
      .replace(/:/g, "")
      .trim();
    const hariTgl = undangan?.data_json?.tanggal_acara || "18 – 19 November 2026";
    const jam =
      undangan?.data_json?.jam_acara ||
      (undangan?.jam ? `Pkl. ${String(undangan.jam).slice(0, 5)} WIB` : "Pkl. 08.00 WIB");
    const lokasi =
      undangan?.lokasi ||
      "Desa Rambatan Kulon (Bangkir) Rt. 07 Rw. 01 blok Kangkung Kec. Lohbener Kab. Indramayu";

    // Ekstrak nama keluarga secara terintegrasi dan berurutan dari orang_berbahagia
    let daftarOrang: string[] = [];
    if (undangan?.orang_berbahagia) {
      let raw: unknown = undangan.orang_berbahagia;
      if (typeof raw === "string") {
        try {
          raw = JSON.parse(raw);
        } catch {
          raw = [];
        }
      }
      if (Array.isArray(raw) && raw.length > 0) {
        daftarOrang = raw
          .map((item) =>
            typeof item === "object" && item !== null && "nama" in item
              ? String(item.nama).trim()
              : String(item).trim()
          )
          .filter((n) => n.length > 0);
      }
    }

    if (daftarOrang.length === 0) {
      if (undangan?.nama_orang_tua) {
        daftarOrang = [undangan.nama_orang_tua.trim()];
      } else {
        daftarOrang = ["Bpk. Kastam", "Ibu Sarinih"];
      }
    }

    const teksHormatKami = daftarOrang.map((nama) => `*${nama}*`).join("\n");

    return (
      `Kepada Yth.\n` +
      `Bapak/Ibu/Saudara/i: *${tamuNama}*\n` +
      `_________________________________\n\n` +
      `Assalamu'alaikum Warahmatullahi Wabarakatuh\n\n` +
      `Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara syukuran ${labelAcara} putra kami:\n\n` +
      `*${namaAnak}*\n\n` +
      `Waktu Acara:\n${hariTgl}\n${jam}\n\n` +
      `Lokasi:\n${lokasi}\n\n` +
      `Tautan Undangan Digital:\n` +
      `Silakan buka tautan undangan resmi untuk info lengkap, peta lokasi & do'a restu:\n` +
      `👉 ${link}\n\n` +
      `Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan do'a restu.\n\n` +
      `Wassalamu'alaikum Warahmatullahi Wabarakatuh\n\n` +
      `Hormat kami sekeluarga,\n` +
      `${teksHormatKami}`
    );
  };

  // Aksi Kirim WhatsApp
  const handleKirimWa = (t: Tamu) => {
    markAsSent(t.id);
    const msg = getWaMessage(t.nama, t.id);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  // Aksi Salin Pesan WA
  const handleSalinPesanWa = (t: Tamu) => {
    const msg = getWaMessage(t.nama, t.id);
    navigator.clipboard.writeText(msg);
    setCopiedKey(`wa-${t.id}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Aksi Salin Link Saja
  const handleSalinLink = (t: Tamu) => {
    const link = getGuestLink(t.nama, t.id);
    navigator.clipboard.writeText(link);
    setCopiedKey(`link-${t.id}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Filter daftar tamu
  const filteredTamu = useMemo(() => {
    return tamu.filter((t) => {
      const cocokNama = t.nama.toLowerCase().includes(searchQuery.toLowerCase());
      const isSent = !!sentMap[t.id];
      if (filterKirim === "sent") return cocokNama && isSent;
      if (filterKirim === "unsent") return cocokNama && !isSent;
      if (filterKirim === "hadir") return cocokNama && t.hadir === true;
      if (filterKirim === "berhalangan") return cocokNama && t.hadir === false;
      if (filterKirim === "unconfirmed") return cocokNama && t.hadir !== true && t.hadir !== false;
      return cocokNama;
    });
  }, [tamu, searchQuery, filterKirim, sentMap]);

  // Statistik
  const totalTamu = tamu.length;
  const sudahDikirimCount = Object.keys(sentMap).filter((id) => sentMap[Number(id)]).length;
  const belumDikirimCount = Math.max(0, totalTamu - sudahDikirimCount);
  const konfirmasiHadirCount = tamu.filter((t) => t.hadir === true).length;
  const konfirmasiBerhalanganCount = tamu.filter((t) => t.hadir === false).length;
  const belumKonfirmasiCount = tamu.filter((t) => t.hadir !== true && t.hadir !== false).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900/5 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-sm w-full">
          <div className="w-9 h-9 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="font-semibold text-slate-800 text-base">Memuat Panel Tuan Rumah</h2>
          <p className="text-xs text-slate-400 mt-1">Menyiapkan daftar tamu &amp; konfirmasi kehadiran...</p>
        </div>
      </main>
    );
  }

  if (error || !undangan) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 text-center max-w-md w-full">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
            <IconShieldLock className="w-7 h-7" />
          </div>
          <h2 className="font-bold text-slate-900 text-xl tracking-tight">Akses Tidak Diizinkan</h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {error || "Sesi akses tidak valid. Silakan buka tautan akses dari admin."}
          </p>
          <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono text-slate-700 text-left">
            <span className="text-slate-400 block mb-1">Halaman akses tuan rumah:</span>
            <span className="text-sky-700 font-bold break-all">/admin/u/{params.slug}/akses</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl text-sm transition shadow-sm"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-slate-800 p-3 sm:p-4 lg:p-5 font-sans antialiased">
      <div className="mx-auto grid max-w-[1440px] gap-4 lg:gap-5 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] flex-col rounded-xl border border-slate-200 bg-white p-4 text-slate-600 lg:flex">
          <a href={`/u/${undangan.slug}`} target="_blank" rel="noopener noreferrer" className="mb-8 flex items-center gap-3 px-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white">I</span>
            <span>
              <strong className="block text-sm text-slate-900">InovaInvite</strong>
              <span className="text-[11px] text-slate-500">Panel tuan rumah</span>
            </span>
          </a>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="truncate text-sm font-semibold text-slate-900">{undangan.nama_anak}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{undangan.nama_orang_tua}</p>
          </div>

          <p className="mt-7 px-3 text-[11px] font-semibold text-slate-400">MENU UTAMA</p>
          <nav className="mt-3 space-y-1 text-sm">
            <a href="#ringkasan" className="flex items-center gap-3 rounded-md px-3 py-2.5 font-medium transition hover:bg-slate-100 hover:text-slate-900"><IconSparkles className="w-4 h-4" />Ringkasan</a>
            <button type="button" onClick={() => setActiveTab("tamu")} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition ${activeTab === "tamu" ? "bg-slate-100 font-semibold text-slate-900" : "font-medium hover:bg-slate-100 hover:text-slate-900"}`}><IconUsers className="w-4 h-4" />Daftar tamu <span className="ml-auto text-[11px] tabular-nums text-slate-400">{tamu.length}</span></button>
            <button type="button" onClick={() => setActiveTab("rsvp")} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition ${activeTab === "rsvp" ? "bg-slate-100 font-semibold text-slate-900" : "font-medium hover:bg-slate-100 hover:text-slate-900"}`}><IconMessageSquare className="w-4 h-4" />Buku ucapan <span className="ml-auto text-[11px] tabular-nums text-slate-400">{rsvpList.length}</span></button>
          </nav>

          <div className="mt-auto space-y-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={muat} className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><IconRefresh className="w-4 h-4" />Segarkan data</button>
            <a href={`/u/${undangan.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700"><IconExternalLink className="w-4 h-4" />Lihat undangan</a>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">

        {/* 1. HEADER UTAMA (ELEGANT GLASS CARD) */}
        <div className="sticky top-3 z-30 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-500">PANEL TUAN RUMAH</span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-mono bg-slate-100/80 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400">Akses:</span>
                  <strong className="text-slate-700 font-semibold">Tuan rumah</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Pengelolaan Tamu Undangan
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 flex-wrap">
                <span>Syukuran Khitanan</span>
                <strong className="text-slate-800 font-semibold">{undangan.nama_anak}</strong>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">{undangan.nama_orang_tua}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <a
                href={`/u/${undangan.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 text-sm bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-semibold shadow-xs hover:shadow transition-all duration-150"
              >
                <span>Lihat Undangan</span>
                <IconExternalLink className="w-4 h-4 opacity-80" />
              </a>
              <button
                type="button"
                onClick={keluar}
                disabled={loggingOut}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 text-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-4 py-3 rounded-2xl font-semibold transition disabled:opacity-60"
              >
                {loggingOut ? "Keluar..." : "Keluar"}
              </button>
            </div>
          </div>
        </div>

        <nav aria-label="Navigasi panel tuan rumah" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
          <a href="#ringkasan" className="whitespace-nowrap rounded-xl bg-sky-100 px-3 py-2 text-xs font-bold text-sky-800">Ringkasan</a>
          <button type="button" onClick={() => setActiveTab("tamu")} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold ${activeTab === "tamu" ? "bg-sky-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>Daftar tamu</button>
          <button type="button" onClick={() => setActiveTab("rsvp")} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold ${activeTab === "rsvp" ? "bg-sky-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>Buku ucapan</button>
          <button type="button" onClick={muat} className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">Segarkan</button>
        </nav>

        {/* 2. STATISTIK KARTU RINGKASAN (MODERN METRIC TILES) */}
        <div id="ringkasan" className="scroll-mt-32 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Total Tamu */}
          <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Tamu</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <IconUsers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{totalTamu}</div>
            <p className="text-xs text-slate-400 mt-1">Nama terdaftar dalam sistem</p>
          </div>

          {/* Terkirim WA */}
          <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-xs hover:border-sky-300 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Terkirim WA</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <IconWhatsApp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-sky-700 tracking-tight">{sudahDikirimCount}</div>
            <p className="text-xs text-sky-600/80 mt-1 font-medium">{belumDikirimCount} belum dibagikan</p>
          </div>

          {/* Konfirmasi Hadir */}
          <div className="bg-white p-4 rounded-lg border border-emerald-200/80 bg-emerald-50/20 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Konfirmasi Hadir</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <IconCheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-700 tracking-tight">{konfirmasiHadirCount}</div>
            <p className="text-xs text-emerald-700/80 mt-1 font-medium">Siap menghadiri acara</p>
          </div>

          {/* Berhalangan */}
          <div className="bg-white p-4 rounded-lg border border-rose-200/80 bg-rose-50/20 shadow-xs hover:border-rose-300 transition">
            <div className="flex items-center justify-between text-rose-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Berhalangan</span>
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <IconXCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-rose-700 tracking-tight">{konfirmasiBerhalanganCount}</div>
            <p className="text-xs text-rose-700/80 mt-1 font-medium">{belumKonfirmasiCount} menunggu respon</p>
          </div>
        </div>

        {/* 3. NAVIGASI TAB (CLEAN SEGMENTED CONTROL) */}
        <div className="flex border-b border-slate-200/90 gap-6 px-1">
          <button
            type="button"
            onClick={() => setActiveTab("tamu")}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2.5 ${
              activeTab === "tamu"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <IconUsers className="w-4 h-4" />
            <span>Daftar Tamu &amp; Undangan</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold transition ${
                activeTab === "tamu"
                  ? "bg-sky-100 text-sky-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tamu.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rsvp")}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2.5 ${
              activeTab === "rsvp"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <IconMessageSquare className="w-4 h-4" />
            <span>Do&apos;a Restu &amp; Buku Tamu</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold transition ${
                activeTab === "rsvp"
                  ? "bg-sky-100 text-sky-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {rsvpList.length}
            </span>
          </button>
        </div>

        {/* 4. KONTEN TAB: KELOLA TAMU */}
        {activeTab === "tamu" && (
          <div id="daftar-tamu" className="scroll-mt-32 space-y-4">

            {/* FORM TAMBAH TAMU */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg tracking-tight flex items-center gap-2">
                    <IconUserPlus className="w-5 h-5 text-sky-600" />
                    <span>Tambah Tamu Undangan</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tambahkan nama perorangan atau rombongan keluarga untuk dibuatkan tautan khusus
                  </p>
                </div>

                {/* Segmented Button Mode */}
                <div className="inline-flex bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setModeTambah("single")}
                    className={`px-3.5 py-1.5 rounded-xl transition ${
                      modeTambah === "single"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    + Satu Tamu
                  </button>
                  <button
                    type="button"
                    onClick={() => setModeTambah("bulk")}
                    className={`px-3.5 py-1.5 rounded-xl transition ${
                      modeTambah === "bulk"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    + Import Banyak (Bulk)
                  </button>
                </div>
              </div>

              {/* Mode Satu Tamu */}
              {modeTambah === "single" && (
                <form onSubmit={tambahSatu} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      value={namaTamuBaru}
                      onChange={(e) => setNamaTamuBaru(e.target.value)}
                      placeholder="Contoh: Bpk. H. Ahmad & Keluarga, dr. Rian, atau Sahabat Hendra"
                      className="w-full border border-slate-300/90 bg-slate-50/50 p-3.5 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition placeholder:text-slate-400 font-medium"
                      disabled={prosesTambah}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={prosesTambah || !namaTamuBaru.trim()}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-7 py-3.5 rounded-2xl font-bold text-sm transition shadow-xs hover:shadow disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {prosesTambah ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <IconUserPlus className="w-4 h-4" />
                        <span>Simpan Tamu</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Mode Tambah Banyak (Bulk Import) */}
              {modeTambah === "bulk" && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    💡 <strong>Tips:</strong> Salin (copy) daftar nama tamu dari WhatsApp atau Excel, lalu tempel di bawah dengan format <strong>1 nama per baris</strong>.
                  </p>
                  <textarea
                    rows={6}
                    value={inputBanyakTamu}
                    onChange={(e) => setInputBanyakTamu(e.target.value)}
                    placeholder="Bpk. H. Supardi & Keluarga&#10;Ibu Hj. Aminah&#10;Bpk. Rusdi - Ibu Titin&#10;dr. Hendrawan & Istri&#10;Keluarga Besar Bani Kastam"
                    className="border border-slate-300/90 bg-slate-50/50 p-4 rounded-2xl text-sm font-sans outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 w-full transition placeholder:text-slate-400 leading-relaxed"
                    disabled={prosesTambah}
                  />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                    <span className="text-xs text-slate-500 font-medium">
                      Terdeteksi:{" "}
                      <strong className="text-slate-800 font-bold">
                        {
                          inputBanyakTamu
                            .split("\n")
                            .filter((b) => b.trim().length > 0).length
                        }
                      </strong>{" "}
                      nama tamu
                    </span>
                    <button
                      type="button"
                      onClick={tambahBanyak}
                      disabled={
                        prosesTambah ||
                        inputBanyakTamu.split("\n").filter((b) => b.trim().length > 0).length === 0
                      }
                      className="bg-sky-600 hover:bg-sky-700 text-white px-7 py-3 rounded-2xl font-bold text-sm transition shadow-xs hover:shadow disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {prosesTambah ? "Menyimpan Semua..." : "Import Semua Tamu"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DAFTAR TAMU & FILTER */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg tracking-tight">
                    Daftar Nama Tamu
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kirim link via WhatsApp, pantau konfirmasi kehadiran, dan baca do&apos;a tamu
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setFilterKirim("all")}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      filterKirim === "all"
                        ? "bg-white text-slate-900 font-bold shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Semua ({tamu.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterKirim("hadir")}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      filterKirim === "hadir"
                        ? "bg-emerald-600 text-white font-bold shadow-xs"
                        : "text-emerald-700 hover:text-emerald-900"
                    }`}
                  >
                    <IconCheckCircle className="w-3.5 h-3.5" />
                    <span>Hadir ({konfirmasiHadirCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterKirim("berhalangan")}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      filterKirim === "berhalangan"
                        ? "bg-rose-600 text-white font-bold shadow-xs"
                        : "text-rose-700 hover:text-rose-900"
                    }`}
                  >
                    <IconXCircle className="w-3.5 h-3.5" />
                    <span>Berhalangan ({konfirmasiBerhalanganCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterKirim("unconfirmed")}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      filterKirim === "unconfirmed"
                        ? "bg-white text-slate-800 font-bold shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <IconClock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Belum Konfirmasi ({belumKonfirmasiCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterKirim("unsent")}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      filterKirim === "unsent"
                        ? "bg-white text-sky-800 font-bold shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>Belum Kirim WA ({belumDikirimCount})</span>
                  </button>
                </div>
              </div>

              {/* Input Pencarian */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <IconSearch className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama tamu undangan..."
                  className="w-full pl-11 pr-4 py-3 border border-slate-200/90 bg-slate-50/50 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* LIST KARTU TAMU */}
              {filteredTamu.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <IconUsers className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    {searchQuery
                      ? "Tidak ada nama tamu yang cocok dengan pencarian."
                      : "Belum ada tamu undangan yang ditambahkan."}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Gunakan formulir di atas untuk menambahkan daftar tamu Anda.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredTamu.map((t, index) => {
                    const guestLink = getGuestLink(t.nama, t.id);
                    const isSent = !!sentMap[t.id];

                    return (
                      <div
                        key={t.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 ${
                          t.hadir === true
                            ? "bg-emerald-50/25 border-emerald-200/90 shadow-2xs hover:border-emerald-300"
                            : t.hadir === false
                            ? "bg-rose-50/20 border-rose-200/80 shadow-2xs hover:border-rose-300"
                            : isSent
                            ? "bg-slate-50/70 border-slate-200/80"
                            : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

                          {/* Info Tamu & Ucapan */}
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-semibold select-none">
                                #{index + 1}
                              </span>
                              <h3 className="font-bold text-slate-900 text-base tracking-tight">
                                {t.nama}
                              </h3>

                              {/* BADGE RSVP KEHADIRAN */}
                              {t.hadir === true && (
                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                                  <IconCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Hadir</span>
                                </span>
                              )}
                              {t.hadir === false && (
                                <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                                  <IconXCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Berhalangan</span>
                                </span>
                              )}
                              {(t.hadir === null || t.hadir === undefined) && (
                                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-200/70">
                                  <IconClock className="w-3 h-3 text-slate-400" />
                                  <span>Belum Konfirmasi</span>
                                </span>
                              )}

                              {/* BADGE STATUS TERKIRIM */}
                              {isSent ? (
                                <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200/80">
                                  <IconCheck className="w-3 h-3 text-sky-600" />
                                  <span>Terkirim WA</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px] font-medium px-1.5 py-0.5">
                                  Belum Kirim WA
                                </span>
                              )}
                            </div>

                            {/* Tautan URL Tamu */}
                            <div className="flex items-center gap-1.5 mt-1.5 text-slate-400">
                              <IconLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <a
                                href={guestLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-sky-600 hover:text-sky-700 hover:underline truncate max-w-xs sm:max-w-md font-mono"
                              >
                                {guestLink}
                              </a>
                            </div>

                            {/* KOTAK UCAPAN & DO'A TAMU */}
                            {t.ucapan && (
                              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-slate-800">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
                                    <IconMessageSquare className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Do&apos;a &amp; Ucapan Tamu:</span>
                                  </span>
                                  {t.rsvp_at && (
                                    <span className="text-[10px] text-amber-800/80 font-mono font-medium">
                                      {new Date(t.rsvp_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed font-serif pl-1">
                                  &ldquo;{t.ucapan}&rdquo;
                                </p>
                              </div>
                            )}
                          </div>

                          {/* DERETAN TOMBOL AKSI */}
                          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex-shrink-0">

                            {/* Kirim WhatsApp */}
                            <button
                              type="button"
                              onClick={() => handleKirimWa(t)}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-98"
                              title="Kirim pesan langsung via WhatsApp"
                            >
                              <IconWhatsApp className="w-4 h-4" />
                              <span>Kirim WA</span>
                            </button>

                            {/* Salin Pesan WA */}
                            <button
                              type="button"
                              onClick={() => handleSalinPesanWa(t)}
                              className={`text-xs px-3.5 py-2.5 rounded-xl font-bold border transition flex items-center gap-1.5 shadow-2xs ${
                                copiedKey === `wa-${t.id}`
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300"
                              }`}
                              title="Salin template teks undangan lengkap"
                            >
                              {copiedKey === `wa-${t.id}` ? (
                                <>
                                  <IconCheck className="w-3.5 h-3.5" />
                                  <span>Tersalin</span>
                                </>
                              ) : (
                                <>
                                  <IconCopy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Salin Pesan</span>
                                </>
                              )}
                            </button>

                            {/* Salin Link */}
                            <button
                              type="button"
                              onClick={() => handleSalinLink(t)}
                              className={`text-xs px-2.5 py-2.5 rounded-xl font-semibold border transition flex items-center gap-1 shadow-2xs ${
                                copiedKey === `link-${t.id}`
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                              title="Salin tautan web undangan"
                            >
                              {copiedKey === `link-${t.id}` ? (
                                <IconCheck className="w-3.5 h-3.5" />
                              ) : (
                                <IconLink className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>

                            {/* Buka Preview */}
                            <a
                              href={guestLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-2.5 rounded-xl transition inline-flex items-center gap-1"
                              title="Buka tampilan undangan khusus nama tamu ini"
                            >
                              <IconExternalLink className="w-3.5 h-3.5 text-slate-600" />
                              <span className="hidden sm:inline">Buka</span>
                            </a>

                            {/* Toggle Tandai Terkirim */}
                            <button
                              type="button"
                              onClick={() => toggleSent(t.id)}
                              className={`text-xs p-2.5 rounded-xl transition flex items-center justify-center ${
                                isSent
                                  ? "bg-sky-50 text-sky-700 border border-sky-200/80 hover:bg-sky-100"
                                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              }`}
                              title={isSent ? "Tandai belum dikirim" : "Tandai sudah terkirim"}
                            >
                              <IconCheck className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTamu(t);
                                setEditNama(t.nama);
                                setEditHadir(t.hadir ?? null);
                                setEditUcapan(t.ucapan || "");
                              }}
                              className="text-xs text-slate-500 hover:text-sky-600 p-2.5 rounded-xl hover:bg-sky-50 transition"
                              title="Edit nama tamu atau perbarui status kehadiran"
                            >
                              <IconEdit className="w-4 h-4" />
                            </button>

                            {/* Hapus */}
                            <button
                              type="button"
                              onClick={() => hapus(t.id, t.nama)}
                              className="text-xs text-slate-400 hover:text-rose-600 p-2.5 rounded-xl hover:bg-rose-50 transition"
                              title="Hapus tamu ini"
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TIPS ELEGANT CALLOUT BOX */}
            <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-xl">
              <h3 className="font-bold text-sky-950 text-sm mb-2 flex items-center gap-2">
                <IconSparkles className="w-4 h-4 text-sky-600" />
                <span>Panduan Membagikan Undangan Digital</span>
              </h3>
              <ul className="text-xs text-sky-900/90 space-y-1.5 list-disc list-inside leading-relaxed font-medium">
                <li>
                  Klik tombol <strong>Kirim WA</strong> untuk membuka aplikasi WhatsApp dengan pesan undangan yang sudah tertata rapi.
                </li>
                <li>
                  Nama tamu akan secara otomatis tertera di amplop sampul dan formulir konfirmasi kehadiran.
                </li>
                <li>
                  Saat tamu mengisi konfirmasi kehadiran dan do&apos;a di website, statusnya <strong>langsung diperbarui secara otomatis di baris nama tamu</strong> di atas.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* 5. KONTEN TAB: SEMUA DO'A & BUKU TAMU */}
        {activeTab === "rsvp" && (
          <div id="buku-ucapan" className="scroll-mt-32 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-bold text-slate-900 text-lg tracking-tight">
                  Buku Tamu &amp; Do&apos;a Restu
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar seluruh tamu yang telah mengirimkan ucapan dan konfirmasi kehadiran
                </p>
              </div>
              <button
                type="button"
                onClick={muat}
                className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl font-semibold transition"
              >
                <IconRefresh className="w-3.5 h-3.5 text-slate-500" />
                <span>Segarkan Data</span>
              </button>
            </div>

            {rsvpList.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <IconMessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Belum ada konfirmasi kehadiran atau do&apos;a yang masuk.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Ucapan yang dikirimkan tamu dari halaman undangan akan otomatis tercatat di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {rsvpList.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-slate-900 text-sm font-bold tracking-tight">{r.nama}</strong>
                          {r.hadir ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <IconCheck className="w-3 h-3 text-emerald-600" />
                              <span>Hadir</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                              <IconXCircle className="w-3 h-3 text-rose-600" />
                              <span>Berhalangan</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {new Date(r.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => hapusRsvp(r.id)}
                        className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition"
                        title="Hapus pesan ucapan ini"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>

                    {r.ucapan && (
                      <div className="mt-3 p-3.5 bg-white rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif italic shadow-2xs">
                        &ldquo;{r.ucapan}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL EDIT TAMU & KEHADIRAN MANUAL */}
        {editingTamu && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-lg tracking-tight">Edit Tamu &amp; Kehadiran</h3>
                <button
                  type="button"
                  onClick={() => setEditingTamu(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
                Perbarui ejaan nama tamu atau catat konfirmasi kehadiran bila tamu mengabari secara langsung.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Nama Tamu
                  </label>
                  <input
                    type="text"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full border border-slate-300 p-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium"
                    placeholder="Nama Lengkap Tamu"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Status Kehadiran
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditHadir(true)}
                      className={`py-2.5 text-xs font-bold rounded-2xl border transition flex items-center justify-center gap-1.5 ${
                        editHadir === true
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <IconCheckCircle className="w-3.5 h-3.5" />
                      <span>Hadir</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditHadir(false)}
                      className={`py-2.5 text-xs font-bold rounded-2xl border transition flex items-center justify-center gap-1.5 ${
                        editHadir === false
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <IconXCircle className="w-3.5 h-3.5" />
                      <span>Berhalangan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditHadir(null)}
                      className={`py-2.5 text-xs font-semibold rounded-2xl border transition flex items-center justify-center gap-1.5 ${
                        editHadir === null
                          ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <IconClock className="w-3.5 h-3.5" />
                      <span>Belum Tahu</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Catatan / Ucapan Do&apos;a
                  </label>
                  <textarea
                    rows={3}
                    value={editUcapan}
                    onChange={(e) => setEditUcapan(e.target.value)}
                    className="w-full border border-slate-300 p-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-serif leading-relaxed"
                    placeholder="Ucapan dan do'a restu dari tamu..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingTamu(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={simpanEditNama}
                  disabled={!editNama.trim()}
                  className="px-6 py-2.5 text-xs font-bold bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition disabled:opacity-50 shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </main>
  );
}

export default function KelolaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-sm text-slate-500 font-sans">
          Memuat Panel Tuan Rumah...
        </div>
      }
    >
      <KelolaContent />
    </Suspense>
  );
}
