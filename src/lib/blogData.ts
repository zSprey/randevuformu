export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readTime: string;
  publishDate: string;
  featuredImage: string;
  tags: string[];
  faqs: { question: string; answer: string }[];
}

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    slug: "2026-en-iyi-dis-hekimi-randevu-programlari",
    title: "2026'nın En İyi Diş Hekimi Randevu ve Klinik Takip Programları Karşılaştırması",
    excerpt: "Diş hekimleri ve poliklinikler için hasta çakışmalarını önleyen, WhatsApp onaylı ve çift yönlü Google Takvim senkronizasyonuna sahip en iyi randevu yazılımlarını inceliyoruz.",
    category: "Diş Hekimliği",
    author: "randevuformu.com Ürün Ekibi",
    readTime: "6 dk okuma",
    publishDate: "28 Ağustos 2026",
    featuredImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
    tags: ["Diş Hekimi Randevu", "Klinik Yazılımı", "Calendly Alternatifi", "Hasta Takip"],
    faqs: [
      {
        question: "Diş kliniklerinde randevu çakışmaları nasıl önlenir?",
        answer: "randevuformu.com'un milisaniyelik lock mekanizması sayesinde aynı anda iki hasta aynı koltuğu rezerve edemez. Ayrıca Google Takvim'deki kişisel etkinlikler otomatik bloke edilir."
      },
      {
        question: "Hastalar randevu alırken onay kodu gerekiyor mu?",
        answer: "Evet, SMS OTP teyit mekanizması sayesinde geçersiz telefon numaraları elenir ve sahte rezervasyonların önüne geçilir."
      }
    ],
    content: `
## Modern Diş Kliniklerinde Dijital Randevu Yönetimi Neden Şart?

Geleneksel telefon ve defterle randevu yönetimi, günümüz diş hekimleri için ciddi bir ciro ve zaman kaybı kaynağıdır. Araştırmalara göre, hastaların **%67'si mesai saatleri dışında (akşam veya hafta sonu)** randevu almayı tercih etmektedir.

Kliniğiniz kapalıyken bile 7/24 randevu kabul edebilmek, aylık hasta hacminizi ortalama **%35 oranında artırır**.

### Diş Hekimi Randevu Yazılımında Bulunması Gereken 5 Temel Özellik

1. **Çift Yönlü Takvim Eşitlemesi:** Hekimin Google veya Apple Takvimindeki kişisel planları anında randevu sayfasında kapalı görünmelidir.
2. **Otomatik WhatsApp & SMS Hatırlatması:** Randevuya 24 saat ve 2 saat kala gönderilen hatırlatıcılar gelmeme (no-show) oranını %80 azaltır.
3. **Çoklu Hekim ve Koltuk Yönlendirmesi (Multi-Staff):** Polikliniklerdeki farklı uzmanların (Ortodonti, Çene Cerrahisi, Endodonti) çalışma günleri ayrıştırılabilmelidir.
4. **Kapora ve Ön Ödeme Tahsilatı:** Yüksek maliyetli cerrahi işlemler öncesinde kapora tahsil edilerek hekimin boş kalması önlenir.
5. **KVKK Uyumlu Hasta Formu:** Medikal geçmiş ve alerji bilgileri şifreli biçimde toplanmalıdır.

---

### Neden randevuformu.com?

randevuformu.com, Türkiye'deki diş hekimleri için özel olarak optimize edilmiş **yerli İyzico sanal POS**, **Türkçe SMS altyapısı** ve **milisaniyelik çakışma önleyici algoritması** ile Calendly ve yabancı rakiplerine kıyasla %100 yerel ve çok daha ekonomiktir.
    `
  },
  {
    id: "blog-2",
    slug: "diyetisyen-musteri-takip-ve-online-seans-yazilimi",
    title: "Diyetisyenler İçin Online Randevu ve Danışan Yönetimi Rehberi",
    excerpt: "Online diyet seansları, otomatik Google Meet link üretimi ve danışan formlarının tek ekrandan yönetilmesi için kapsamlı stratejiler.",
    category: "Beslenme & Diyet",
    author: "randevuformu.com Büyüme Rehberi",
    readTime: "5 dk okuma",
    publishDate: "27 Ağustos 2026",
    featuredImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=80",
    tags: ["Diyetisyen Programı", "Online Seans", "Google Meet Entegrasyonu", "Beslenme Danışmanlığı"],
    faqs: [
      {
        question: "Online diyet seanslarında toplantı linki otomatik gönderiliyor mu?",
        answer: "Evet, danışan randevu aldığı anda sistem otomatik Google Meet veya Zoom linki oluşturup iki tarafa da takvim daveti olarak iletir."
      },
      {
        question: "Danışanlardan seans öncesi kan tahlili veya bilgi formu toplayabilir miyim?",
        answer: "Evet, No-Code Form Oluşturucu ile kilonuz, boyunuz, hedefiniz gibi özel soruları randevu adımına ekleyebilirsiniz."
      }
    ],
    content: `
## Online Diyetisyenlikte Zaman Yönetimi ve Otomasyon

Online beslenme danışmanlığı sunan uzmanların en sık karşılaştığı sorun; WhatsApp üzerinden sürekli saat uyuşmazlığı yaşamak, IBAN paylaşımı ve toplantı linki göndermekle vakit kaybetmektir.

Modern bir randevu motoru, tüm bu manuel süreci **10 saniyeye** indirir:

1. Danışan Instagram bio'nuzdaki linke tıklar.
2. Kendisine uygun gün ve saati seçer.
3. Seans ücretini güvenle kredi kartıyla öder.
4. Hem danışanın hem sizin takviminize **Google Meet linki hazır randevu** eklenir!

---

### randevuformu.com ile Danışan Başına 45 Dakika Tasarruf

Manuel randevu planlama, hatırlatma mesajları atma ve link paylaşma yükünü ortadan kaldırarak haftada fazladan **8-10 yeni danışan** kabul edebilirsiniz.
    `
  },
  {
    id: "blog-3",
    slug: "kuafor-guzellik-salonu-randevu-iptali-onleme",
    title: "Kuaför ve Güzellik Salonlarında Randevuya Gelmeme (No-Show) Oranını Sıfıra İndirme Yolları",
    excerpt: "Son dakika iptallerini ve haber vermeden gelmeyen müşterileri engellemek için kapora sistemi, SMS onayları ve akıllı bekleme listesi taktikleri.",
    category: "Güzellik & Kuaför",
    author: "randevuformu.com Strateji Ekibi",
    readTime: "7 dk okuma",
    publishDate: "26 Ağustos 2026",
    featuredImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80",
    tags: ["Kuaför Randevu", "Güzellik Merkezi", "Kapora Sistemi", "No-Show Önleme"],
    faqs: [
      {
        question: "Kapora sistemi müşterileri kaçırır mı?",
        answer: "Aksine, ciddiyet sağlar. Küçük bir ön provizyon (örn. 150 TL veya %20) alan salonlarda no-show oranı %28'den %1.5'e düşmektedir."
      }
    ],
    content: `
## Güzellik Salonlarının Görünmeyen Düşmanı: Boş Kalan Koltuklar

Bir kuaför veya estetik kliniğinde rezerve edilip gelinmeyen 2 saatlik bir mikroblading veya renklendirme seansı, o günün tüm kârlılığını yok edebilir.

### No-Show Oranını Düşüren 3 Altın Kural:

1. **Ön Provizyon & Kapora:** Randevu alınırken 200 TL sembolik kapora tahsil edilir. Kalan tutar salonda ödenir.
2. **24 Saat Kuralı:** 24 saat öncesine kadar kesintisiz iptal hakkı verilir; son 24 saatte iptal edilirse kapora hekim/salon güvencesi olarak kalır.
3. **Akıllı Yedek Liste (Smart Waitlist):** Bir müşteri iptal ettiğinde yedek listedeki ilk kişiye anında SMS bildirimi gider ve koltuk 2 dakika içinde yeniden dolar.
    `
  },
  {
    id: "blog-4",
    slug: "psikologlar-icin-online-terapi-ve-takvim-otomasyonu",
    title: "Psikologlar ve Terapistler İçin Otomatik Seans ve Google Meet Entegrasyonu",
    excerpt: "Gizlilik, KVKK ve zaman yönetimi odaklı online psikoterapi randevu otomasyonunun incelikleri.",
    category: "Psikoloji & Terapi",
    author: "randevuformu.com Uzman Masası",
    readTime: "5 dk okuma",
    publishDate: "25 Ağustos 2026",
    featuredImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
    tags: ["Psikolog Randevu", "Online Terapi", "Gizlilik & KVKK", "Seans Yönetimi"],
    faqs: [
      {
        question: "Danışan verileri gizli tutuluyor mu?",
        answer: "Evet, tüm veriler 256-Bit SSL ile şifrelenir ve KVKK standartlarında korunur."
      }
    ],
    content: `
## Terapide Sınırlar ve Profesyonel Takvim Yönetimi

Terapist-danışan ilişkisinde zaman sınırları esastır. randevuformu.com seanslar arasına otomatik **15 dakikalık dinlenme ve not alma tamponu (Buffer Time)** ekleyerek terapistin tükenmişlik yaşamasını engeller.
    `
  },
  {
    id: "blog-5",
    slug: "avukatlar-icin-muvekkil-randevu-ve-danismanlik-ucreti-tahsili",
    title: "Hukuk Bürolarında Müvekkil Randevu Takvimi ve Ön Danışmanlık Ücreti Yönetimi",
    excerpt: "Avukatlar için telefonda saatlerce ücretsiz hukuki bilgi sorma trafiğini sonlandıran online ücretli danışmanlık sistemi.",
    category: "Hukuk & Danışmanlık",
    author: "randevuformu.com Hukuk Masası",
    readTime: "6 dk okuma",
    publishDate: "24 Ağustos 2026",
    featuredImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80",
    tags: ["Avukat Randevu", "Hukuki Danışmanlık", "Online Vekalet", "Ofis Yönetimi"],
    faqs: [
      {
        question: "Müvekkillerden randevu öncesi dosya veya belge yüklemesi isteyebilir miyim?",
        answer: "Evet, form alanlarına dosya ve evrak yükleme alanı eklenebilir."
      }
    ],
    content: `
## Avukatların Zamanı Kıymetlidir: Ön Ödemeli Danışmanlık Modeli

Günde 15-20 telefon alıp saatlerce ücretsiz danışmanlık vermek zorunda kalan avukatlar için online randevu sistemi devrim niteliğindedir. 

Müvekkil randevu alırken baro tarifesine uygun danışmanlık ücretini öder, online veya ofis seçeneğini belirler ve randevu saatinde hazır olur.
    `
  }
];
