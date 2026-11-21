import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, ADMIN_COOKIE, type AdminSession, type TenantSession, verifySession } from "@/lib/session";

/**
 * Optimistic guard for admin and dashboard pages.
 * Authorization decisions that touch data are still enforced in the route handlers.
 * Next.js 16 renamed `middleware` to `proxy`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const user = verifySession<AdminSession | TenantSession>(
    request.cookies.get(AUTH_COOKIE)?.value || request.cookies.get(ADMIN_COOKIE)?.value
  );

  // Rute lama tetap berfungsi dengan mengalihkan ke /login.
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.search = request.nextUrl.search;
    return NextResponse.redirect(loginUrl);
  }

  // Halaman login multi-role (admin & client/tenant).
  if (pathname === "/login") {
    if (user?.role === "admin" || user?.role === "tenant") {
      const next = request.nextUrl.searchParams.get("next");
      const target =
        next &&
        next.startsWith("/") &&
        !next.startsWith("//") &&
        !next.startsWith("/login") &&
        !next.startsWith("/admin/login")
          ? next
          : user.role === "admin"
          ? "/admin"
          : "/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // Halaman pendaftaran client. User yang sudah masuk diarahkan ke panelnya.
  if (pathname === "/register") {
    if (user?.role === "admin" || user?.role === "tenant") {
      return NextResponse.redirect(
        new URL(user.role === "admin" ? "/admin" : "/dashboard", request.url)
      );
    }
    return NextResponse.next();
  }

  // Guard untuk dashboard tenant
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (user?.role === "tenant" || user?.role === "admin") {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Halaman Super Admin: /admin
  if (user?.role === "admin") {
    return NextResponse.next();
  }

  // Jika user adalah tenant yang mencoba buka /admin, arahkan ke /dashboard
  if (user?.role === "tenant") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/admin") {
    loginUrl.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
