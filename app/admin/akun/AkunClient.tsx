"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Message = { type: "success" | "error"; text: string } | null;

export default function AkunClient({ email }: { email: string }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [endingSessions, setEndingSessions] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Semua kolom password wajib diisi." });
      return;
    }
    if (newPassword.length < 12) {
      setMessage({ type: "error", text: "Password baru minimal 12 karakter." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password baru tidak cocok." });
      return;
    }
    if (newPassword === currentPassword) {
      setMessage({
        type: "error",
        text: "Password baru harus berbeda dari password saat ini.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        router.replace("/admin/login?next=/admin/akun");
        router.refresh();
        return;
      }
      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Password gagal diubah. Coba lagi.",
        });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswords(false);
      setMessage({
        type: "success",
        text:
          data.message ||
          "Password berhasil diubah. Semua perangkat lain telah dikeluarkan.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Tidak dapat terhubung ke server. Coba lagi.",
      });
    } finally {
      setSaving(false);
    }
  };

  const logoutAll = async () => {
    const confirmed = window.confirm(
      "Keluar dari semua perangkat? Sesi ini juga akan berakhir dan Anda harus login ulang."
    );
    if (!confirmed) return;

    setMessage(null);
    setEndingSessions(true);
    try {
      const res = await fetch("/api/admin/account/logout-all", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Gagal mengakhiri semua sesi. Coba lagi.",
        });
        return;
      }
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setMessage({
        type: "error",
        text: "Tidak dapat terhubung ke server. Coba lagi.",
      });
    } finally {
      setEndingSessions(false);
    }
  };

  const inputType = showPasswords ? "text" : "password";

  return (
    <main className="min-h-screen bg-stone-50 p-4 font-sans text-slate-800 antialiased sm:p-6 xl:p-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <Link
          href="/admin"
          prefetch={false}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-900"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
          Kembali ke editor
        </Link>

        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">
            Pengaturan Akun
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Akun &amp; Keamanan
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Ubah password admin dan akhiri sesi di perangkat lain. Perubahan
            password langsung membatalkan semua sesi admin yang lama.
          </p>
        </header>

        {message ? (
          <div
            role={message.type === "error" ? "alert" : "status"}
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-semibold ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <span className="mt-px" aria-hidden="true">
              {message.type === "success" ? "✓" : "!"}
            </span>
            <span className="leading-relaxed">{message.text}</span>
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Ubah Password
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Minimal 12 karakter. Gunakan password yang tidak dipakai di
                  layanan lain.
                </p>
              </div>
              <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(event) => setShowPasswords(event.target.checked)}
                  className="size-4 accent-sky-600"
                />
                Tampilkan
              </label>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="current-password"
                  className="block text-xs font-bold uppercase tracking-wide text-slate-600"
                >
                  Password saat ini
                </label>
                <input
                  id="current-password"
                  type={inputType}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-bold uppercase tracking-wide text-slate-600"
                >
                  Password baru
                </label>
                <input
                  id="new-password"
                  type={inputType}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
                <p className="mt-1.5 text-[11px] text-slate-400">
                  {newPassword.length}/12 karakter minimum
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-bold uppercase tracking-wide text-slate-600"
                >
                  Konfirmasi password baru
                </label>
                <input
                  id="confirm-password"
                  type={inputType}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-500 ring-1 ring-slate-100">
                Setelah password diubah, perangkat ini tetap masuk. Semua sesi
                admin di perangkat lain otomatis dikeluarkan.
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </form>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Email Login
              </p>
              <p className="mt-2 break-all text-sm font-bold text-slate-900">
                {email}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Email ini dipakai untuk masuk ke panel admin. Perubahan email
                belum tersedia dari panel.
              </p>
            </section>

            <section className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">
                Keluar dari semua perangkat
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Mengakhiri seluruh sesi admin, termasuk sesi di perangkat ini.
                Anda harus login ulang setelahnya.
              </p>
              <button
                type="button"
                onClick={logoutAll}
                disabled={endingSessions}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-wait disabled:opacity-60"
              >
                {endingSessions ? "Mengakhiri sesi..." : "Keluar dari semua perangkat"}
              </button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
