"use client";

import { useDashboard } from "@/components/dashboard/DashboardShell";
import KelolaTamuClient from "@/components/tenant/KelolaTamuClient";

/** Isi halaman `/dashboard/tamu` — Kelola Tamu & RSVP. */
export default function KelolaTamuContent() {
  const { selectedSlug, selectedUndangan } = useDashboard();

  if (!selectedUndangan) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Pilih undangan terlebih dahulu.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-sky-600">
            Tamu &amp; RSVP
          </p>
          <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Kelola Tamu &amp; RSVP
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm">
            Daftar tamu, konfirmasi kehadiran, dan ucapan untuk{" "}
            <span className="font-semibold text-slate-700">{selectedUndangan.nama_anak}</span>.
          </p>
        </div>
      </div>

      <KelolaTamuClient
        key={selectedSlug}
        initialSlug={selectedSlug}
        access="tenant"
        embedded
      />
    </div>
  );
}
