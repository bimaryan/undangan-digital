import type { Metadata } from "next";
import KelolaTamuContent from "@/components/dashboard/KelolaTamuContent";

export const metadata: Metadata = {
  title: "Kelola Tamu & RSVP",
  robots: { index: false, follow: false },
};

export const instant = false;

export default function TamuPage() {
  return <KelolaTamuContent />;
}
