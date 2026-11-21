"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BuatForm = {
  slug: string;
  nama_anak: string;
  nama_ayah: string;
  nama_ibu: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  mempelai_pria: string;
  mempelai_wanita: string;
  agama: string;
  nama_acara: string;
};

const EMPTY_FORM: BuatForm = {
  slug: "",
  nama_anak: "",
  nama_ayah: "",
  nama_ibu: "",
  tanggal: "",
  jam: "",
  lokasi: "",
  mempelai_pria: "",
  mempelai_wanita: "",
  agama: "",
  nama_acara: "",
};

const MARRIAGE_TYPES = ["Pernikahan", "Perkahwinan", "Qabul"];

function buildSlug(values: string[]): string {
  return (
    values
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "acara"
  );
}

export default function BuatUndangan() {
  const router = useRouter();
  const [form, setForm] = useState<BuatForm>(EMPTY_FORM);
  const [jenisAcara, setJenisAcara] = useState("");
  const [noWaPenerima, setNoWaPenerima] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isMarriage = MARRIAGE_TYPES.includes(jenisAcara);
  const isBirthEvents = ["Khitanan", "Rasulan", "Aqiqah"].includes(jenisAcara);
  const isWisuda = jenisAcara === "Wisuda";

  const slugSource = isMarriage
    ? [form.mempelai_pria, form.mempelai_wanita]
    : isBirthEvents || isWisuda
      ? [form.nama_anak]
      : [form.nama_acara];

  const slugFinal = buildSlug(slugSource);

  const set = (field: keyof BuatForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!jenisAcara) {
      setError("Silakan pilih jenis acara terlebih dahulu.");
      return;
    }
    const couple = [form.mempelai_pria, form.mempelai_wanita]
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .join(" & ");
    const namaAnakFinal = isMarriage
      ? couple || form.nama_anak.trim()
      : isBirthEvents || isWisuda
        ? form.nama_anak.trim()
        : form.nama_acara.trim();
    const namaOrtuFinal = isMarriage
      ? couple || ""
      : isBirthEvents
        ? [form.nama_ibu.trim(), form.nama_ayah.trim()]
            .filter((value) => value.length > 0)
            .join(" & ")
        : "";

    if (!namaAnakFinal || !form.tanggal || !form.lokasi) {
      setError("Nama acara/anak, tanggal, dan lokasi wajib diisi.");
      return;
    }
    if (isMarriage && (!form.mempelai_pria.trim() || !form.mempelai_wanita.trim())) {
      setError("Nama mempelai pria dan wanita wajib diisi.");
      return;
    }
    if (isMarriage && !form.agama.trim()) {
      setError("Agama wajib diisi untuk acara pernikahan.");
      return;
    }
    if (
      isBirthEvents &&
      (!form.nama_acara.trim() || !form.nama_ibu.trim() || !form.nama_ayah.trim())
    ) {
      setError("Nama acara, nama anak, nama ibu, dan nama ayah wajib diisi.");
      return;
    }
    if (isWisuda && !form.nama_acara.trim()) {
      setError("Nama acara wajib diisi untuk acara wisuda.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/undangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slugFinal.toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
          nama_anak: namaAnakFinal,
          nama_orang_tua: namaOrtuFinal,
          tanggal: form.tanggal,
          jam: form.jam || "08:00:00",
          lokasi: form.lokasi.trim(),
          data_json: {
            ...(jenisAcara ? { jenis_acara: jenisAcara } : {}),
            ...(form.agama.trim() ? { agama: form.agama.trim() } : {}),
            ...(form.nama_acara.trim() ? { nama_acara: form.nama_acara.trim() } : {}),
            ...(form.tanggal ? { tanggal_acara: form.tanggal, tanggal_sampul: form.tanggal } : {}),
            no_wa_penerima: noWaPenerima
              .split(/[\n,]+/)
              .map((value) => value.trim())
              .filter((value) => value.length > 0),
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal membuat undangan baru.");
        return;
      }

      router.replace(`/dashboard?slug=${encodeURIComponent(data.undangan.slug)}`);
    } catch {
      setError("Terjadi kesalahan saat membuat undangan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-sky-600">Tenant / Client</p>
            <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">Buat Undangan Baru</h2>
            <p className="text-xs text-slate-500">
              Buat undangan digital untuk tamu Anda. Undangan baru langsung aktif setelah disimpan.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Jenis Acara
          </label>
          <select
            value={jenisAcara}
            onChange={(e) => setJenisAcara(e.target.value)}
            className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">Pilih jenis acara…</option>
            <option value="Acara Custom">Acara Custom</option>
            <option value="Pernikahan">Pernikahan</option>
            <option value="Mepandes">Mepandes</option>
            <option value="Khitanan">Khitanan</option>
            <option value="Ulang Tahun">Ulang Tahun</option>
            <option value="Wisuda">Wisuda</option>
            <option value="Natal">Natal</option>
            <option value="Aqiqah">Aqiqah</option>
            <option value="Halal Bihalal / Bukber">Halal Bihalal / Bukber</option>
            <option value="Ucapan Online">Ucapan Online</option>
            <option value="Rasulan">Rasulan</option>
            <option value="Pernyataan / Kelahiran">Pernyataan / Kelahiran</option>
            <option value="Perkahwinan">Perkahwinan</option>
            <option value="Qabul">Qabul (Akad Nikah)</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        {isMarriage ? (
          <>
            <div>
              <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Mempelai Pria
              </label>
              <input
                value={form.mempelai_pria}
                onChange={(e) => set("mempelai_pria", e.target.value)}
                className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Bpk. Zayyan Arkana Alfarizqi"
              />
            </div>
            <div>
              <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Mempelai Wanita
              </label>
              <input
                value={form.mempelai_wanita}
                onChange={(e) => set("mempelai_wanita", e.target.value)}
                className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Ibu Deva Nabila Sari"
              />
            </div>
            <div>
              <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Agama
              </label>
              <input
                value={form.agama}
                onChange={(e) => set("agama", e.target.value)}
                className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Islam /Kristen /Katolik /dll"
              />
            </div>
          </>
        ) : isBirthEvents ? (
          <>
            <div>
              <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Nama Acara
              </label>
              <input
                value={form.nama_acara}
                onChange={(e) => set("nama_acara", e.target.value)}
                className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Nama acara"
              />
            </div>
            <div>
              <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Nama Anak
              </label>
              <input
                value={form.nama_anak}
                onChange={(e) => set("nama_anak", e.target.value)}
                className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Zayyan Arkana Alfarizqi"
              />
            </div>
            <div>
              <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Nama Ibu
              </label>
              <input
                value={form.nama_ibu}
                onChange={(e) => set("nama_ibu", e.target.value)}
                className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Ibu Sarinih"
              />
            </div>
            <div>
              <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Nama Ayah
              </label>
              <input
                value={form.nama_ayah}
                onChange={(e) => set("nama_ayah", e.target.value)}
                className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Bpk. Kastam"
              />
            </div>
          </>
        ) : isWisuda ? (
          <>
            <div>
              <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Nama Acara
              </label>
              <input
                value={form.nama_acara}
                onChange={(e) => set("nama_acara", e.target.value)}
                className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Ucapan Kelulusan"
              />
            </div>
            <div>
              <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Nama Anak
              </label>
              <input
                value={form.nama_anak}
                onChange={(e) => set("nama_anak", e.target.value)}
                className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Zayyan Arkana Alfarizqi"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Nama Acara
              </label>
              <input
                value={form.nama_acara}
                onChange={(e) => set("nama_acara", e.target.value)}
                className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Nama acara"
              />
            </div>
          </>
        )}

        <div>
          <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tanggal Acara
          </label>
          <input
            type="date"
            value={form.tanggal}
            onChange={(e) => set("tanggal", e.target.value)}
            className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Jam Acara
          </label>
          <input
            value={form.jam}
            onChange={(e) => set("jam", e.target.value)}
            className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            placeholder="08:00:00"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Lokasi Acara
          </label>
          <textarea
            value={form.lokasi}
            onChange={(e) => set("lokasi", e.target.value)}
            rows={2}
            className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition leading-relaxed placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            placeholder="Desa Rambatan Kulon (Bangkir) Rt. 07 Rw. 01 ..."
          />
        </div>

        <div>
          <label className="mt-0 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Nomor WhatsApp Penerima
          </label>
          <textarea
            value={noWaPenerima}
            onChange={(e) => setNoWaPenerima(e.target.value)}
            rows={2}
            className="mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition leading-relaxed placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            placeholder="628976632321"
          />
          <p className="mt-1 text-[10px] font-medium text-slate-400">
            Nomor WhatsApp penerima notifikasi kehadiran tamu (satu nomor per baris).
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 md:col-span-2">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Membuat..." : "Buat Undangan"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
