import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { getUserSession } from "@/lib/auth";
import { getAllUndangan } from "@/lib/undangan";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard Client",
  robots: { index: false, follow: false },
};

// Layout ini membaca cookie sesi, jadi wajib dirender saat request.
export const instant = false;

/**
 * Layout dashboard client / tenant.
 *
 * Setara `index.blade.php` di Laravel:
 *
 *   @include('components.navbar')   → <DashboardShell> (navbar + sidebar)
 *   @yield('content')               → {children}
 *
 * Halaman di dalam `app/dashboard/**` cukup mengembalikan kontennya saja;
 * navbar dan sidebar otomatis terpasang.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const session = await getUserSession();
  if (!session) {
    redirect("/login?next=/dashboard");
  }

  // Admin memakai panel admin, bukan dashboard client.
  if (session.role === "admin") {
    redirect("/admin");
  }

  const invitations = await getAllUndangan(session.userId);

  return (
    <DashboardShell
      user={{
        id: session.userId,
        email: session.sub,
        name: session.name,
        role: session.role,
      }}
      invitations={invitations}
    >
      {children}
    </DashboardShell>
  );
}
