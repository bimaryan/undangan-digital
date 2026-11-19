import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth";
import AkunClient from "./AkunClient";

export const metadata: Metadata = {
  title: "Akun & Keamanan",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function AkunPage() {
  await connection();
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login?next=/admin/akun");
  }

  return <AkunClient email={session.sub} />;
}
