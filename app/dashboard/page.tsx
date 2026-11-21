import type { Metadata } from "next";
import RingkasanUndangan from "@/components/dashboard/RingkasanUndangan";

export const metadata: Metadata = {
  title: "Ringkasan Undangan",
  robots: { index: false, follow: false },
};

export const instant = false;

export default function DashboardPage() {
  return <RingkasanUndangan />;
}
