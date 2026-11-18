import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getUndanganBySlug,
  getTamuByUndangan,
  tambahTamu,
  tambahBanyakTamu,
  updateTamu,
  updateTamuRsvpManual,
  hapusTamu,
  getRsvpByUndangan,
  hapusRsvp,
  updateUndanganLengkap,
} from "@/lib/undangan";
import { getLatestUploadedAudioForUndangan } from "@/lib/media";
import { getHostAccess } from "@/lib/auth";
import {
  isValidHostToken,
  isSameOrigin,
  normalizeHostToken,
} from "@/lib/session";

type Access = "admin" | "host";

async function authorize(slug: string): Promise<
  | { status: "ok"; access: Access; data: Record<string, unknown> & { id: number } }
  | { status: "not_found" }
  | { status: "unauthorized" }
> {
  const access = await getHostAccess(slug);
  if (!access) return { status: "unauthorized" };

  const data = await getUndanganBySlug(slug);
  if (!data) return { status: "not_found" };

  return { status: "ok", access, data };
}

function unauthorized() {
  return NextResponse.json(
    {
      error: "Sesi tidak valid.",
      detail: "Silakan login sebagai admin atau buka tautan akses tuan rumah terlebih dahulu.",
    },
    { status: 401 }
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await authorize(slug);

    if (auth.status === "not_found") {
      return NextResponse.json(
        {
          error: `Data undangan "${slug}" belum ada di database.`,
          detail: "Tabel mungkin sudah dibuat tapi data awal belum di-insert. Silakan jalankan/import file schema.sql ke database hosting Anda.",
        },
        { status: 404 }
      );
    }

    if (auth.status === "unauthorized") return unauthorized();

    const undangan = auth.data;
    const dataJson =
      typeof undangan.data_json === "object" && undangan.data_json !== null
        ? (undangan.data_json as Record<string, unknown>)
        : {};
    let musicRecovered = false;

    // Versi lama sempat menyimpan file audio, tetapi URL-nya tertimpa oleh
    // data_json lama saat tombol Simpan ditekan. Temukan file terakhir untuk
    // undangan ini agar admin dapat menyimpan ulang tautannya tanpa upload lagi.
    if (!dataJson.musik_url && !dataJson.musik_disabled) {
      const latestAudio = await getLatestUploadedAudioForUndangan(Number(undangan.id));
      if (latestAudio) {
        undangan.data_json = {
          ...dataJson,
          musik_url: `/api/media/${latestAudio.id}`,
          musik_judul: dataJson.musik_judul || latestAudio.filename.replace(/\.[^.]+$/, ""),
        };
        musicRecovered = true;
      }
    }

    // Tuan rumah tidak perlu (dan sebaiknya tidak) menerima token aksesnya.
    if (auth.access === "host") {
      undangan.akses_token = null;
    }

    const [tamu, rsvp] = await Promise.all([
      getTamuByUndangan(Number(undangan.id)),
      getRsvpByUndangan(Number(undangan.id)),
    ]);

    return NextResponse.json({ undangan, tamu, rsvp, musicRecovered, access: auth.access });
  } catch (err: unknown) {
    console.error("API GET admin error:", err);
    return NextResponse.json(
      {
        error: "Koneksi database PostgreSQL gagal.",
        detail: "Periksa konfigurasi database dan pastikan migrasi auth sudah dijalankan.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
    }

    const { slug } = await params;
    const auth = await authorize(slug);
    if (auth.status !== "ok") {
      return auth.status === "not_found"
        ? NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 })
        : unauthorized();
    }

    const undanganId = Number(auth.data.id);
    const body = await req.json();

    // Tambah banyak tamu sekaligus (Bulk Import)
    if (Array.isArray(body.daftar_nama)) {
      const daftar = body.daftar_nama
        .map((nama: unknown) => String(nama ?? "").trim())
        .filter((nama: string) => nama.length > 0)
        .slice(0, 1000);
      const hasil = await tambahBanyakTamu(undanganId, daftar);
      return NextResponse.json({ ok: true, tamu: hasil });
    }

    // Tambah satu tamu
    if (body.nama && typeof body.nama === "string") {
      const nama = body.nama.trim();
      if (!nama) return NextResponse.json({ error: "Nama tamu tidak valid" }, { status: 400 });
      const tamu = await tambahTamu(undanganId, nama);
      return NextResponse.json({ ok: true, tamu });
    }

    return NextResponse.json({ error: "Nama tamu tidak valid" }, { status: 400 });
  } catch (err: unknown) {
    console.error("API POST admin error:", err);
    return NextResponse.json({ error: "Gagal menyimpan tamu" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
    }

    const { slug } = await params;
    const auth = await authorize(slug);
    if (auth.status !== "ok") {
      return auth.status === "not_found"
        ? NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 })
        : unauthorized();
    }

    const undanganId = Number(auth.data.id);
    const body = await req.json();

    // Edit nama tamu & konfirmasi kehadiran manual (boleh oleh tuan rumah)
    if (body.tamuId) {
      const tamuId = Number(body.tamuId);
      if (!Number.isSafeInteger(tamuId)) {
        return NextResponse.json({ error: "ID tamu tidak valid" }, { status: 400 });
      }
      if (body.nama) {
        await updateTamu(tamuId, undanganId, String(body.nama));
      }
      if (body.hadir !== undefined) {
        await updateTamuRsvpManual(tamuId, undanganId, body.hadir, body.ucapan);
      }
      return NextResponse.json({ ok: true });
    }

    // Edit data undangan lengkap hanya untuk admin.
    if (auth.access !== "admin") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat mengubah isi undangan." },
        { status: 403 }
      );
    }

    const required = ["nama_anak", "nama_orang_tua", "tanggal", "jam", "lokasi"] as const;
    for (const field of required) {
      if (!body[field] || !String(body[field]).trim()) {
        return NextResponse.json(
          { error: `Kolom "${field}" wajib diisi.` },
          { status: 400 }
        );
      }
    }

    if (body.akses_token !== undefined && body.akses_token !== null) {
      const token = normalizeHostToken(String(body.akses_token));
      if (!isValidHostToken(token)) {
        return NextResponse.json(
          {
            error:
              "Token tuan rumah harus 6–32 karakter dan hanya berisi huruf kecil, angka, tanda minus, atau garis bawah.",
          },
          { status: 400 }
        );
      }
      body.akses_token = token;
    }

    const updated = await updateUndanganLengkap(undanganId, body);
    revalidatePath(`/u/${slug}`);
    if (updated?.slug && updated.slug !== slug) {
      revalidatePath(`/u/${updated.slug}`);
    }
    revalidatePath("/admin");
    return NextResponse.json({ ok: true, undangan: updated });
  } catch (err: unknown) {
    console.error("API PUT admin error:", err);

    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "23505") {
      return NextResponse.json(
        { error: "Token tuan rumah itu sudah dipakai undangan lain. Pilih token lain." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Gagal memperbarui data" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
    }

    const { slug } = await params;
    const auth = await authorize(slug);
    if (auth.status !== "ok") {
      return auth.status === "not_found"
        ? NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 })
        : unauthorized();
    }

    const undanganId = Number(auth.data.id);
    const tamuId = req.nextUrl.searchParams.get("tamuId");
    if (tamuId) {
      const id = Number(tamuId);
      if (!Number.isSafeInteger(id)) {
        return NextResponse.json({ error: "ID tamu tidak valid" }, { status: 400 });
      }
      await hapusTamu(id, undanganId);
    }

    const rsvpId = req.nextUrl.searchParams.get("rsvpId");
    if (rsvpId) {
      const id = Number(rsvpId);
      if (!Number.isSafeInteger(id)) {
        return NextResponse.json({ error: "ID RSVP tidak valid" }, { status: 400 });
      }
      await hapusRsvp(id, undanganId);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("API DELETE admin error:", err);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
