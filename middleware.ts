import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")

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

export const config = {
  matcher: [
    "/((?!api/auth|api/trpc|_next/static|_next/image|favicon.ico).*)",
  ],
}