import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/products",
  "/categories",
  "/suppliers",
  "/purchases",
  "/sales",
  "/reports",
  "/low-stock",
  "/expiry",
  "/search",
  "/customers",
  "/settings",
];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("inventoryx_token")?.value;
  const { pathname } = req.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/register") && token) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/categories/:path*",
    "/suppliers/:path*",
    "/purchases/:path*",
    "/sales/:path*",
    "/reports/:path*",
    "/low-stock/:path*",
    "/expiry/:path*",
    "/search/:path*",
    "/customers/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};