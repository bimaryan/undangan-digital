import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAllTenants, createTenantUser, deleteTenantUser } from "@/lib/undangan";
import { isSameOrigin } from "@/lib/session";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tenants = await getAllTenants();
    return NextResponse.json({ tenants });
  } catch (err: unknown) {
    console.error("GET tenants error:", err);
    return NextResponse.json({ error: "Gagal mengambil daftar tenant" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan ditolak" }, { status: 403 });
  }

  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Nama, email, dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Kata sandi minimal 8 karakter." },
        { status: 400 }
      );
    }

    const tenant = await createTenantUser(email, password, name);
    return NextResponse.json({ ok: true, tenant });
  } catch (err: unknown) {
    console.error("POST create tenant error:", err);
    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal membuat tenant baru" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan ditolak" }, { status: 403 });
  }

  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "ID tenant wajib diisi." }, { status: 400 });
    }

    await deleteTenantUser(id);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("DELETE tenant error:", err);
    return NextResponse.json({ error: "Gagal menghapus tenant" }, { status: 500 });
  }
}
