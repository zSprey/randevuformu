import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Başlangıç response nesnesi
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Supabase istemcisini oluştur
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // İstek çerezlerini güncelle
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Response nesnesini yenile ve çerezleri ekle
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Oturum bilgisini (user) al - Bu işlem setAll'u tetikleyebilir
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Subdomain ve ana domain ayrımı
  // Yerel ortamda 'localhost:3000', canlı ortamda 'randevuformu.com' kullanılır
  const isLocal = process.env.NODE_ENV === 'development'
  const baseDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (isLocal ? 'localhost:3000' : 'randevuformu.com')
  
  let subdomain = hostname.replace(`.${baseDomain}`, '')
  // Eğer hostname tam olarak baseDomain ise, subdomain yoktur
  if (subdomain === hostname || subdomain === 'www') {
    subdomain = ''
  }

  let finalResponse = supabaseResponse

  // 1. Subdomain Yönlendirmesi (kullaniciadi.randevuformu.com -> /[slug])
  if (subdomain) {
    const rewriteUrl = new URL(`/${subdomain}${url.pathname}`, request.url)
    // Arama parametrelerini (query string) koru
    rewriteUrl.search = url.search
    finalResponse = NextResponse.rewrite(rewriteUrl)
  } 
  // 2. Ana Domain Yönlendirmeleri ve Kullanıcı Rolleri
  else {
    // Korunan rotalar (Örn: /dashboard)
    if (url.pathname.startsWith('/dashboard')) {
      if (!user) {
        // Kullanıcı giriş yapmamışsa login'e yönlendir
        finalResponse = NextResponse.redirect(new URL('/login', request.url))
      } else {
        // Kullanıcı giriş yapmış, role tabanlı yetki kontrolü yap
        // Not: Rol bilgisi genellikle app_metadata veya user_metadata içinde saklanır
        const role = user.app_metadata?.role || user.user_metadata?.role || 'user'
        
        // Örnek: Admin yetkisi gerektiren rotalar
        if (url.pathname.startsWith('/dashboard/admin') && role !== 'admin') {
          // Yetkisiz kullanıcıları standart dashboard'a yönlendir
          finalResponse = NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }
  }

  // Eğer yönlendirme yapıldıysa (rewrite/redirect), Supabase'in yenilediği cookie'leri aktar
  // Bu adım session'ın (oturumun) sürekliliği için kritiktir.
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
    /*
     * Aşağıdaki yollar hariç tüm isteklerde middleware çalışır:
     * - _next/static (statik dosyalar)
     * - _next/image (resim optimizasyon dosyaları)
     * - favicon.ico (favicon)
     * - public dizinindeki dosyalar vs. (svg|png|jpg|jpeg|gif|webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
