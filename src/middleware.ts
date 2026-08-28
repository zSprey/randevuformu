import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ────────────────────────────────────────────────────────
// Korumalı Rota Tanımları (Auth Guard)
// ────────────────────────────────────────────────────────
const PROTECTED_ROUTES = ['/dashboard', '/calendar', '/forms', '/settings'];
const ADMIN_ROUTES = ['/admin'];
const PUBLIC_ROUTES = ['/', '/login', '/contact', '/sektorler'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Supabase Auth SSR Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isymhicfyatamwiwyuhk.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Va5Rnrm_uAwrPjKK3ClIzQ_QhJrRadT',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Oturum durumunu sessizce güncelle ve kullanıcıyı al
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ────────────────────────────────────────────────────────
  // AUTH GUARD: Dashboard rotaları için oturum kontrolü
  // ────────────────────────────────────────────────────────
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Zaten giriş yapmış kullanıcı /login'e gelirse dashboard'a yönlendir
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ────────────────────────────────────────────────────────
  // SUBDOMAIN ROUTING (dr-ahmet.randevuformu.com → /dr-ahmet)
  // ────────────────────────────────────────────────────────
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const isLocal = process.env.NODE_ENV === 'development'
  const baseDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (isLocal ? 'localhost:3000' : 'randevuformu.com')

  let subdomain = hostname.replace(`.${baseDomain}`, '')
  if (subdomain === hostname || subdomain === 'www') {
    subdomain = ''
  }

  let finalResponse = supabaseResponse

  if (subdomain) {
    const rewriteUrl = new URL(`/${subdomain}${url.pathname}`, request.url)
    rewriteUrl.search = url.search
    finalResponse = NextResponse.rewrite(rewriteUrl)
  }

  // ────────────────────────────────────────────────────────
  // GÜVENLİK BAŞLIKLARI
  // ────────────────────────────────────────────────────────
  finalResponse.headers.set('X-Frame-Options', 'DENY')
  finalResponse.headers.set('X-Content-Type-Options', 'nosniff')
  finalResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  finalResponse.headers.set('X-XSS-Protection', '1; mode=block')
  finalResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Supabase cookie'lerini kopyala (subdomain rewrite durumunda)
  if (finalResponse !== supabaseResponse) {
    const cookiesToSet = supabaseResponse.cookies.getAll()
    cookiesToSet.forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value, {
        domain: cookie.domain,
        path: cookie.path,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
        maxAge: cookie.maxAge,
        expires: cookie.expires
      })
    })
  }

  return finalResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
