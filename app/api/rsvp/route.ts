import { NextRequest, NextResponse } from "next/server";
import { getUndanganBySlug, simpanRsvp } from "@/lib/undangan";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.slug || !body.nama) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }
  const undangan = await getUndanganBySlug(body.slug);
  if (!undangan) {
    return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 });
  }
  const rsvp = await simpanRsvp(
    undangan.id,
    body.nama,
    body.hadir || "Hadir",
    body.ucapan || "",
    body.tamuId ? Number(body.tamuId) : null
  );
  return NextResponse.json(rsvp);
}