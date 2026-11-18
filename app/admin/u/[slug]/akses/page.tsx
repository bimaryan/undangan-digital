"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function HostAccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 text-sm text-slate-500">
          Memuat halaman akses...
        </main>
      }
    >
      <HostAccessForm />
    </Suspense>
  );
}

function HostAccessForm() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const search = useSearchParams();

  const [token, setToken] = useState("");
  const [error, setError] = useState(() => {
    const code = search.get("error");
    if (code === "token") return "Tautan akses tidak valid atau token sudah diganti admin.";
    if (code === "limit") return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
    return "";
  });
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/host", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: params.slug, token }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Token akses tidak sesuai.");
        return;
      }

      router.replace(data.redirect || `/admin/u/${params.slug}`);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-black tracking-tight text-slate-900">Akses Tuan Rumah</h1>
        <p className="mt-1 text-sm text-slate-500">
          Masukkan token akses yang diberikan admin untuk mengelola daftar tamu dan RSVP.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="token" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Token Akses
            </label>
            <input
              id="token"
              type="text"
              autoComplete="one-time-code"
              required
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-mono text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-sky-500"
              placeholder="contoh: keluarga-budi"
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memeriksa..." : "Buka Panel Tuan Rumah"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-400">
          Tautan dari admin biasanya berbentuk /admin/u/{params.slug}?token=...
        </p>
      </div>
    </main>
  );
}
