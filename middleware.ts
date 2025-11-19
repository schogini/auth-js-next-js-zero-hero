import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  // If trying to access /members and NOT logged in...
  if (req.nextUrl.pathname.startsWith('/members') && !isLoggedIn) {
    return Response.redirect(new URL('/api/auth/signin', req.nextUrl))
  }
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
