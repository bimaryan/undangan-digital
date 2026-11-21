import { redirect } from "next/navigation";
import { connection } from "next/server";

export const instant = false;

export default async function DashboardSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  redirect(`/dashboard?slug=${encodeURIComponent(slug)}`);
}
