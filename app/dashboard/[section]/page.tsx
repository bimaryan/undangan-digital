import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EditorSection from "@/components/dashboard/EditorSection";
import { EDITOR_SECTION_META, isEditorSection } from "@/lib/dashboard-sections";

type PageProps = {
  params: Promise<{ section: string }>;
};

export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section } = await params;
  return {
    title: isEditorSection(section) ? EDITOR_SECTION_META[section].label : "Editor Undangan",
    robots: { index: false, follow: false },
  };
}

/**
 * Halaman konten editor: /dashboard/identitas, /dashboard/media, /dashboard/acara,
 * /dashboard/keluarga, /dashboard/amplop, /dashboard/musik.
 * Navbar + sidebar sudah disediakan oleh `app/dashboard/layout.tsx`.
 */
export default async function EditorSectionPage({ params }: PageProps) {
  const { section } = await params;
  if (!isEditorSection(section)) notFound();
  return <EditorSection section={section} />;
}
