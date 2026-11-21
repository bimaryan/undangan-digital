"use client";

import Link from "next/link";
import { useDashboard } from "@/components/dashboard/DashboardShell";
import { EDITOR_SECTION_META, type EditorSectionId } from "@/lib/dashboard-sections";
import UndanganEditor from "@/components/tenant/UndanganEditor";

/**
 * Isi halaman untuk setiap bagian editor undangan
 * (`/dashboard/identitas`, `/dashboard/media`, dst).
 */
export default function EditorSection({ section }: { section: EditorSectionId }) {
  const { selectedSlug, selectedUndangan, hrefWithSlug } = useDashboard();
  const meta = EDITOR_SECTION_META[section];

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
            Editor Undangan
          </p>
          <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            {meta.label}
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm">{meta.description}</p>
        </div>

        <Link
          href={hrefWithSlug("/dashboard/tamu")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-700 shadow-2xs transition hover:bg-sky-100"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Kelola Tamu</span>
        </Link>
      </div>

      <UndanganEditor key={selectedSlug} slug={selectedSlug} section={section} />
    </div>
  );
}
