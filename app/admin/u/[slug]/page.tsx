import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { getHostAccess } from "@/lib/auth";
import KelolaClient from "./KelolaClient";

export const metadata: Metadata = {
  title: "Kelola Tamu",
  robots: { index: false, follow: false },
};

// Membaca cookie sesi + query token, jadi tidak boleh diprerender statis.
export const instant = false;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  await connection();
  const { slug } = await params;
  const { token } = await searchParams;

  // Magic link: serahkan ke Route Handler untuk menukar token menjadi cookie
  // httpOnly (cookie tidak boleh diubah dari Server Component), lalu URL bersih.
  if (token) {
    redirect(
      `/api/auth/host?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`
    );
  }

  const access = await getHostAccess(slug);
  if (!access) {
    redirect(`/admin/u/${encodeURIComponent(slug)}/akses`);
  }

  return <KelolaClient />;
}
