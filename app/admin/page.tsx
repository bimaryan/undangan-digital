import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth";
import AdminEditor from "./AdminEditor";

export const metadata: Metadata = {
  title: "Editor Undangan",
  robots: { index: false, follow: false },
};

// Halaman ini membaca cookie sesi dan wajib dirender saat request.
export const instant = false;

export default async function AdminPage() {
  await connection();
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminEditor adminEmail={session.sub} />;
}
