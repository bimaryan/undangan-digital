import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { getAllUndangan, createUndangan, assignUndanganTenant, assignUndanganTenantBySlug } from "@/lib/undangan";
import { isSameOrigin } from "@/lib/session";

export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (session.role === "admin") {
      const data = await getAllUndangan();
      return NextResponse.json({ undangan: data });
    }

    if (session.role === "tenant") {
      const data = await getAllUndangan(session.userId);
      return NextResponse.json({ undangan: data });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (err: unknown) {
    console.error("GET undangan error:", err);
    return NextResponse.json({ error: "Gagal mengambil daftar undangan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan ditolak" }, { status: 403 });
  }

  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const slug = String(body.slug || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const namaAnak = String(body.nama_anak || "").trim();
    const namaOrtu = String(body.nama_orang_tua || "").trim();
    const tanggal = String(body.tanggal || "").trim();
    const jam = String(body.jam || "08:00:00").trim();
    const lokasi = String(body.lokasi || "").trim();

    if (!slug || !namaAnak || !tanggal || !lokasi) {
      return NextResponse.json(
        { error: "Slug, nama anak, tanggal, dan lokasi wajib diisi." },
        { status: 400 }
      );
    }

    const requestedUserId = Number(body.user_id);
    const userId = session.role === "admin"
      ? (Number.isSafeInteger(requestedUserId) && requestedUserId > 0 ? requestedUserId : null)
      : session.userId;

    const dataJson: Record<string, unknown> = {
      ...(typeof body.data_json === "object" && body.data_json !== null
        ? (body.data_json as Record<string, unknown>)
        : {}),
    };

    const created = await createUndangan({
      slug,
      nama_anak: namaAnak,
      nama_orang_tua: namaOrtu,
      tanggal,
      jam,
      lokasi,
      user_id: userId,
      data_json: dataJson,
    });

    return NextResponse.json({ ok: true, undangan: created });
  } catch (err: unknown) {
    console.error("POST create undangan error:", err);
    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "Slug sudah digunakan oleh undangan lain." }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal membuat undangan baru" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan ditolak" }, { status: 403 });
  }

  const session = await getUserSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang dapat mengatur pemilik undangan." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const requestedUserId = body.user_id != null ? Number(body.user_id) : null;
    const userId =
      requestedUserId !== null && Number.isSafeInteger(requestedUserId) && requestedUserId > 0
        ? requestedUserId
        : null;

    // Support slug-based assignment (from AdminPanel)
    if (body.slug) {
      const slug = String(body.slug).trim();
      const updated = await assignUndanganTenantBySlug(slug, userId);
      return NextResponse.json({ ok: true, undangan: updated || null });
    }

    // Legacy: id-based assignment
    const undanganId = Number(body.undangan_id);
    if (!Number.isSafeInteger(undanganId) || undanganId <= 0) {
      return NextResponse.json({ error: "slug atau undangan_id wajib diisi." }, { status: 400 });
    }

    const updated = await assignUndanganTenant(undanganId, userId);
    return NextResponse.json({ ok: true, undangan: updated });
  } catch (err: unknown) {
    console.error("PATCH assign tenant error:", err);
    return NextResponse.json({ error: "Gagal mengatur pemilik undangan" }, { status: 500 });
  }
}
