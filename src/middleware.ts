import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ────────────────────────────────────────────────────────
// Korumalı Rota Tanımları (Auth Guard)
// ────────────────────────────────────────────────────────
const PROTECTED_ROUTES = [
  '/dashboard',
  '/calendar',
  '/forms',
  '/settings',
  '/staff',
  '/clients',
  '/packages',
  '/retention',
  '/qr-stand',
];

// ────────────────────────────────────────────────────────
// EDGE WAF & SİBER SALDIRI KALKANI
// ────────────────────────────────────────────────────────
const MALICIOUS_PATTERNS = [
  '/.env',
  '/.git',
  '/.svn',
  '/.aws',
  '/.ssh',
  '/wp-admin',
  '/wp-login',
  '/xmlrpc.php',
  '/phpinfo',
  '/phpmyadmin',
  '/.htaccess',
  '/.ds_store',
  '..',
];

// In-Memory Edge Rate Limiting (Layer 7 Flood / Brute-Force Koruması)
const ipRateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 dakika
const MAX_API_REQUESTS_PER_MINUTE = 100;
const MAX_STRICT_REQUESTS_PER_MINUTE = 20; // SMS, Auth, Admin için ekstra katı limit

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const pathname = request.nextUrl.pathname
  const lowerPathname = pathname.toLowerCase()
  const hostHeader = (request.headers.get('host') || '').toLowerCase().split(':')[0]

  // 1. WAF Kötü Niyetli Tarayıcı / Saldırı Engelleme (.env, .git, traversal)
  if (MALICIOUS_PATTERNS.some((pattern) => lowerPathname.includes(pattern))) {
    return new NextResponse('Access Denied: Malicious Request Pattern Detected', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // 2. Edge API Rate Limiter (Layer 7 DDoS / Flooding Koruması)
  if (lowerPathname.startsWith('/api/')) {
    const isBypass =
      lowerPathname.startsWith('/api/cron/') ||
      lowerPathname.startsWith('/api/seo/indexnow') ||
      lowerPathname.startsWith('/api/calendar/feed');

    if (!isBypass) {
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '127.0.0.1';
      const now = Date.now();

      const isStrictEndpoint =
        lowerPathname.startsWith('/api/sms/') ||
        lowerPathname.startsWith('/api/auth/') ||
        lowerPathname.startsWith('/api/admin/');

      const limit = isStrictEndpoint ? MAX_STRICT_REQUESTS_PER_MINUTE : MAX_API_REQUESTS_PER_MINUTE;
      const recordKey = `${clientIp}:${isStrictEndpoint ? 'strict' : 'std'}`;

      // Hafıza temizliği (2000'i aşarsa süresi geçmişleri sil)
      if (ipRateMap.size > 2000) {
        for (const [k, v] of ipRateMap.entries()) {
          if (now > v.resetAt) ipRateMap.delete(k);
        }
      }

      const record = ipRateMap.get(recordKey);
      if (!record || now > record.resetAt) {
        ipRateMap.set(recordKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
      } else {
        record.count += 1;
        if (record.count > limit) {
          return new NextResponse(
            JSON.stringify({
              error: 'Too Many Requests',
              message: 'Aşırı istek tespit edildi. Güvenliğiniz için lütfen 1 dakika bekleyiniz.',
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': '60',
              },
            }
          );
        }
      }
    }
  }

  // ────────────────────────────────────────────────────────
  // 0. GOOGLE SEARCH CONSOLE & INDEXNOW INSTANT AUTO-VERIFICATION
  // Sadece tam eşleşen resmi Google Search Console dosyasını döndür.
  // Wildcard (joker) KULLANMA, aksi halde Googlebot güvenlik testi sahte URL'lerde de 200 alıp "saldırıya uğramış" hatası verir!
  // ────────────────────────────────────────────────────────
  if (lowerPathname === '/googlefa628ba0ea483542.html') {
    return new NextResponse('google-site-verification: googlefa628ba0ea483542.html', {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  if (lowerPathname === '/randevuformu-indexnow.txt') {
    return new NextResponse('randevuformu2026indexnowkey', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // ────────────────────────────────────────────────────────
  // 1. SUPER ADMIN AUTH GATEWAY (/admin, /admiN, /admin/login)
  // ────────────────────────────────────────────────────────
  if (lowerPathname === '/admin' || lowerPathname.startsWith('/admin/')) {
    const adminToken = request.cookies.get('rf_superadmin_session')?.value;
    const adminFlag = request.cookies.get('rf_superadmin')?.value;
    let isSuperAdmin = adminFlag === 'true';

    if (!isSuperAdmin && adminToken && adminToken.includes('.')) {
      try {
        const [payloadB64] = adminToken.split('.');
        let b64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4 !== 0) {
          b64 += '=';
        }
        const decoded = JSON.parse(atob(b64));
        if (
          decoded.role === 'SUPER_ADMIN' &&
          (decoded.user || '').toLowerCase() === 'musa' &&
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
  const isProtectedRoute = PROTECTED_ROUTES.some(route => lowerPathname.startsWith(route));
  const isLoginRoute = pathname === '/login';

  if (isProtectedRoute) {
    const rfSession = request.cookies.get('rf_session')?.value;
    const rfUser = request.cookies.get('rf_user')?.value;

    // Kesin kural: Sadece aktif ve geçerli kullanıcı oturumu varsa giriş kabul edilir
    let isAuthenticated = rfSession === 'true' && Boolean(rfUser);

    if (!isAuthenticated) {
      try {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
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
        if (user) isAuthenticated = true;
      } catch {
        isAuthenticated = false;
      }
    }

    if (!isAuthenticated) {
      // KULLANICI KURALI: Hesaba giriş yapmamış kişilerin /dashboard ve yönetim sayfalarına
      // erişimi kesinlikle engellenir; doğrudan ana ekrana (/) yönlendirilir.
      const targetBase = hostHeader === 'www.randevuformu.com' ? 'https://randevuformu.com' : request.url;
      const homeUrl = new URL('/', targetBase);
      return NextResponse.redirect(homeUrl);
    }
  }

  // ────────────────────────────────────────────────────────
  // 3. SUBDOMAIN ROUTING (byerman.randevuformu.com → /byerman)
  // ────────────────────────────────────────────────────────
  const url = request.nextUrl
  let subdomain = ''

  // Dedicated custom domain check for byermanrandevuformu.com & byerman.randevuformu.com
  if (
    hostHeader === 'byermanrandevuformu.com' ||
    hostHeader === 'www.byermanrandevuformu.com' ||
    hostHeader === 'byerman.randevuformu.com'
  ) {
    subdomain = 'byerman';
  } else if (hostHeader.endsWith('.randevuformu.com')) {
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

  const RESERVED_SUBDOMAINS = new Set([
    'www', 'admin', 'api', 'app', 'login', 'panel', 'dashboard',
    'settings', 'staff', 'calendar', 'clients', 'packages', 'retention',
    'qr-stand', 'blog', 'sektorler', 'kesfet', 'contact', 'ornek',
    'tv', 'widget', 'auth', 'mail', 'status', 'assets', 'cdn', 'static',
    'kvkk', 'gizlilik', 'kullanim-kosullari'
  ]);

  if (RESERVED_SUBDOMAINS.has(subdomain) || subdomain === hostHeader) {
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
      p.startsWith('/clients') ||
      p.startsWith('/packages') ||
      p.startsWith('/retention') ||
      p.startsWith('/qr-stand') ||
      p.startsWith('/widget') ||
      p.startsWith('/kvkk') ||
      p.startsWith('/gizlilik') ||
      p.startsWith('/kullanim-kosullari') ||
      p.includes('.')

    if (!isSystemPath) {
      const targetPath = p === '/' ? `/${subdomain}` : (p.startsWith(`/${subdomain}`) ? p : `/${subdomain}${p}`)
      const rewriteUrl = new URL(targetPath, request.url)
      rewriteUrl.search = url.search
      finalResponse = NextResponse.rewrite(rewriteUrl)
    }
  } else {
    // ────────────────────────────────────────────────────────
    // 3.1 ENFORCE PURE SUBDOMAIN FORMAT: https://[isletmeadi].randevuformu.com
    // randevuformu.com/isletmeadi erişimlerini otomatik olarak https://isletmeadi.randevuformu.com adresine kalıcı (308) yönlendir.
    // ────────────────────────────────────────────────────────
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length === 1) {
      const singleSlug = pathSegments[0].toLowerCase();
      if (!RESERVED_SUBDOMAINS.has(singleSlug) && !singleSlug.includes('.')) {
        const isLocal = process.env.NODE_ENV === 'development';
        const rootHost = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (isLocal ? 'localhost:3000' : 'randevuformu.com');
        const targetHost = isLocal ? `${singleSlug}.${rootHost}` : `${singleSlug}.randevuformu.com`;
        const protocol = request.headers.get('x-forwarded-proto') || (isLocal ? 'http' : 'https');
        const redirectUrl = new URL(url.search, `${protocol}://${targetHost}/`);
        return NextResponse.redirect(redirectUrl, 308);
      }
    }
  }

  // ────────────────────────────────────────────────────────
  // 4. GÜVENLİK BAŞLIKLARI
  // ────────────────────────────────────────────────────────
  if (!pathname.startsWith('/widget') && !pathname.startsWith('/tv')) {
    finalResponse.headers.set('X-Frame-Options', 'DENY')
  }
  finalResponse.headers.set('X-Content-Type-Options', 'nosniff')
  finalResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  finalResponse.headers.set('X-XSS-Protection', '1; mode=block')
  finalResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  finalResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  // Search Engine Edge Directive: Tell Googlebot to index freshly and not archive old cache
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/panel') && !pathname.startsWith('/api')) {
    finalResponse.headers.set(
      'X-Robots-Tag',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1, noarchive'
    )
  }

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
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)',
  ],
}
