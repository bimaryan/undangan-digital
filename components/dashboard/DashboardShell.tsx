"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  Suspense,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Undangan } from "@/types";
import { EDITOR_SECTIONS, EDITOR_SECTION_META } from "@/lib/dashboard-sections";

/* ──────────────────────────────────────────────────────────────
 * Navbar + Sidebar dalam SATU file.
 *
 * Dipasang oleh `app/dashboard/layout.tsx` (setara index.blade.php):
 *   <DashboardShell user={...} invitations={...}>
 *     {children}  ← setara @yield('content')
 *   </DashboardShell>
 * ────────────────────────────────────────────────────────────── */

export type DashboardUser = {
  id: number;
  email: string;
  name?: string | null;
  role: string;
};

type DashboardContextValue = {
  user: DashboardUser;
  invitations: Undangan[];
  selectedSlug: string;
  selectedUndangan?: Undangan;
  selectSlug: (slug: string) => void;
  hrefWithSlug: (path: string) => string;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard() harus dipakai di dalam <DashboardShell>.");
  }
  return context;
}

type NavIconName =
  | "grid"
  | "key"
  | "image"
  | "calendar"
  | "users"
  | "card"
  | "music";

const SECTION_ICONS: Record<(typeof EDITOR_SECTIONS)[number], NavIconName> = {
  identitas: "key",
  media: "image",
  acara: "calendar",
  keluarga: "users",
  amplop: "card",
  musik: "music",
};

function NavIcon({ name, className = "size-4" }: { name: NavIconName; className?: string }) {
  const paths: Record<NavIconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </>
    ),
    key: (
      <>
        <circle cx="7.5" cy="16.5" r="4.5" />
        <path d="m10.5 13.5 8-8" />
        <path d="m18 2 2 2" />
        <path d="m15 5 2 2" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    card: (
      <>
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </>
    ),
    music: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),
  };

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
      {paths[name]}
    </svg>
  );
}

const COLLAPSE_KEY = "inovainvite-sidebar-collapsed";

/* State "sidebar ciut" disimpan di localStorage.
 * Dibaca lewat useSyncExternalStore supaya aman saat hydration dan
 * tidak memicu setState di dalam effect. */
let collapsedSnapshot: boolean | null = null;
const collapsedListeners = new Set<() => void>();

function subscribeCollapsed(listener: () => void) {
  collapsedListeners.add(listener);
  return () => {
    collapsedListeners.delete(listener);
  };
}

function getCollapsedSnapshot() {
  if (collapsedSnapshot === null) {
    collapsedSnapshot = window.localStorage.getItem(COLLAPSE_KEY) === "1";
  }
  return collapsedSnapshot;
}

function getCollapsedServerSnapshot() {
  return false;
}

function persistCollapsed(value: boolean) {
  collapsedSnapshot = value;
  window.localStorage.setItem(COLLAPSE_KEY, value ? "1" : "0");
  collapsedListeners.forEach((listener) => listener());
}

export default function DashboardShell({
  user,
  invitations = [],
  children,
}: {
  user: DashboardUser;
  invitations?: Undangan[];
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <ShellInner user={user} invitations={invitations}>
        {children}
      </ShellInner>
    </Suspense>
  );
}

function ShellFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
        <span className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        Memuat dashboard…
      </div>
    </div>
  );
}

function ShellInner({
  user,
  invitations,
  children,
}: {
  user: DashboardUser;
  invitations: Undangan[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot
  );

  // Cegah body ikut ter-scroll saat drawer mobile terbuka.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const slugParam = searchParams.get("slug") || "";
  const selectedSlug = slugParam || invitations[0]?.slug || "";
  const selectedUndangan =
    invitations.find((undangan) => undangan.slug === selectedSlug) || invitations[0];

  const selectSlug = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) params.set("slug", slug);
      else params.delete("slug");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const hrefWithSlug = useCallback(
    (path: string) =>
      selectedSlug ? `${path}?slug=${encodeURIComponent(selectedSlug)}` : path,
    [selectedSlug]
  );

  const toggleCollapsed = () => {
    persistCollapsed(!collapsed);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const contextValue = useMemo<DashboardContextValue>(
    () => ({
      user,
      invitations,
      selectedSlug,
      selectedUndangan,
      selectSlug,
      hrefWithSlug,
    }),
    [user, invitations, selectedSlug, selectedUndangan, selectSlug, hrefWithSlug]
  );

  const navGroups = useMemo(
    () => [
      {
        label: "Menu Utama",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: "grid" as NavIconName },
        ],
      },
      {
        label: "Editor Undangan",
        items: EDITOR_SECTIONS.map((id) => ({
          href: `/dashboard/${id}`,
          label: EDITOR_SECTION_META[id].label,
          icon: SECTION_ICONS[id],
        })),
      },
      {
        label: "Tamu",
        items: [
          { href: "/dashboard/tamu", label: "Kelola Tamu & RSVP", icon: "users" as NavIconName },
        ],
      },
    ],
    []
  );

  const greeting = user.name || user.email.split("@")[0];

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-50/70 font-sans text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
        {/* ── NAVBAR ─────────────────────────────────────────── */}
        <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 lg:hidden"
              aria-label="Buka menu navigasi"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Brand */}
            <Link
              href={hrefWithSlug("/dashboard")}
              onClick={() => setMobileOpen(false)}
              className="flex min-w-0 items-center gap-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-950 to-slate-800 text-sm font-black text-white shadow-xs ring-1 ring-white/10">
                I
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-extrabold tracking-tight text-slate-900">
                    InovaInvite
                  </span>
                  <span className="hidden rounded-full border border-sky-200/70 bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 sm:inline">
                    Client Portal
                  </span>
                </span>
                <span className="hidden truncate text-xs text-slate-500 md:block">
                  Halo, <span className="font-semibold text-slate-700">{greeting}</span>
                </span>
              </span>
            </Link>

            <div className="ml-auto flex items-center gap-2">
              {invitations.length > 1 && (
                <label className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-2xs sm:flex">
                  <span className="font-medium text-slate-400">Acara:</span>
                  <select
                    value={selectedSlug}
                    onChange={(event) => selectSlug(event.target.value)}
                    className="cursor-pointer bg-transparent font-bold text-slate-800 outline-none"
                    aria-label="Pilih undangan"
                  >
                    {invitations.map((undangan) => (
                      <option key={undangan.id} value={undangan.slug}>
                        {undangan.nama_anak}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {selectedUndangan && (
                <a
                  href={`/u/${selectedUndangan.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 sm:inline-flex"
                >
                  <span>Buka Undangan</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-slate-400">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-2xs transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>{loggingOut ? "Keluar…" : "Keluar"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Overlay drawer mobile */}
        {mobileOpen && (
          <button
            type="button"
            aria-label="Tutup menu navigasi"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* ── SIDEBAR ────────────────────────────────────────── */}
        <aside
          className={`fixed bottom-0 left-0 top-16 z-40 flex w-64 flex-col border-r border-slate-200/80 bg-white transition-[transform,width] duration-200 ease-in-out lg:translate-x-0 ${
            mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          } ${collapsed ? "lg:w-20" : "lg:w-64"}`}
          aria-label="Navigasi dashboard"
        >
          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-4 last:mb-0">
                <p
                  className={`mb-1.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400 ${
                    collapsed ? "lg:hidden" : ""
                  }`}
                >
                  {group.label}
                </p>
                {collapsed && <div className="mb-2 hidden border-t border-slate-100 lg:block" />}
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={hrefWithSlug(item.href)}
                          onClick={() => setMobileOpen(false)}
                          aria-current={active ? "page" : undefined}
                          title={item.label}
                          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12.5px] font-bold transition ${
                            active
                              ? "bg-slate-900 text-white shadow-xs"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          } ${collapsed ? "lg:justify-center lg:px-2" : ""}`}
                        >
                          <span
                            className={`flex size-5 shrink-0 items-center justify-center ${
                              active ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                            }`}
                          >
                            <NavIcon name={item.icon} className="size-4" />
                          </span>
                          <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer sidebar: status + tombol collapse (desktop) */}
          <div
            className={`flex shrink-0 items-center gap-2 border-t border-slate-200/80 bg-slate-50/70 px-3 py-2.5 ${
              collapsed ? "lg:justify-center" : "justify-between"
            }`}
          >
            <div className={`flex min-w-0 items-center gap-2 ${collapsed ? "lg:hidden" : ""}`}>
              <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" title="Online" />
              <span className="truncate text-[11px] font-bold text-slate-600">InovaInvite</span>
              <span className="shrink-0 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-400">
                v0.1
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 lg:hidden"
              aria-label="Tutup menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 lg:inline-flex"
              aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
              title={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`size-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
              >
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
          </div>
        </aside>

        {/* ── KONTEN (setara @yield('content')) ─────────────── */}
        <div
          className={`pt-16 transition-[padding] duration-200 ease-in-out ${
            collapsed ? "lg:pl-20" : "lg:pl-64"
          }`}
        >
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            {invitations.length === 0 && pathname === "/dashboard" ? (
            <NoInvitation email={user.email} />
          ) : (
            children
          )}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

function NoInvitation({ email }: { email: string }) {
  return (
    <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs sm:p-12">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-7">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-black text-slate-900">Belum Ada Undangan Ditugaskan</h2>
      <p className="mt-1 text-xs text-slate-400">
        Buat undangan pertamamu sekarang
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard/buat"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
        >
          <span>Buat Undangan Pertama</span>
        </Link>
      </div>
    </div>
  );
}
