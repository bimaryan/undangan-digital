import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth";
import AdminPanel from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Admin Panel — InovaInvite",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function AdminPage() {
  await connection();
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return <AdminPanel adminEmail={session.sub} />;
}
