import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  HOST_COOKIE,
  type AdminSession,
  type HostSession,
  verifySession,
} from "@/lib/session";

/**
 * Optimistic guard for admin pages. Authorization decisions that touch data
 * are still enforced in the route handlers (`lib/auth.ts` + API routes).
 *
 * Next.js 16 renamed `middleware` to `proxy`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Halaman login admin harus tetap dapat diakses tanpa sesi.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const admin = verifySession<AdminSession>(
    request.cookies.get(ADMIN_COOKIE)?.value
  );

  if (admin?.role === "admin") {
    return NextResponse.next();
  }

  // Panel tuan rumah: /admin/u/<slug>
  if (pathname === "/admin/u" || pathname.startsWith("/admin/u/")) {
    const rest = pathname.slice("/admin/u/".length);
    const rawSlug = rest.split("/")[0] || "";
    const slug = decodeURIComponent(rawSlug);
    const isAccessPage = rest === `${rawSlug}/akses` || rest.endsWith("/akses");

    if (isAccessPage) {
      return NextResponse.next();
    }

    // Magic link: biarkan halaman menukar ?token= menjadi cookie sesi.
    if (request.nextUrl.searchParams.has("token")) {
      return NextResponse.next();
    }

    const host = verifySession<HostSession>(
      request.cookies.get(HOST_COOKIE)?.value
    );

    if (host?.role === "host" && host.slug === slug) {
      return NextResponse.next();
    }

    if (!slug) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.redirect(
      new URL(`/admin/u/${encodeURIComponent(slug)}/akses`, request.url)
    );
  }

  const loginUrl = new URL("/admin/login", request.url);
  if (pathname !== "/admin") {
    loginUrl.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
