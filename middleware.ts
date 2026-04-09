import { NextRequest, NextResponse } from 'next/server'

/**
 * H2-fix: Centralized route protection middleware.
 * Verifies session cookie presence before allowing access to protected routes.
 * The actual HMAC signature verification still happens in getSession() per-route.
 */

const PUBLIC_PATHS = new Set(['/', '/login', '/admin'])

const PUBLIC_API = new Set([
  '/api/auth/login',
  '/api/auth/login-json',
  '/api/auth/logout',
  '/api/template',
])

/** Prefixes that are public (pages that handle their own auth state). */
const PUBLIC_PREFIXES = ['/proyectos']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic =
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_API.has(pathname) ||
    PUBLIC_PREFIXES.some(p => pathname.startsWith(p))

  if (!isPublic) {
    const cookie = request.cookies.get('session')?.value
    // Cookie must exist and contain the HMAC "." separator
    if (!cookie || !cookie.includes('.')) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
      }
      const loginUrl = pathname.startsWith('/admin')
        ? new URL('/admin', request.url)
        : new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Security headers (bonus M1-fix)
  const res = NextResponse.next()
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  if (process.env.NODE_ENV === 'production') {
    res.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
