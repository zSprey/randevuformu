import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ────────────────────────────────────────────────────────
// Korumalı Rota Tanımları (Auth Guard)
// ────────────────────────────────────────────────────────
const PROTECTED_ROUTES = ['/dashboard', '/calendar', '/forms', '/settings', '/staff'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const pathname = request.nextUrl.pathname
  const lowerPathname = pathname.toLowerCase()

  // ────────────────────────────────────────────────────────
  // 1. SUPER ADMIN AUTH GATEWAY (/admin, /admiN, /admin/login)
  // ────────────────────────────────────────────────────────
  if (lowerPathname === '/admin' || lowerPathname.startsWith('/admin/')) {
    const adminToken = request.cookies.get('rf_superadmin_session')?.value;
    let isSuperAdmin = false;

    if (adminToken && adminToken.includes('.')) {
      try {
        const [payloadB64] = adminToken.split('.');
        let b64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4 !== 0) {
          b64 += '=';
        }
        const decoded = JSON.parse(atob(b64));
        if (
          decoded.role === 'SUPER_ADMIN' &&
          decoded.user === 'musa' &&
          decoded.expiresAt > Date.now()
        ) {
          isSuperAdmin = true;
        }
      } catch {
        isSuperAdmin = false;
      }
    }

    // Super Admin Login sayfası
    if (lowerPathname === '/admin/login') {
      if (isSuperAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return supabaseResponse;
    }

    // Korunan Admin paneli
    if (!isSuperAdmin) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(adminLoginUrl);
    }

    return supabaseResponse;
  }

  // ────────────────────────────────────────────────────────
  // 2. TENANT DASHBOARD AUTH GUARD (/dashboard, /calendar, vb.)
  // ────────────────────────────────────────────────────────
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

  const { data: { user } } = await supabase.auth.getUser()
  const hasCookieSession = request.cookies.get('rf_session')?.value === 'true' || request.cookies.get('demo_session')?.value === 'true';
  const isAuthenticated = !!user || hasCookieSession;

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Zaten giriş yapmış kullanıcı /login'e gelirse dashboard'a yönlendir
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ────────────────────────────────────────────────────────
  // 3. SUBDOMAIN ROUTING (byerman.randevuformu.com → /byerman)
  // ────────────────────────────────────────────────────────
  const url = request.nextUrl
  const hostHeader = (request.headers.get('host') || '').toLowerCase().split(':')[0] // remove port
  let subdomain = ''

  if (hostHeader.endsWith('.randevuformu.com')) {
    subdomain = hostHeader.replace('.randevuformu.com', '')
  } else if (hostHeader.endsWith('.localhost')) {
    subdomain = hostHeader.replace('.localhost', '')
  } else {
    // Custom root domain or env fallback
    const isLocal = process.env.NODE_ENV === 'development'
    const baseDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || (isLocal ? 'localhost' : 'randevuformu.com')).toLowerCase().split(':')[0]
    if (hostHeader.endsWith(`.${baseDomain}`)) {
      subdomain = hostHeader.replace(`.${baseDomain}`, '')
    }
  }

  if (subdomain === 'www' || subdomain === 'admin' || subdomain === hostHeader) {
    subdomain = ''
  }

  let finalResponse = supabaseResponse

  if (subdomain) {
    const p = url.pathname
    const isSystemPath = 
      p.startsWith('/api') || 
      p.startsWith('/_next') || 
      p.startsWith('/login') || 
      p.startsWith('/admin') || 
      p.startsWith('/dashboard') ||
      p.startsWith('/calendar') ||
      p.startsWith('/settings') ||
      p.startsWith('/staff') ||
      p.includes('.')

    if (!isSystemPath) {
      const targetPath = p === '/' ? `/${subdomain}` : (p.startsWith(`/${subdomain}`) ? p : `/${subdomain}${p}`)
      const rewriteUrl = new URL(targetPath, request.url)
      rewriteUrl.search = url.search
      finalResponse = NextResponse.rewrite(rewriteUrl)
    }
  }

  // ────────────────────────────────────────────────────────
  // 4. GÜVENLİK BAŞLIKLARI
  // ────────────────────────────────────────────────────────
  finalResponse.headers.set('X-Frame-Options', 'DENY')
  finalResponse.headers.set('X-Content-Type-Options', 'nosniff')
  finalResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  finalResponse.headers.set('X-XSS-Protection', '1; mode=block')
  finalResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (finalResponse !== supabaseResponse) {
    const cookiesToSet = supabaseResponse.cookies.getAll()
    cookiesToSet.forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value, {
        domain: cookie.domain,
        path: cookie.path,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
      })
    })
  }

  return finalResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
