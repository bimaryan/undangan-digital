import { getUploadedMedia } from "@/lib/media";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!/^[a-f0-9-]{36}$/i.test(id)) {
    return Response.json({ error: "Media tidak ditemukan" }, { status: 404 });
  }

  try {
    const media = await getUploadedMedia(id);
    if (!media) return Response.json({ error: "Media tidak ditemukan" }, { status: 404 });

    const range = request.headers.get("range");
    const baseHeaders = {
      "Content-Type": media.content_type,
      "Content-Disposition": `inline; filename="${media.filename.replace(/["\\]/g, "_")}"`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    // Audio controls use byte ranges to seek and some mobile browsers require
    // a 206 response before they will play an uploaded track.
    const match = range?.match(/^bytes=(\d+)-(\d*)$/);
    if (match) {
      const start = Number(match[1]);
      const end = match[2] ? Math.min(Number(match[2]), media.size - 1) : media.size - 1;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= media.size) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${media.size}` },
        });
      }

      const chunk = media.content.subarray(start, end + 1);
      return new Response(new Uint8Array(chunk), {
        status: 206,
        headers: {
          ...baseHeaders,
          "Content-Length": String(chunk.length),
          "Content-Range": `bytes ${start}-${end}/${media.size}`,
        },
      });
    }

    return new Response(new Uint8Array(media.content), {
      headers: {
        ...baseHeaders,
        "Content-Length": String(media.size),
      },
    });
  } catch (error) {
    console.error("Media GET error:", error);
    return Response.json({ error: "Gagal memuat media" }, { status: 500 });
  }
}
