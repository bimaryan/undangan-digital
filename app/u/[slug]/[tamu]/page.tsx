import { Suspense } from "react";
import type { Metadata } from "next";
import { getUndanganBySlug } from "@/lib/undangan";
import UndanganClient from "@/components/undangan/UndanganClient";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; tamu: string }>;
  searchParams: Promise<{ to?: string }>;
}): Promise<Metadata> {
  const { slug, tamu } = await params;
  const { to } = await searchParams;
  let data = null;
  try {
    data = await getUndanganBySlug(slug);
  } catch {}

  const namaAnak = data?.nama_anak || "Zayyan Arkana Alfarizqi";
  const label = (data?.data_json?.label_acara || "Khitanan :").replace(/:/g, "").trim();
  const namaTamu =
    to ||
    decodeURIComponent(tamu)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const title = `Undangan ${label} ${namaAnak} - Kepada Yth. ${namaTamu}`;
  const desc = `Syukuran ${label} ${namaAnak}. Kami mengundang Bapak/Ibu/Saudara/i ${namaTamu} untuk hadir dan memberikan do'a restu.`;
  const coverImg = data?.foto_cover || "/images/cover.jpg";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inovainvite.com";
  const fullImg = coverImg.startsWith("http") ? coverImg : `${baseUrl}${coverImg}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${baseUrl}/u/${slug}/${tamu}`,
      siteName: "InovaInvite",
      images: [
        {
          url: fullImg,
          width: 800,
          height: 600,
          alt: `Undangan ${namaAnak} untuk ${namaTamu}`,
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
  params: Promise<{ slug: string; tamu: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const { slug, tamu } = await params;
  const { to } = await searchParams;

  let data = null;
  try {
    data = await getUndanganBySlug(slug);
  } catch (err) {
    console.error("Database query failed, using template data fallback:", err);
  }

  if (!data && slug !== "khitanan-zayyan-arkana-alfarizqi") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Undangan tidak ditemukan.</p>
      </main>
    );
  }

  const namaTamu =
    to ||
    decodeURIComponent(tamu)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return <UndanganClient data={data} guest={namaTamu} />;
}

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; tamu: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-serif text-lg text-[#2b2f5e]">Memuat undangan...</div>}>
      <Loader params={params} searchParams={searchParams} />
    </Suspense>
  );
}
