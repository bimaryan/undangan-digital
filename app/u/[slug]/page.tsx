import { Suspense } from "react";
import type { Metadata } from "next";
import { getUndanganBySlug } from "@/lib/undangan";
import UndanganClient from "./UndanganClient";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { to } = await searchParams;
  let data = null;
  try {
    data = await getUndanganBySlug(slug);
  } catch {}

  const namaAnak = data?.nama_anak || "Zayyan Arkana Alfarizqi";
  const label = (data?.data_json?.label_acara || "Khitanan :").replace(/:/g, "").trim();
  const title = to
    ? `Undangan ${label} ${namaAnak} - Kepada Yth. ${to}`
    : `Undangan ${label} ${namaAnak}`;
  const desc = `Syukuran ${label} ${namaAnak}. Kami menantikan kehadiran dan do'a restu Bapak/Ibu/Saudara/i.`;
  const coverImg = data?.foto_cover || "/images/cover.jpg";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inovainvite.com";
  const fullImg = coverImg.startsWith("http") ? coverImg : `${baseUrl}${coverImg}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${baseUrl}/u/${slug}${to ? `?to=${encodeURIComponent(to)}` : ""}`,
      siteName: "InovaInvite",
      images: [
        {
          url: fullImg,
          width: 800,
          height: 600,
          alt: `Undangan ${namaAnak}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [fullImg],
    },
  };
}

async function Loader({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const { slug } = await params;
  const { to } = await searchParams;

  let data = null;
  try {
    data = await getUndanganBySlug(slug);
  } catch (err) {
    console.error("Database query failed, using template data fallback:", err);
  }

  // Jika data database tidak ditemukan, khusus slug zayyan atau default tetap tampilkan template contoh
  if (!data && slug !== "khitanan-zayyan-arkana-alfarizqi") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Undangan tidak ditemukan.</p>
      </main>
    );
  }

  return <UndanganClient data={data} guest={to || "[Nama Tamu]"} />;
}

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-serif text-lg text-[#2b2f5e]">Memuat undangan...</div>}>
      <Loader params={params} searchParams={searchParams} />
    </Suspense>
  );
}
