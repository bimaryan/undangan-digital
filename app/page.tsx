import { redirect } from "next/navigation";

export default function Home() {
  const slug = process.env.NEXT_PUBLIC_FIXED_SLUG || "khitanan-zayyan-arkana-alfarizqi";
  redirect(`/u/${slug}`);
}
