"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────
type UndanganItem = {
  id: number;
  slug: string;
  nama_anak: string;
  nama_orang_tua: string;
  tanggal: string;
  user_id?: number | null;
  tenant_name?: string;
  tenant_email?: string;
};

type TenantItem = {
  id: number;
  email: string;
  name: string;
  invitation_count?: number;
  created_at: string;
};

type Tab = "undangan" | "client";

// ─── Default form states ──────────────────────────────────────────────────────
const defaultUndanganForm = {
  slug: "",
  nama_anak: "",
  nama_orang_tua: "",
  tanggal: "",
  jam: "",
  lokasi: "",
  user_id: "" as string | number,
};

const defaultTenantForm = {
  name: "",
  email: "",
  password: "",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminPanel({ adminEmail }: { adminEmail?: string }) {
  const router = useRouter();

  // State: tabs
  const [activeTab, setActiveTab] = useState<Tab>("undangan");

  // State: data
  const [undanganList, setUndanganList] = useState<UndanganItem[]>([]);
  const [tenantList, setTenantList] = useState<TenantItem[]>([]);

  // State: loading
  const [loadingUndangan, setLoadingUndangan] = useState(false);
  const [loadingTenant, setLoadingTenant] = useState(false);

  // State: modals
  const [showUndanganModal, setShowUndanganModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);

  // State: form values
  const [undanganForm, setUndanganForm] = useState({ ...defaultUndanganForm });
  const [tenantForm, setTenantForm] = useState({ ...defaultTenantForm });

  // State: submitting
  const [submittingUndangan, setSubmittingUndangan] = useState(false);
  const [submittingTenant, setSubmittingTenant] = useState(false);

  // State: errors / alerts
  const [undanganError, setUndanganError] = useState("");
  const [tenantError, setTenantError] = useState("");
  const [globalMsg, setGlobalMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // State: assign loading per slug
  const [assigningSlug, setAssigningSlug] = useState<string | null>(null);

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchUndangan = useCallback(async () => {
    setLoadingUndangan(true);
    try {
      const res = await fetch("/api/admin/undangan");
      if (!res.ok) throw new Error("Gagal memuat undangan");
      const data = await res.json();
      setUndanganList(Array.isArray(data) ? data : data.undangan ?? []);
    } catch {
      setGlobalMsg({ type: "error", text: "Gagal memuat daftar undangan." });
    } finally {
      setLoadingUndangan(false);
    }
  }, []);

  const fetchTenants = useCallback(async () => {
    setLoadingTenant(true);
    try {
      const res = await fetch("/api/admin/tenants");
      if (!res.ok) throw new Error("Gagal memuat tenant");
      const data = await res.json();
      setTenantList(Array.isArray(data) ? data : data.tenants ?? []);
    } catch {
      setGlobalMsg({ type: "error", text: "Gagal memuat daftar client." });
    } finally {
      setLoadingTenant(false);
    }
  }, []);

  useEffect(() => {
    fetchUndangan();
    fetchTenants();
  }, [fetchUndangan, fetchTenants]);

  // Auto-dismiss global message
  useEffect(() => {
    if (!globalMsg) return;
    const t = setTimeout(() => setGlobalMsg(null), 4000);
    return () => clearTimeout(t);
  }, [globalMsg]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // ── Assign tenant to undangan ──────────────────────────────────────────────
  const handleAssignTenant = async (slug: string, userId: string) => {
    setAssigningSlug(slug);
    try {
      const body: { slug: string; user_id: number | null } = {
        slug,
        user_id: userId === "" ? null : Number(userId),
      };
      const res = await fetch("/api/admin/undangan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Gagal assign tenant");
      setGlobalMsg({ type: "success", text: `Pemilik undangan "${slug}" berhasil diperbarui.` });
      await fetchUndangan();
    } catch {
      setGlobalMsg({ type: "error", text: "Gagal memperbarui pemilik undangan." });
    } finally {
      setAssigningSlug(null);
    }
  };

  // ── Create undangan ────────────────────────────────────────────────────────
  const handleCreateUndangan = async (e: React.FormEvent) => {
    e.preventDefault();
    setUndanganError("");
    if (!undanganForm.slug.trim()) {
      setUndanganError("Slug wajib diisi.");
      return;
    }
    setSubmittingUndangan(true);
    try {
      const payload = {
        ...undanganForm,
        user_id: undanganForm.user_id === "" ? null : Number(undanganForm.user_id),
      };
      const res = await fetch("/api/admin/undangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal membuat undangan");
      }
      setShowUndanganModal(false);
      setUndanganForm({ ...defaultUndanganForm });
      setGlobalMsg({ type: "success", text: "Undangan baru berhasil dibuat!" });
      await fetchUndangan();
    } catch (err: unknown) {
      setUndanganError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmittingUndangan(false);
    }
  };

  // ── Create tenant ──────────────────────────────────────────────────────────
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setTenantError("");
    if (!tenantForm.name.trim() || !tenantForm.email.trim() || !tenantForm.password.trim()) {
      setTenantError("Semua field wajib diisi.");
      return;
    }
    setSubmittingTenant(true);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tenantForm),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal membuat client");
      }
      setShowTenantModal(false);
      setTenantForm({ ...defaultTenantForm });
      setGlobalMsg({ type: "success", text: "Client baru berhasil ditambahkan!" });
      await fetchTenants();
    } catch (err: unknown) {
      setTenantError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmittingTenant(false);
    }
  };

  // ── Delete tenant ──────────────────────────────────────────────────────────
  const handleDeleteTenant = async (tenant: TenantItem) => {
    if (!confirm(`Hapus client "${tenant.name}" (${tenant.email})? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/admin/tenants?id=${tenant.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus client");
      setGlobalMsg({ type: "success", text: `Client "${tenant.name}" berhasil dihapus.` });
      await fetchTenants();
    } catch {
      setGlobalMsg({ type: "error", text: "Gagal menghapus client." });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-30 bg-slate-900 shadow-lg">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">InovaInvite</span>
            <span className="rounded-full bg-sky-600 px-2 py-0.5 text-xs font-semibold text-white">
              Super Admin
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {adminEmail && (
              <span className="hidden text-sm text-slate-300 sm:block">
                Halo, <span className="font-medium text-white">{adminEmail}</span>
              </span>
            )}
            <button
              onClick={() => router.push("/admin/akun")}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
            >
              Akun
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-rose-600 hover:border-rose-600 hover:text-white"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* ── Global alert ── */}
      {globalMsg && (
        <div
          className={`mx-auto mt-4 max-w-7xl rounded-lg px-4 py-3 text-sm font-medium shadow ${
            globalMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {globalMsg.text}
        </div>
      )}

      {/* ── Main ── */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-slate-200 p-1 w-fit">
          {(["undangan", "client"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-white shadow text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "undangan" ? "Semua Undangan" : "Kelola Client"}
            </button>
          ))}
        </div>

        {/* ── Tab: Undangan ── */}
        {activeTab === "undangan" && (
          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Daftar Semua Undangan</h2>
                <p className="text-sm text-slate-500">
                  Total {undanganList.length} undangan terdaftar
                </p>
              </div>
              <button
                onClick={() => { setUndanganForm({ ...defaultUndanganForm }); setUndanganError(""); setShowUndanganModal(true); }}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700 transition"
              >
                + Buat Undangan Baru
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              {loadingUndangan ? (
                <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
                  Memuat data undangan…
                </div>
              ) : undanganList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-500 text-sm">Belum ada undangan. Buat undangan pertama!</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      {["No", "Nama Acara", "Slug", "Pemilik (Tenant)", "Tanggal", "Aksi"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {undanganList.map((u, idx) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-sm text-slate-500 w-12">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-slate-900">{u.nama_anak || "—"}</div>
                          <div className="text-xs text-slate-400">{u.nama_orang_tua || ""}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                            {u.slug}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.user_id ?? ""}
                            disabled={assigningSlug === u.slug}
                            onChange={(e) => handleAssignTenant(u.slug, e.target.value)}
                            className="w-full max-w-[180px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
                          >
                            <option value="">— Belum ditugaskan —</option>
                            {tenantList.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name} ({t.email})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                          {u.tanggal ? new Date(u.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`/dashboard/tamu?slug=${u.slug}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition"
                          >
                            Kelola Tamu
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {/* ── Tab: Client ── */}
        {activeTab === "client" && (
          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Kelola Client / Tenant</h2>
                <p className="text-sm text-slate-500">
                  Total {tenantList.length} client terdaftar
                </p>
              </div>
              <button
                onClick={() => { setTenantForm({ ...defaultTenantForm }); setTenantError(""); setShowTenantModal(true); }}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition"
              >
                + Tambah Client Baru
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              {loadingTenant ? (
                <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
                  Memuat data client…
                </div>
              ) : tenantList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-slate-500 text-sm">Belum ada client. Tambahkan client pertama!</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Nama", "Email", "Undangan", "Terdaftar", "Aksi"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenantList.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{t.email}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                            {t.invitation_count ?? 0} undangan
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                          {t.created_at
                            ? new Date(t.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteTenant(t)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ══════════════════════════════════════════════════
          Modal: Buat Undangan Baru
      ══════════════════════════════════════════════════ */}
      {showUndanganModal && (
        <ModalOverlay onClose={() => setShowUndanganModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-5 text-lg font-bold text-slate-900">Buat Undangan Baru</h3>

            <form onSubmit={handleCreateUndangan} className="space-y-4">
              {/* Slug */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="contoh: budi-ani-2024"
                  value={undanganForm.slug}
                  onChange={(e) => setUndanganForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>

              {/* Nama Anak */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Nama Anak / Pasangan</label>
                <input
                  type="text"
                  placeholder="Nama yang akan menikah"
                  value={undanganForm.nama_anak}
                  onChange={(e) => setUndanganForm((f) => ({ ...f, nama_anak: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Nama Orang Tua */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Nama Orang Tua</label>
                <input
                  type="text"
                  placeholder="Bapak & Ibu ..."
                  value={undanganForm.nama_orang_tua}
                  onChange={(e) => setUndanganForm((f) => ({ ...f, nama_orang_tua: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Tanggal & Jam */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Tanggal</label>
                  <input
                    type="date"
                    value={undanganForm.tanggal}
                    onChange={(e) => setUndanganForm((f) => ({ ...f, tanggal: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Jam</label>
                  <input
                    type="time"
                    value={undanganForm.jam}
                    onChange={(e) => setUndanganForm((f) => ({ ...f, jam: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Lokasi</label>
                <input
                  type="text"
                  placeholder="Nama gedung / tempat acara"
                  value={undanganForm.lokasi}
                  onChange={(e) => setUndanganForm((f) => ({ ...f, lokasi: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Assign ke Client */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Tugaskan ke Client <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <select
                  value={undanganForm.user_id}
                  onChange={(e) => setUndanganForm((f) => ({ ...f, user_id: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">— Pilih client —</option>
                  {tenantList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              {undanganError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 border border-rose-200">
                  {undanganError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUndanganModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingUndangan}
                  className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 transition"
                >
                  {submittingUndangan ? "Menyimpan…" : "Buat Undangan"}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* ══════════════════════════════════════════════════
          Modal: Tambah Client Baru
      ══════════════════════════════════════════════════ */}
      {showTenantModal && (
        <ModalOverlay onClose={() => setShowTenantModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-5 text-lg font-bold text-slate-900">Tambah Client Baru</h3>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              {/* Nama */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Nama <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama lengkap client"
                  value={tenantForm.name}
                  onChange={(e) => setTenantForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="email@domain.com"
                  value={tenantForm.email}
                  onChange={(e) => setTenantForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={tenantForm.password}
                  onChange={(e) => setTenantForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>

              {tenantError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 border border-rose-200">
                  {tenantError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTenantModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingTenant}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition"
                >
                  {submittingTenant ? "Menyimpan…" : "Tambah Client"}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ─── Modal overlay helper ─────────────────────────────────────────────────────
function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}
