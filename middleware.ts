import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && token?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (path.startsWith("/painel") && token?.role !== "company_admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: "/login"
    }
  }
);

export const config = {
  matcher: ["/admin/:path*", "/painel/:path*"]
};
