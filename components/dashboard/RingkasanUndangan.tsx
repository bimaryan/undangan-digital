"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/components/dashboard/DashboardShell";
import { EDITOR_SECTIONS, EDITOR_SECTION_META } from "@/lib/dashboard-sections";

type SummaryStats = {
  tamuTotal: number;
  hadir: number;
  berhalangan: number;
  rsvpCount: number;
};

const STAT_CARDS = [
  { key: "tamuTotal", label: "Total Tamu", unit: "orang", dot: "bg-sky-500" },
  { key: "hadir", label: "Konfirmasi Hadir", unit: "hadir", dot: "bg-emerald-500" },
  { key: "berhalangan", label: "Berhalangan", unit: "orang", dot: "bg-rose-500" },
  { key: "rsvpCount", label: "Ucapan Masuk", unit: "pesan", dot: "bg-amber-500" },
] as const;

const VALUE_TONE = {
  tamuTotal: "text-slate-900",
  hadir: "text-emerald-600",
  berhalangan: "text-rose-600",
  rsvpCount: "text-slate-900",
} as const;

export default function RingkasanUndangan() {
  const { selectedUndangan, selectedSlug, hrefWithSlug } = useDashboard();
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!selectedSlug) return;
    let alive = true;
    fetch(`/api/admin/u/${encodeURIComponent(selectedSlug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!alive || !data) return;
        const tamuList = Array.isArray(data.tamu) ? data.tamu : [];
        const rsvpList = Array.isArray(data.rsvp) ? data.rsvp : [];
        setStats({
          tamuTotal: tamuList.length,
          hadir: tamuList.filter((t: { hadir?: boolean | null }) => t.hadir === true).length,
          berhalangan: tamuList.filter((t: { hadir?: boolean | null }) => t.hadir === false).length,
          rsvpCount: rsvpList.length,
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [selectedSlug]);

  if (!selectedUndangan) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Pilih undangan terlebih dahulu.
      </div>
    );
  }

  const copyPublicLink = (slug: string) => {
    const url = `${window.location.origin}/u/${encodeURIComponent(slug)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* ── Hero Undangan ── */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                Undangan Digital Aktif
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-xs text-slate-400">/u/{selectedUndangan.slug}</span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {selectedUndangan.nama_anak}
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              {selectedUndangan.nama_orang_tua} · {String(selectedUndangan.tanggal).slice(0, 10)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => copyPublicLink(selectedUndangan.slug)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-slate-500">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{copiedLink ? "✓ Tautan Disalin!" : "Salin Link Web"}</span>
            </button>

            <a
              href={`/u/${selectedUndangan.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
            >
              <span>Lihat Undangan</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Statistik ── */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {card.label}
              </span>
              <span className={`size-2 rounded-full ${card.dot}`} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-black ${VALUE_TONE[card.key]}`}>
                {stats ? stats[card.key] : "…"}
              </span>
              <span className="text-xs font-semibold text-slate-400">{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Detail Acara + Tautan Panitia ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Informasi Pelaksanaan Acara</h2>
              <p className="text-xs text-slate-500">Detail waktu dan lokasi yang tampil pada undangan</p>
            </div>
            <Link
              href={hrefWithSlug("/dashboard/acara")}
              className="shrink-0 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
            >
              Ubah Jadwal →
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tanggal Acara</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {String(selectedUndangan.tanggal).slice(0, 10)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Waktu / Jam</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {String(selectedUndangan.jam).slice(0, 5)} WIB s/d Selesai
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Lokasi Acara</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {selectedUndangan.lokasi || "Lokasi acara belum ditentukan."}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            <Link
              href={hrefWithSlug("/dashboard/identitas")}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit Detail Undangan</span>
            </Link>

            <Link
              href={hrefWithSlug("/dashboard/tamu")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <span>Kelola Tamu &amp; RSVP</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Pintasan Editor ── */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Kelola Isi Undangan</h2>
            <p className="text-xs text-slate-500">Pilih bagian yang ingin diubah</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EDITOR_SECTIONS.map((id) => {
            const meta = EDITOR_SECTION_META[id];
            return (
              <Link
                key={id}
                href={hrefWithSlug(`/dashboard/${id}`)}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/40 p-4 transition hover:border-sky-200 hover:bg-sky-50/60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-2xs ring-1 ring-slate-200 transition group-hover:text-sky-600 group-hover:ring-sky-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-900">{meta.label}</span>
                  <span className="block truncate text-[11px] text-slate-500">{meta.description}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
