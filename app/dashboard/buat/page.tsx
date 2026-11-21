import type { Metadata } from "next";
import BuatUndangan from "@/components/dashboard/BuatUndangan";

export const metadata: Metadata = {
  title: "Buat Undangan",
  robots: { index: false, follow: false },
};

export const instant = false;

export default function Page() {
  return <BuatUndangan />;
}
