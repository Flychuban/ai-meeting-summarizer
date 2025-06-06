import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")

  // Allow API routes to pass through
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Handle auth pages
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.nextUrl))
    }
    return NextResponse.next()
  }

  // Allow unauthenticated users to access homepage and auth pages
  const publicPaths = ["/", "/auth/login", "/auth/sign-up"]
  if (!isLoggedIn && publicPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    let from = req.nextUrl.pathname
    if (req.nextUrl.search) {
      from += req.nextUrl.search
    }

    return NextResponse.redirect(
      new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.nextUrl)
    )
  }

  return NextResponse.next()
})

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api/auth (auth API routes)
//      * - api/trpc (tRPC API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - public folder
//      */
//     "/((?!api/auth|api/trpc|_next/static|_next/image|favicon.ico|public).*)",
//   ],
// }

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - all files in the public folder (served at root, e.g., /demo_img.png, /robots.txt, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|site.webmanifest|og-image.png|demo_img.png|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.webp|.*\\.txt|.*\\.ico).*)",
  ],
} 