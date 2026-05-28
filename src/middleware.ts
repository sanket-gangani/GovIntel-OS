import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || "govintel-super-secret-key-change-in-production"
);

// Define which routes require authentication
const protectedRoutes = ["/", "/settings", "/report"];
const isProtectedRoute = (path: string) => {
  return protectedRoutes.some(route => path === route || path.startsWith(`${route}/`));
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and api/auth routes are public
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images") // adjust if you have public static assets
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("govintel-session")?.value;

  // If user is accessing a protected route without a session, redirect to login
  if (!session && isProtectedRoute(pathname)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // If there is a session, verify it
  if (session) {
    try {
      await jwtVerify(session, SECRET_KEY);
      
      // If user goes to /login while already logged in, redirect them to home
      if (pathname === "/login") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      return NextResponse.next();
    } catch (error) {
      // Invalid token, clear it and redirect to login if protected
      const response = isProtectedRoute(pathname) 
        ? NextResponse.redirect(new URL("/login", request.url))
        : NextResponse.next();
        
      response.cookies.delete("govintel-session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
