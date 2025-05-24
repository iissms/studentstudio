
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromCookies } from '@/lib/auth-utils' // Helper to check cookie (mocked)

// Removed AUTH_COOKIE_NAME from module scope

export async function middleware(request: NextRequest) {
  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token'
  const { pathname } = request.nextUrl
  const cookies = request.cookies
  const sessionToken = cookies.get(AUTH_COOKIE_NAME)?.value

  const user = sessionToken ? await getUserFromCookies(cookies) : null // Simulates validating token/session

  const isAuthPage = pathname.startsWith('/login')
  const isAppPage = !isAuthPage // Assuming all other pages are app pages for now

  if (isAuthPage) {
    if (user) {
      // User is logged in and trying to access login page, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // User is not logged in, allow access to login page
    return NextResponse.next()
  }

  if (isAppPage) {
    if (!user) {
      // User is not logged in and trying to access a protected app page, redirect to login
      // Preserve the intended URL for redirection after login
      const loginUrl = new URL('/login', request.url)
      // loginUrl.searchParams.set('redirect_to', pathname) // Optional: add redirect_to query param
      return NextResponse.redirect(loginUrl)
    }

    // User is logged in, allow access to app page
    // Role-based access can be checked here or in specific page/layout components
    // Example: if (pathname.startsWith('/admin') && user.role !== 'ADMIN') { return NextResponse.redirect(new URL('/unauthorized', request.url)) }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
}
