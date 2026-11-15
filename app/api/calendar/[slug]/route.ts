import { NextRequest, NextResponse } from "next/server";
import { getUndanganBySlug } from "@/lib/undangan";

// Deteksi apakah request dari Safari/iOS agar bisa pakai inline (native sheet)
function isIosSafari(ua: string): boolean {
  return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ua = req.headers.get("user-agent") || "";
  const iosSafari = isIosSafari(ua);

  let data = null;
  try {
    data = await getUndanganBySlug(slug);
  } catch (err) {
    console.error("DB error in calendar route:", err);
  }

  const namaAnak = data?.nama_anak || "Zayyan Arkana Alfarizqi";
  const labelAcara = data?.data_json?.label_acara || "Khitanan :";
  const lokasi =
    data?.lokasi ||
    "Desa Rambatan Kulon (Bangkir) Rt. 07 Rw. 01 blok Kangkung Kec. Lohbener Kab. Indramayu";
  const mapsUrl = data?.maps_url || "";

  let dateObj = new Date("2026-11-18T08:00:00+07:00");
  if (data?.tanggal) {
    try {
      const d = data.tanggal instanceof Date ? data.tanggal : new Date(data.tanggal);
      if (!isNaN(d.getTime())) {
        const dateStr = d.toISOString().slice(0, 10);
        let jamStr = "08:00";
        if (data?.jam) {
          jamStr = String(data.jam).slice(0, 5);
        }
        const parsed = new Date(`${dateStr}T${jamStr}:00+07:00`);
        if (!isNaN(parsed.getTime())) {
          dateObj = parsed;
        }
      }
    } catch {}
  }

  const startUtc = new Date(dateObj.getTime());
  const endUtc = new Date(dateObj.getTime() + 5 * 3600 * 1000);

  const formatUtc = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const cleanTitle = `${labelAcara.replace(/:/g, "").trim()} ${namaAnak}`.replace(/,/g, "\\,");
  const cleanLocation = lokasi.replace(/,/g, "\\,").replace(/\n/g, " ");
  const currentUrl = req.nextUrl.origin + `/u/${slug}`;
  const cleanDescription = (
    `Syukuran ${cleanTitle}\\n\\n` +
    `Lokasi: ${cleanLocation}\\n` +
    (mapsUrl ? `Google Maps: ${mapsUrl}\\n` : "") +
    `Undangan Online: ${currentUrl}\\n`
  );

  const uid = `khitanan-${slug}-${startUtc.getTime()}@undangan`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Undangan Digital//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(startUtc)}`,
    `DTEND:${formatUtc(endUtc)}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${cleanLocation}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:Pengingat: Besok Acara ${cleanTitle}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Pengingat: 2 Jam Lagi Acara ${cleanTitle}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // iOS Safari: inline → sistem langsung tawarkan "Add to Calendar" sheet
      // Android/Desktop: attachment → browser download file .ics, lalu buka manual
      "Content-Disposition": iosSafari
        ? `inline; filename="undangan-${slug}.ics"`
        : `attachment; filename="undangan-${slug}.ics"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

