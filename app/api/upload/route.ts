import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveUploadedMedia } from "@/lib/media";
import { attachUploadedMedia, getUndanganBySlug, getUndanganByToken } from "@/lib/undangan";

const FILE_TYPES = {
  jpg: { mime: "image/jpeg", category: "image", maxMb: 10 },
  jpeg: { mime: "image/jpeg", category: "image", maxMb: 10 },
  png: { mime: "image/png", category: "image", maxMb: 10 },
  webp: { mime: "image/webp", category: "image", maxMb: 10 },
  gif: { mime: "image/gif", category: "image", maxMb: 10 },
  mp3: { mime: "audio/mpeg", category: "audio", maxMb: 20 },
  m4a: { mime: "audio/mp4", category: "audio", maxMb: 20 },
  ogg: { mime: "audio/ogg", category: "audio", maxMb: 20 },
  wav: { mime: "audio/wav", category: "audio", maxMb: 20 },
  aac: { mime: "audio/aac", category: "audio", maxMb: 20 },
} as const;

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

async function canUpload(slug: string, token: string) {
  if (!slug || !token) return null;

  const invitation = await getUndanganBySlug(slug);
  if (!invitation) return null;
  if (invitation.akses_token === token) return invitation;

  // Prefer ADMIN_TOKEN (server-only); retain the old variable for compatibility.
  const masterToken = process.env.ADMIN_TOKEN || process.env.NEXT_PUBLIC_FIXED_TOKEN;
  if (masterToken && token === masterToken) return invitation;

  const tokenInvitation = await getUndanganByToken(token);
  return tokenInvitation?.slug === slug ? invitation : null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const rawFile = formData.get("file");
    const slug = String(formData.get("slug") ?? "").trim();
    const token = String(formData.get("token") ?? "").trim();
    const field = String(formData.get("field") ?? "").trim();

    if (!(rawFile instanceof File)) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    const invitation = await canUpload(slug, token);
    if (!invitation) {
      return NextResponse.json({ error: "Sesi admin tidak valid. Muat ulang halaman lalu coba lagi." }, { status: 401 });
    }

    const extension = getExtension(rawFile.name);
    const fileType = FILE_TYPES[extension as keyof typeof FILE_TYPES];
    if (!fileType) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Gunakan JPG, PNG, WebP, GIF, MP3, M4A, OGG, WAV, atau AAC." },
        { status: 400 }
      );
    }
    if (rawFile.size === 0) {
      return NextResponse.json({ error: "File yang dipilih kosong." }, { status: 400 });
    }

    const validField =
      (fileType.category === "image" && (field === "foto_cover" || field === "foto_acara")) ||
      (fileType.category === "audio" && field === "musik");
    if (!validField) {
      return NextResponse.json({ error: "Tujuan file upload tidak valid." }, { status: 400 });
    }

    const maxBytes = fileType.maxMb * 1024 * 1024;
    if (rawFile.size > maxBytes) {
      return NextResponse.json(
        { error: `Ukuran ${fileType.category === "audio" ? "audio" : "gambar"} maksimal ${fileType.maxMb} MB.` },
        { status: 400 }
      );
    }

    const id = randomUUID();
    await saveUploadedMedia({
      id,
      undangan_id: invitation.id,
      filename: rawFile.name.slice(0, 255),
      content_type: fileType.mime,
      size: rawFile.size,
      content: Buffer.from(await rawFile.arrayBuffer()),
    });

    const url = `/api/media/${id}`;
    await attachUploadedMedia(invitation.id, field as "foto_cover" | "foto_acara" | "musik", url);

    return NextResponse.json({
      url,
      type: fileType.category,
      filename: rawFile.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah file. Pastikan database aktif dan coba lagi." },
      { status: 500 }
    );
  }
}
