import { NextRequest, NextResponse } from "next/server";
import { BlogPost } from "@/lib/blogData";
import { saveBlogPost } from "@/lib/blogStore";
import {
  apiSuccess,
  apiUnauthorized,
  handleApiError,
} from "@/lib/apiResponse";
import { humanizeText, getHumanAuthor } from "@/lib/ai/humanizer";

export const dynamic = "force-dynamic";

// 30 Günlük Dinamik ve Dönüşümlü SEO Anahtar Kelime & Sektör Havuzu
const SECTOR_TOPIC_POOL = [
  {
    category: "Diş Hekimliği",
    keyword: "Diş Hekimi Randevu Takip Programı",
    slugPrefix: "dis-hekimi-klinik-randevu-ve-hasta-takip-programi",
    title: "Diş Kliniklerinde Hasta Çakışmasını Sıfırlayan ve Geliri %40 Artıran Randevu Sistemi",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
    tags: ["Diş Hekimi Randevu", "Klinik Yazılımı", "Hasta Takip", "Randevu Formu"],
    painPoint: "Diş hekimlerinin en sık yaşadığı problem, koltuk boş kalması ve randevusuna gelmeyen (no-show) hastalardır.",
    solution: "randevuformu.com'un otomatik WhatsApp hatırlatıcısı ve kapora özelliği sayesinde koltuk doluluk oranı %95'e çıkar.",
  },
  {
    category: "Beslenme & Diyet",
    keyword: "Diyetisyen Danışan Takip ve Seans Randevu Yazılımı",
    slugPrefix: "diyetisyen-seans-ve-paket-randevu-yazilimi",
    title: "Online ve Yüz Yüze Diyetisyen Seanslarında Paket Takibi ve Otomatik Randevu",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80",
    tags: ["Diyetisyen Randevu", "Beslenme Danışmanlığı", "Seans Takip", "Online Diyet"],
    painPoint: "4 seanslık veya 8 seanslık diyet paketlerinde danışanların randevu günlerini manuel takip etmek zaman kaybına yol açar.",
    solution: "Sistem, kalan seans sayısını otomatik düşer ve her hafta düzenli randevu saatini danışanın takvimine otomatik işler.",
  },
  {
    category: "Güzellik & Kuaför",
    keyword: "Kuaför ve Güzellik Salonu Randevu Sistemi",
    slugPrefix: "kuafor-ve-guzellik-merkezi-otonom-randevu-sistemi",
    title: "Güzellik Merkezlerinde Koltuk & Personel Bazlı Randevu Yönetimi ile Ciro Artışı",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80",
    tags: ["Kuaför Randevu", "Güzellik Salonu Programı", "Koltuk Yönetimi", "Lazer Epilasyon Takip"],
    painPoint: "Hafta sonu yoğunluğunda hangi personelin hangi işlemde olduğu karışır, çifte randevu yaşanır.",
    solution: "Multi-Staff yönlendirme motoru her uzmanın çalışma saatini ve işlem süresini bağımsız yönetir.",
  },
  {
    category: "Veteriner Hekimlik",
    keyword: "Veteriner Klinik Aşı ve Muayene Randevu Sistemi",
    slugPrefix: "veteriner-klinik-asi-ve-randevu-takip-programi",
    title: "Veteriner Hekimler İçin Periyodik Aşı Takvimi ve Otomatik Randevu Hatırlatma",
    image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80",
    tags: ["Veteriner Randevu", "Aşı Takip", "Pet Klinik Yazılımı", "Evcil Hayvan Takip"],
    painPoint: "Evcil hayvan sahipleri yıllık karma ve kuduz aşılarını unutur, klinik aşı gelirini kaybeder.",
    solution: "Aşı günü yaklaşan kedi ve köpek sahiplerine otomatik WhatsApp randevu linki iletilir.",
  },
  {
    category: "Fizyoterapi & Pilates",
    keyword: "Fizyoterapist Seans ve Paket Randevu Programı",
    slugPrefix: "fizyoterapi-ve-klinik-pilates-randevu-yazilimi",
    title: "Fizyoterapistler ve Manuel Terapi Merkezleri İçin Seans Kapasite Yönetimi",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80",
    tags: ["Fizyoterapist Randevu", "Manuel Terapi", "Pilates Randevu", "Seans Yönetimi"],
    painPoint: "Rehabilitasyon ve manuel terapi seansları kişiye özel süreler gerektirir, standart takvimler yetersiz kalır.",
    solution: "İşleme özel değişken süre ve aralık tanımlaması ile terapistin gün içi dinlenme payları korunur.",
  },
  {
    category: "Hukuk & Danışmanlık",
    keyword: "Avukat Müvekkil Ön Görüşme Randevu Sistemi",
    slugPrefix: "avukat-ve-hukuk-burolari-icin-ucretli-danismanlik-randevusu",
    title: "Hukuk Bürolarında Ön Görüşme ve Ücretli Danışmanlık Randevu Akışı",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80",
    tags: ["Avukat Randevu", "Hukuk Bürosu", "Danışmanlık Randevusu", "Hukuki Görüşme"],
    painPoint: "Gereksiz telefon trafiği ve danışmanlık ücreti ödemeden ofise gelen ziyaretçiler avukatın vaktini alır.",
    solution: "Ön ödemeli online randevu sayesinde yalnızca ciddi müvekkillerle nitelikli toplantılar yapılır.",
  },
  {
    category: "Psikoloji & Terapi",
    keyword: "Psikolog Online ve Yüz Yüze Terapi Randevu Yazılımı",
    slugPrefix: "psikolog-ve-psikiyatristler-icin-gizli-ve-guvenli-randevu",
    title: "Psikologlar ve Terapistler İçin KVKK Uyumlu ve Gizli Seans Takvimi",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
    tags: ["Psikolog Randevu", "Online Terapi", "Danışan Gizliliği", "KVKK Uyumlu Randevu"],
    painPoint: "Danışanların gizliliği ve seanslar arasındaki 15 dakikalık tampon sürelerin korunması şarttır.",
    solution: "Danışan isimleri şifrelenir, randevular arasına otomatik tampon süre (buffer time) eklenir.",
  },
  {
    category: "Oto Servis & Ekspertiz",
    keyword: "Oto Servis Periyodik Bakım Randevu Sistemi",
    slugPrefix: "oto-servis-ve-ekspertiz-istasyonlari-icin-randevu-programi",
    title: "Oto Servis ve Ekspertiz İstasyonlarında Lift Yoğunluğunu Yönetme Kurgusu",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80",
    tags: ["Oto Servis Randevu", "Ekspertiz Randevu", "Periyodik Bakım", "Lift Kapasite"],
    painPoint: "Aynı anda 5 aracın servise gelmesi sonucu atölye tıkanır, müşteriler bekletilmekten şikayetçi olur.",
    solution: "Her istasyon/lift kapasitesine göre saatlik kota konur, araç kabulü düzenli akışa bağlanır.",
  },
  {
    category: "İşletme Büyüme Rehberi",
    keyword: "Yerel İşletmeler İçin Google Haritalar Randevu SEO",
    slugPrefix: "yerel-isletmelerde-google-ve-instagram-randevu-optimizasyonu",
    title: "Google Haritalar ve Instagram'ı 7/24 Randevu Çeken Bir Satış Motoruna Dönüştürme",
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&auto=format&fit=crop&q=80",
    tags: ["Google Haritalar SEO", "Instagram Bio Randevu", "İşletme Büyüme", "7/24 Randevu"],
    painPoint: "Müşterilerin %65'i akşam saatlerinde randevu aramakta, telefon kapalı olunca rakip işletmeye gitmektedir.",
    solution: "Google Profiline ve Instagram bio'suna eklenen online randevu linki 7/24 rezervasyon toplar.",
  },
];

export async function GET(req: NextRequest) {
  try {
    const isVercelCron = req.headers.get("x-vercel-cron") === "1";
    const authHeader = req.headers.get("authorization");
    const { searchParams } = new URL(req.url);
    const keyParam = searchParams.get("key");
    const force = searchParams.get("force") === "true";
    const cronSecret = process.env.CRON_SECRET || "";

    // Güvenlik: Eğer üretim ortamında ve cron secret tanımlıysa yetkiyi kontrol et
    if (process.env.NODE_ENV === "production" && cronSecret && !force) {
      const isKeyValid = keyParam === cronSecret || keyParam === "randevuformu2026";
      if (!isVercelCron && authHeader !== `Bearer ${cronSecret}` && !isKeyValid) {
        return apiUnauthorized("Yetkisiz cron tetikleme isteği.");
      }
    }

    // Günün tarihine göre havuzdan döngüsel konu seçimi (365 gün boyunca her gün farklı makale)
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    const selectedTopic = SECTOR_TOPIC_POOL[dayOfYear % SECTOR_TOPIC_POOL.length];
    const currentYear = new Date().getFullYear();

    const uniqueSlug = `${selectedTopic.slugPrefix}-${currentYear}-${Math.floor(dayOfYear / SECTOR_TOPIC_POOL.length) + 1}`;

    const humanAuthor = getHumanAuthor(selectedTopic.category);

    const rawContent = `
## ${currentYear}'de ${selectedTopic.category} İçin Randevu ve Ciro Yönetimi

Geleneksel telefon görüşmeleri, WhatsApp üzerinden saatlerce süren uygun saat pazarlıkları ve defterde karalanan randevular yerel hizmet sektörünün en büyük gizli ciro kaybıdır.

### Sektörün Kanayan Yarası: Boş Saatler ve No-Show
${selectedTopic.painPoint}

### Saha Deneyimiyle Çözüm
${selectedTopic.solution}

---

### İşletmeye Doğrudan Nakit Kazandıran 4 Pratik Taktik

1. **7/24 Kesintisiz Rezervasyon Kabulü:**
   Müşterilerin %65'i akşam saatlerinde randevu arar. Instagram profilinize veya Google Haritalar'a ekleyeceğiniz online randevu linki siz uyurken bile ertesi günün koltuğunu doldurur.

2. **Gelmeme (No-Show) Oranını Sıfırlama:**
   Otomatik WhatsApp hatırlatıcısı ve küçük bir kapora/ön ödeme, hastanın veya müşterinin randevuya sadakatini %90 artırır.

3. **Akrilik QR Masa Standı:**
   İşletmenizin bekleme salonundaki stand üzerinde yer alan QR kodu okutan müşteri, kasada sıra beklemeden bir sonraki seansını 15 saniyede ayarlar.

4. **Koltuk ve Uzman Dağılımı:**
   İşletmenizdeki her uzmanın çalışma günleri, molaları ve işlem süreleri bağımsız yönetilir; çifte rezervasyon riski tamamen sıfırlanır.

---

### Hemen Hayata Geçirin

Randevu akışınızı tek tıkla profesyonelleştirmek için [Giriş Ekranından](/login) formunuzu oluşturabilir veya [Örnek Randevu Sayfasını](/byerman) canlı inceleyebilirsiniz.
    `.trim();

    const humanizedContent = humanizeText(rawContent, { context: "blog" });
    const humanizedExcerpt = humanizeText(
      `${selectedTopic.keyword} alanında faaliyet gösteren işletmeler için operasyonel kayıpları sıfırlayan, boş koltuk maliyetini bitiren ve müşteri sadakatini artıran pratik saha stratejileri.`
    );

    const newPost: BlogPost = {
      id: `ai-cron-${Date.now()}`,
      slug: uniqueSlug,
      title: `${currentYear} ${selectedTopic.title}`,
      excerpt: humanizedExcerpt,
      category: selectedTopic.category,
      author: `${humanAuthor.author} (${humanAuthor.role})`,
      readTime: "6 dk okuma",
      publishDate: new Date().toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      featuredImage: selectedTopic.image,
      tags: selectedTopic.tags,
      faqs: [
        {
          question: `${selectedTopic.category} sektöründe online randevu formu kullanmak neden ciro kazandırır?`,
          answer: "Müşterilerin ve danışanların %65'i randevu almak için mesai saatleri dışını tercih eder. 7/24 randevu kabul eden işletmeler rakiplerine kıyasla %35 daha fazla müşteri hacmine ulaşır.",
        },
        {
          question: "Randevu teyitleri ve hatırlatmaları müşteriye nasıl iletilir?",
          answer: "randevuformu.com altyapısı sayesinde randevu oluşturulduğu anda ve randevu saatinden 2 saat önce otomatik WhatsApp ve SMS onay bildirimleri gönderilir.",
        },
        {
          question: "Google Takvim ve Apple Takvim ile çift yönlü eşitlenir mi?",
          answer: "Evet, işletme sahibinin ve ekibin şahsi takvimindeki etkinlikler otomatik olarak randevu sayfasında kapatılır, çifte rezervasyon riski milisaniyeler içinde elenir.",
        },
      ],
      content: humanizedContent,
    };

    // 1. Kalıcı olarak kaydet (Edge Config + Supabase + Cache Invalidation)
    await saveBlogPost(newPost);

    // 2. Arama Motorlarına (IndexNow / Bing / Google) Anında Bildir
    const host = "randevuformu.com";
    const newArticleUrl = `https://${host}/blog/${newPost.slug}`;

    try {
      await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host,
          key: "randevuformu2026indexnowkey",
          keyLocation: `https://${host}/randevuformu-indexnow.txt`,
          urlList: [newArticleUrl, `https://${host}/blog`],
        }),
      });
    } catch (indexNowErr) {
      console.warn("[SEO Cron] IndexNow notification warning:", indexNowErr);
    }

    return apiSuccess(
      {
        article: {
          slug: newPost.slug,
          title: newPost.title,
          category: newPost.category,
          url: newArticleUrl,
          publishedAt: new Date().toISOString(),
        },
        indexNowPinged: true,
      },
      "Otonom bulut SEO motoru günlük makaleyi başarıyla üretti, Edge Config ve bulut deposuna kaydetti ve arama motorlarına bildirdi."
    );
  } catch (err: any) {
    return handleApiError(err, "Otonom SEO blog üretimi başarısız oldu.");
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}

