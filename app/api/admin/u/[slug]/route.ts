import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getUndanganBySlug,
  getUndanganByToken,
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

function extractToken(req: NextRequest): string {
  // 1. Cek parameter ?token=xxx
  const explicit = req.nextUrl.searchParams.get("token");
  if (explicit && explicit.trim()) return explicit.trim();

  // 2. Cek parameter bare query seperti ?bumarpuah
  for (const [key, value] of req.nextUrl.searchParams.entries()) {
    if (key && key !== "tamuId" && key !== "rsvpId" && key !== "to") {
      if (!value) return key.trim();
      if (key === "token") return value.trim();
    }
  }

  // 3. Cek Header Authorization
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return "";
}

async function authorize(slug: string, token: string | null) {
  if (!token) return { status: "unauthorized" as const, data: null };
  const clean = token.trim();

  // ADMIN_TOKEN stays on the server. NEXT_PUBLIC_FIXED_TOKEN is retained for
  // existing deployments that have not migrated their environment yet.
  const masterToken = process.env.ADMIN_TOKEN || process.env.NEXT_PUBLIC_FIXED_TOKEN;
  if (masterToken && clean === masterToken) {
    const data = await getUndanganBySlug(slug);
    if (!data) return { status: "not_found" as const, data: null };
    return { status: "ok" as const, data };
  }

  // Token Tuan Rumah dari database
  const u = await getUndanganByToken(clean);
  if (!u || u.slug !== slug) {
    return { status: "unauthorized" as const, data: null };
  }
  return { status: "ok" as const, data: u };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const token = extractToken(req);
    const auth = await authorize(slug, token);

    if (auth.status === "not_found") {
      return NextResponse.json(
        {
          error: `Data undangan "${slug}" belum ada di database.`,
          detail: "Tabel mungkin sudah dibuat tapi data awal belum di-insert. Silakan jalankan/import file schema.sql ke database hosting Anda.",
        },
        { status: 404 }
      );
    }

    if (auth.status === "unauthorized" || !auth.data) {
      return NextResponse.json(
        {
          error: "Token akses tidak sesuai.",
          detail: "Pastikan token akses yang dimasukkan sesuai dengan token di database atau environment variables hosting.",
        },
        { status: 401 }
      );
    }

    const undangan = auth.data;
    const dataJson =
      typeof undangan.data_json === "object" && undangan.data_json !== null
        ? undangan.data_json
        : {};
    let musicRecovered = false;

    // Versi lama sempat menyimpan file audio, tetapi URL-nya tertimpa oleh
    // data_json lama saat tombol Simpan ditekan. Temukan file terakhir untuk
    // undangan ini agar admin dapat menyimpan ulang tautannya tanpa upload lagi.
    if (!dataJson.musik_url && !dataJson.musik_disabled) {
      const latestAudio = await getLatestUploadedAudioForUndangan(undangan.id);
      if (latestAudio) {
        undangan.data_json = {
          ...dataJson,
          musik_url: `/api/media/${latestAudio.id}`,
          musik_judul: dataJson.musik_judul || latestAudio.filename.replace(/\.[^.]+$/, ""),
        };
        musicRecovered = true;
      }
    }
    const [tamu, rsvp] = await Promise.all([
      getTamuByUndangan(undangan.id),
      getRsvpByUndangan(undangan.id),
    ]);

    return NextResponse.json({ undangan, tamu, rsvp, musicRecovered });
  } catch (err: unknown) {
    console.error("API GET admin error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "Koneksi database PostgreSQL gagal.",
        detail: msg,
        hint: "Periksa kembali variabel DATABASE_URL di panel hosting dan pastikan database cloud aktif serta schema.sql sudah di-import.",
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
    const { slug } = await params;
    const token = extractToken(req);
    const auth = await authorize(slug, token);
    if (auth.status !== "ok" || !auth.data) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const undangan = auth.data;
    const body = await req.json();

    // Tambah banyak tamu sekaligus (Bulk Import)
    if (Array.isArray(body.daftar_nama)) {
      const hasil = await tambahBanyakTamu(undangan.id, body.daftar_nama);
      return NextResponse.json({ ok: true, tamu: hasil });
    }

    // Tambah satu tamu
    if (body.nama && typeof body.nama === "string") {
      const tamu = await tambahTamu(undangan.id, body.nama);
      return NextResponse.json({ ok: true, tamu });
    }

    return NextResponse.json({ error: "Nama tamu tidak valid" }, { status: 400 });
  } catch (err: unknown) {
    console.error("API POST admin error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal menyimpan tamu", detail: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const token = extractToken(req);
    const auth = await authorize(slug, token);
    if (auth.status !== "ok" || !auth.data) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const undangan = auth.data;
    const body = await req.json();

    // Edit nama tamu & konfirmasi kehadiran manual
    if (body.tamuId) {
      if (body.nama) {
        await updateTamu(Number(body.tamuId), String(body.nama));
      }
      if (body.hadir !== undefined) {
        await updateTamuRsvpManual(Number(body.tamuId), body.hadir, body.ucapan);
      }
      return NextResponse.json({ ok: true });
    }

    // Edit data undangan lengkap
    const updated = await updateUndanganLengkap(undangan.id, body);
    revalidatePath(`/u/${slug}`);
    if (updated?.slug && updated.slug !== slug) {
      revalidatePath(`/u/${updated.slug}`);
    }
    revalidatePath("/admin");
    return NextResponse.json({ ok: true, undangan: updated });
  } catch (err: unknown) {
    console.error("API PUT admin error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal memperbarui data", detail: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const token = extractToken(req);
    const auth = await authorize(slug, token);
    if (auth.status !== "ok" || !auth.data) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tamuId = req.nextUrl.searchParams.get("tamuId");
    if (tamuId) {
      await hapusTamu(Number(tamuId));
    }

    const rsvpId = req.nextUrl.searchParams.get("rsvpId");
    if (rsvpId) {
      await hapusRsvp(Number(rsvpId));
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("API DELETE admin error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal menghapus data", detail: msg }, { status: 500 });
  }
}
