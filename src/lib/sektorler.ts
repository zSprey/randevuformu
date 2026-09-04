export interface SektorServiceItem {
  id: string;
  name: string;
  duration_minutes: number;
  price?: number;
  price_text?: string;
  description?: string;
}

export interface SektorConfig {
  slug: string;
  title: string;
  badge: string;
  heroHeadline: string;
  heroSub: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  schemaType: string;
  stats: { label: string; value: string }[];
  painPoints: { problem: string; solution: string }[];
  features: { title: string; desc: string; icon: string }[];
  faqs: { question: string; answer: string }[];
  exampleSlug: string;
  exampleName: string;
  category: string;
  services?: SektorServiceItem[];
}

export const SEKTOR_DATA: Record<string, SektorConfig> = {
  "diyetisyen": {
    slug: "diyetisyen",
    title: "Diyetisyenler & Beslenme Uzmanları İçin Online Danışan Randevu Sistemi",
    badge: "🥗 Beslenme & Diyet Danışmanlığı",
    heroHeadline: "Danışan Takibini Kolaylaştırın, Seans Kaçırmalarını Sıfırlayın.",
    heroSub: "Yüz yüze ve online diyet görüşmelerini tek takvimde toplayın. WhatsApp bildirimleri, boy-kilo anamnez formu ve ön ödeme entegrasyonuyla danışan deneyimini zirveye taşıyın.",
    metaTitle: "Diyetisyen Randevu Programı & Danışan Takip Yazılımı | randevuformu.com",
    metaDescription: "Diyetisyenler için WhatsApp onaylı online randevu ve danışan anamnez formu sistemi. Randevu no-show oranlarını düşürün, 7/24 randevu alın.",
    keywords: ["diyetisyen randevu programı", "online diyetisyen takvimi", "beslenme uzmanı randevu formu", "diyet danışan takip"],
    schemaType: "MedicalBusiness",
    stats: [
      { label: "No-Show Düşüşü", value: "%88" },
      { label: "Haftalık Zaman Tasarrufu", value: "10+ Saat" },
      { label: "Online Seans Artışı", value: "%45" }
    ],
    painPoints: [
      { problem: "WhatsApp üzerinden saatlerce seans saati ayarlamaya çalışmak", solution: "Danışan linke tıklar, boş saatleri görüp 15 saniyede rezervasyonunu yapar." },
      { problem: "Görüşmeye gelmeyen veya son dakika iptal eden danışanlar", solution: "24 saat ve 2 saat önce giden otomatik WhatsApp hatırlatmalarıyla no-show sıfırlanır." },
      { problem: "İlk görüşme öncesi anamnez toplamada zaman kaybı", solution: "Randevu anında doldurulan kişiselleştirilmiş ön soru formuyla seansa hazır başlayın." }
    ],
    features: [
      { title: "Dinamik Danışan Anamnez Formu", desc: "Hedef kilo, alerjenler ve tahlil dosyalarını randevu anında teslim alın.", icon: "ClipboardList" },
      { title: "Online Zoom / Meet Entegrasyonu", desc: "Online görüşmeler için benzersiz toplantı linki otomatik oluşturulur.", icon: "Video" },
      { title: "Paket Seans & Kontrol Takibi", desc: "4'lü ve 8'li seans paketlerini danışan kartında takip edin.", icon: "Layers" }
    ],
    faqs: [
      { question: "Online diyet danışanlarım için toplantı linki nasıl iletiliyor?", answer: "Danışanınız randevusunu onayladığı an sistem otomatik olarak Google Meet veya Zoom bağlantısını oluşturup WhatsApp ve SMS yoluyla danışana iletir." },
      { question: "Danışanlarımdan randevu anında boy/kilo ve tahlil isteyebilir miyim?", answer: "Evet, özel form alanları sayesinde randevu adımlarına tahlil yükleme ve beslenme anamnez soruları ekleyebilirsiniz." }
    ],
    exampleSlug: "dyt-ayse",
    exampleName: "Uzm. Dyt. Ayşe Kaya Beslenme Kliniği",
    category: "Beslenme & Sağlık",
    services: [
      {
        id: "dyt-1",
        name: "İlk Danışmanlık & Beslenme Anamnezi",
        duration_minutes: 45,
        price: 1200,
        price_text: "₺1.200",
        description: "Vücut kompozisyon analizi, beslenme alışkanlıkları ve kişiye özel beslenme planı oluşturma."
      },
      {
        id: "dyt-2",
        name: "Haftalık Kontrol & Kilo Takip Seansı",
        duration_minutes: 30,
        price: 750,
        price_text: "₺750",
        description: "Haftalık kilo ve yağ ölçümü, diyet listesi revizyonu ve motivasyon görüşmesi."
      },
      {
        id: "dyt-3",
        name: "Online Diyet & Görüntülü Görüşme",
        duration_minutes: 30,
        price: 900,
        price_text: "₺900",
        description: "Google Meet üzerinden görüntülü seans ve dijital diyet takibi."
      },
      {
        id: "dyt-4",
        name: "Sporcu Beslenmesi & Performans Seansı",
        duration_minutes: 45,
        description: "Antrenman programına göre makro/mikro besin ve takviye planlaması."
      }
    ]
  },
  "veteriner": {
    slug: "veteriner",
    title: "Veteriner Klinikleri İçin Akıllı Aşı ve Muayene Randevu Sistemi",
    badge: "🐾 Veteriner & Pet Sağlığı Çözümü",
    heroHeadline: "Pati Dostlarımızın Sağlık Takvimini Kolayca Yönetin.",
    heroSub: "Aşı periyotları, rutin muayene ve cerrahi operasyon randevularını 7/24 online kabul edin. Pet sahiplerine otomatik WhatsApp aşı hatırlatmaları gönderin.",
    metaTitle: "Veteriner Randevu Sistemi & Pet Aşı Takip Programı | randevuformu.com",
    metaDescription: "Veteriner klinikleri için online aşı ve muayene randevu yazılımı. Telefon trafiğini azaltın, pet sahiplerine WhatsApp hatırlatma mesajı gönderin.",
    keywords: ["veteriner randevu sistemi", "veteriner klinik otomasyonu", "pet aşı takip sistemi", "hayvan hastanesi randevu"],
    schemaType: "VeterinaryCare",
    stats: [
      { label: "Aşı Tekrarı Oranı", value: "+%65" },
      { label: "Telefon Çağrısı Azalması", value: "%75" },
      { label: "Müşteri Memnuniyeti", value: "4.9/5" }
    ],
    painPoints: [
      { problem: "Acil vakalarda çalan telefonlar nedeniyle muayenelerin bölünmesi", solution: "Rutin aşı ve kontrol randevuları web üzerinden otomatik oluşturulur, telefonlar susar." },
      { problem: "Pet sahiplerinin aşı takvimini unutması ve aksatması", solution: "Günü gelen karma, kuduz ve iç-dış parazit aşıları için otomatik WhatsApp hatırlatması iletilir." }
    ],
    features: [
      { title: "Pet Kimlik & Tür Bilgisi Kaydı", desc: "Pet sahibi randevu alırken kedi/köpek cinsi, yaşı ve aşı karnesi notlarını sisteme girer.", icon: "PawPrint" },
      { title: "Otomatik Aşı Hatırlatma Takvimi", desc: "Tekrarlayan aşılar için randevu tarihinden önce WhatsApp bildirimi gider.", icon: "BellRing" },
      { title: "Hekim & Muayene Odası Dağılımı", desc: "Birden fazla veteriner hekim ve ameliyathane takvimini çakışmasız yönetin.", icon: "Users2" }
    ],
    faqs: [
      { question: "Pet sahipleri aşı türünü seçerek randevu alabilir mi?", answer: "Evet; genel muayene, aşı, kısırlaştırma ön görüşmesi, diş bakımı gibi hizmetleri süre ve fiyatlarıyla tanımlayabilirsiniz." }
    ],
    exampleSlug: "vet-pati",
    exampleName: "Pati Dostları Veteriner Polikliniği",
    category: "Veterinerlik & Pet",
    services: [
      {
        id: "vet-1",
        name: "Genel Muayene & Sağlık Kontrolü",
        duration_minutes: 30,
        price: 500,
        price_text: "₺500",
        description: "Göz, kulak, diş, kalp ve genel fiziki muayene değerlendirmesi."
      },
      {
        id: "vet-2",
        name: "Karma Aşı & Kuduz Aşısı Uygulaması",
        duration_minutes: 20,
        price: 450,
        price_text: "₺450",
        description: "Aşı karnesi kontrolü ve koruyucu aşı periyodu uygulaması."
      },
      {
        id: "vet-3",
        name: "İç & Dış Parazit Koruma Tedavisi",
        duration_minutes: 15,
        price: 350,
        price_text: "₺350",
        description: "Damlalık veya enjeksiyon yöntemiyle parazit tedavisi."
      },
      {
        id: "vet-4",
        name: "Cerrahi Operasyon & Kısırlaştırma Ön Muayenesi",
        duration_minutes: 30,
        description: "Kan tahlili, anestezi uygunluk testi ve operasyon planlaması."
      }
    ]
  },
  "fizyoterapist": {
    slug: "fizyoterapist",
    title: "Fizyoterapistler & Manuel Terapi Merkezleri İçin Seans Randevu Yazılımı",
    badge: "🦴 Fizyoterapi & Manuel Terapi",
    heroHeadline: "Seans Takvimini Otomatikleştiren, No-Show'u Bitiren Randevu Sistemi.",
    heroSub: "Omurga sağlığı, sporcu rehabilitasyonu ve klinik pilates seanslarınızı profesyonelce yönetin. Danışanlarınıza SMS ve WhatsApp ile otomatik seans hatırlatmaları gönderin.",
    metaTitle: "Fizyoterapist Randevu Programı & Seans Takip Sistemi | randevuformu.com",
    metaDescription: "Fizyoterapistler ve manuel terapi merkezleri için seans ve randevu yönetim sistemi. No-show'u bitirin, seans kapasitenizi %40 artırın.",
    keywords: ["fizyoterapist randevu programı", "manuel terapi randevu", "fizik tedavi seans takip", "klinik pilates randevu"],
    schemaType: "MedicalClinic",
    stats: [
      { label: "Kapasite Kullanımı", value: "%94" },
      { label: "No-Show Azalması", value: "%82" },
      { label: "Yeni Danışan Kazanımı", value: "+%50" }
    ],
    painPoints: [
      { problem: "1 saatlik blok seanslara gelmeyen danışanların yarattığı ciro kaybı", solution: "Otomatik onay ve kapora seçeneği ile masa asla boş kalmaz." },
      { problem: "Seans aralarındaki hijyen paylarının çakışması", solution: "Her işlem arasına otomatik tampon süre (Buffer Time - 15 dk) eklenir." }
    ],
    features: [
      { title: "Akıllı Seans & Tampon Süre Yönetimi", desc: "Seanslar arasına otomatik dezenfeksiyon ve hazırlık süresi tanımlayın.", icon: "Clock" },
      { title: "Medikal Dosya & Şikayet Formu", desc: "Ağrı bölgesi ve ameliyat geçmişini randevu öncesi eksiksiz toplayın.", icon: "FileText" }
    ],
    faqs: [
      { question: "Seanslar arasına hazırlık süresi koyabilir miyim?", answer: "Evet, seans süreniz 45 dakika ise sistem otomatik 15 dakika tampon süre ekleyerek bir sonraki randevuyu 1 saat sonrasına açar." }
    ],
    exampleSlug: "fzt-emre",
    exampleName: "Fzt. Emre Demir Manuel Terapi Merkezi",
    category: "Fizyoterapi & Rehabilitasyon",
    services: [
      {
        id: "fzt-1",
        name: "Manuel Terapi & Omurga Değerlendirmesi",
        duration_minutes: 50,
        price: 1500,
        price_text: "₺1.500",
        description: "Bel, boyun ve postür analizi eşliğinde birebir manuel terapi seansı."
      },
      {
        id: "fzt-2",
        name: "Klinik Pilates & Postür Egzersizi",
        duration_minutes: 45,
        price: 1000,
        price_text: "₺1.000",
        description: "Reformer üzerinde kişiye özel omurga güçlendirme çalışması."
      },
      {
        id: "fzt-3",
        name: "Kuru İğneleme & Tetik Nokta Masajı",
        duration_minutes: 30,
        price: 850,
        price_text: "₺850",
        description: "Kas spazmları ve kulunç tedavisi için hedef odaklı uygulama."
      },
      {
        id: "fzt-4",
        name: "Sporcu Rehabilitasyonu & Sakatlık Kontrolü",
        duration_minutes: 60,
        description: "Kas-eklem kuvvet testleri ve sahaya dönüş protokolü."
      }
    ]
  },
  "avukat": {
    slug: "avukat",
    title: "Avukatlar & Hukuk Büroları İçin Güvenli Müvekkil Danışmanlık Randevu Sistemi",
    badge: "⚖️ Hukuk Bürosu & Hukuki Danışmanlık",
    heroHeadline: "Müvekkil Görüşmelerini ve Danışmanlıkları Prestijle Yönetin.",
    heroSub: "Telefon trafiğini kesin. Müvekkilleriniz online danışmanlık ücretini ödeyerek ofis veya online video görüşme randevusunu saniyeler içinde oluştursun.",
    metaTitle: "Avukat Randevu Sistemi & Hukuk Bürosu Danışmanlık Takvimi | randevuformu.com",
    metaDescription: "Avukatlar ve hukuk büroları için online müvekkil randevu ve danışmanlık ücreti tahsilat sistemi. Prestijli ve KVKK uyumlu randevu altyapısı.",
    keywords: ["avukat randevu sistemi", "hukuk bürosu randevu programı", "müvekkil danışmanlık takvimi"],
    schemaType: "LegalService",
    stats: [
      { label: "Gereksiz Arama Düşüşü", value: "%80" },
      { label: "Önceden Tahsilat Oranı", value: "%100" },
      { label: "Prestij Puanı", value: "5.0/5" }
    ],
    painPoints: [
      { problem: "Telefonda saatlerce süren ve ücretlendirilemeyen danışma talepleri", solution: "Müvekkilleri doğrudan ücretli online/ofis randevu linkinize yönlendirin." },
      { problem: "Duruşma günleri ile çakışan ofis ziyaretleri", solution: "Duruşma günlerini takvimde kapatın; sadece boş olduğunuz saatler randevuya açılsın." }
    ],
    features: [
      { title: "Danışmanlık Ücreti Ön Tahsilatı", desc: "Randevu tamamlanmadan önce danışmanlık bedelini online tahsil edin.", icon: "CreditCard" },
      { title: "Duruşma / Adliye Takvim Blokajı", desc: "Belirli gün ve saatleri tek tıkla randevuya kapatın.", icon: "CalendarOff" }
    ],
    faqs: [
      { question: "Müvekkil randevu alırken danışmanlık ücretini ödemek zorunda mı?", answer: "İsteğinize bağlıdır. İster ücretsiz ön görüşme açabilir, isterseniz kredi kartı ödemesi zorunlu tutabilirsiniz." }
    ],
    exampleSlug: "av-yilmaz",
    exampleName: "Yılmaz & Ortakları Hukuk Bürosu",
    category: "Hukuk & Danışmanlık",
    services: [
      {
        id: "av-1",
        name: "Hukuki Danışmanlık (Ofis Randevusu)",
        duration_minutes: 45,
        price: 2500,
        price_text: "₺2.500",
        description: "Yüz yüze hukuki durum analizi, dava süreci ve strateji bilgilendirmesi."
      },
      {
        id: "av-2",
        name: "Online Hukuki Danışmanlık (Zoom / Meet)",
        duration_minutes: 30,
        price: 1800,
        price_text: "₺1.800",
        description: "Görüntülü toplantı ile mevzuat ve hak analizi değerlendirmesi."
      },
      {
        id: "av-3",
        name: "Sözleşme İnceleme & Hukuki Mütalaa",
        duration_minutes: 60,
        description: "Gayrimenkul, ticari veya iş sözleşmelerinin detaylı incelenmesi ve raporlanması."
      }
    ]
  },
  "guzellik-merkezi": {
    slug: "guzellik-merkezi",
    title: "Güzellik Merkezleri & Estetik Klinikleri İçin Cihaz ve Seans Takip Randevu Yazılımı",
    badge: "✨ Güzellik & Medikal Estetik",
    heroHeadline: "Lazer Epilasyon ve Cilt Bakımında Sıfır Çakışma.",
    heroSub: "Cihaz, oda ve uzman kapasitesini kusursuz eşleştirin. Instagram DM'lerinden gelen müşterileri tek linkle randevuya bağlayın, no-showları unutun.",
    metaTitle: "Güzellik Merkezi Randevu Yazılımı & Lazer Seans Takip | randevuformu.com",
    metaDescription: "Güzellik salonları ve estetik klinikleri için online randevu, cihaz/oda yönetimi ve WhatsApp hatırlatma sistemi.",
    keywords: ["güzellik merkezi randevu yazılımı", "lazer epilasyon randevu programı", "cilt bakımı rezervasyon"],
    schemaType: "BeautySalon",
    stats: [
      { label: "Cihaz Doluluk Oranı", value: "%96" },
      { label: "Instagram'dan Randevuya Dönüşüm", value: "3.5x" },
      { label: "Kapora ile Gelmeyen Müşteri", value: "%0" }
    ],
    painPoints: [
      { problem: "Aynı lazer cihazına aynı saate iki müşteriye randevu verilmesi", solution: "Cihaz bazlı randevu kilidi ile çift rezervasyon riski teknik olarak imkansız hale gelir." }
    ],
    features: [
      { title: "Cihaz & Kabin Bazlı Slot Yönetimi", desc: "Lazer ve cilt bakım cihazlarınıza ayrı çalışma takvimi atayın.", icon: "Sparkles" },
      { title: "Ön Kapora ile Randevu Sabitleme", desc: "Randevu esnasında kapora alarak son dakika iptallerinin önüne geçin.", icon: "BadgePercent" }
    ],
    faqs: [
      { question: "Cihaz çakışmalarını nasıl engelliyor?", answer: "Bir cihaz rezerve edildiğinde, aynı cihazı gerektiren başka bir işlem o saate randevu veremez." }
    ],
    exampleSlug: "estetik-aura",
    exampleName: "Aura Medikal Estetik & Güzellik",
    category: "Güzellik & Bakım",
    services: [
      {
        id: "est-1",
        name: "Lazer Epilasyon (Tüm Vücut Seansı)",
        duration_minutes: 60,
        price: 2000,
        price_text: "₺2.000",
        description: "Buz başlıklı acısız diyot lazer epilasyon seansı."
      },
      {
        id: "est-2",
        name: "Medikal Cilt Bakımı & Hydrafacial",
        duration_minutes: 60,
        price: 1200,
        price_text: "₺1.200",
        description: "Derin gözenek temizliği, siyah nokta arındırma ve serum infüzyonu."
      },
      {
        id: "est-3",
        name: "Bölgesel İncelme & G5 Masajı",
        duration_minutes: 40,
        price: 800,
        price_text: "₺800",
        description: "Selülit giderme ve sıkılaşma seansı."
      },
      {
        id: "est-4",
        name: "Kalıcı Makyaj & Microblading Ön Görüşmesi",
        duration_minutes: 30,
        description: "Kişiye özel altın oran kaş çizimi ve renk testi."
      }
    ]
  },
  "kisisel-antrenor": {
    slug: "kisisel-antrenor",
    title: "Personal Trainer & Fitness Koçları İçin Özel Ders Seans Randevu Takvimi",
    badge: "🏋️ Personal Training & Fitness",
    heroHeadline: "Birebir Ders Seanslarınızı Kolayca Yönetin.",
    heroSub: "Öğrencileriniz haftalık ders saatlerini kendileri seçsin, iptal ve ertelemeler WhatsApp ile anında bildirilsin.",
    metaTitle: "Personal Trainer Randevu Sistemi & Özel Ders Takip Programı | randevuformu.com",
    metaDescription: "Kişisel antrenörler ve fitness stüdyoları için seans randevu ve paket ders takip yazılımı.",
    keywords: ["personal trainer randevu programı", "fitness özel ders takvimi", "pt randevu sistemi"],
    schemaType: "ExerciseGym",
    stats: [
      { label: "Ders İptal Azalması", value: "%70" },
      { label: "Haftalık PT Seansı", value: "+12 Seans" },
      { label: "Öğrenci Memnuniyeti", value: "%99" }
    ],
    painPoints: [
      { problem: "Antrenman esnasında telefonla ders saati ayarlamak", solution: "Öğrencileriniz haftalık slotlardan uygun saatleri tek dokunuşla seçer." }
    ],
    features: [
      { title: "Birebir & Düet Ders Desteği", desc: "1'e 1 PT veya grup dersleri için kontenjanlı rezervasyon.", icon: "Dumbbell" },
      { title: "Katı İptal / Erteleme Politikası", desc: "Randevu saatine X saat kala iptalleri kapatın.", icon: "AlertTriangle" }
    ],
    faqs: [
      { question: "Öğrencilerimin paketindeki kalan ders sayısını görebilir miyim?", answer: "Evet, öğrencinin kaç ders hakkı kaldığını ve seans geçmişini görebilirsiniz." }
    ],
    exampleSlug: "coach-can",
    exampleName: "Can Yılmaz Performance Lab",
    category: "Spor & Fitness",
    services: [
      {
        id: "pt-1",
        name: "Birebir Personal Training (1'e 1 Seans)",
        duration_minutes: 60,
        price: 1000,
        price_text: "₺1.000",
        description: "Kişiye özel hipertrofi, yağ yakımı veya fonksiyonel antrenman."
      },
      {
        id: "pt-2",
        name: "Postür & Vücut Kompozisyon Analizi",
        duration_minutes: 45,
        price: 600,
        price_text: "₺600",
        description: "FMS hareket taraması, yağ-kas ölçümü ve gelişim haritası."
      },
      {
        id: "pt-3",
        name: "Düet Antrenman (2 Kişilik Özel Seans)",
        duration_minutes: 60,
        price: 1500,
        price_text: "₺1.500",
        description: "Partnerinizle birlikte koç eşliğinde antrenman."
      },
      {
        id: "pt-4",
        name: "Haftalık Beslenme & Makro Takip Konsültasyonu",
        duration_minutes: 30,
        description: "Antrenman yoğunluğuna göre kalori ve takviye planı."
      }
    ]
  },
  "oto-servis": {
    slug: "oto-servis",
    title: "Oto Servis, Ekspertiz & Detailing Merkezleri İçin Araç Kabul Randevu Sistemi",
    badge: "🚗 Oto Servis & Ekspertiz",
    heroHeadline: "Lifleriniz Boş Kalmasın, Araç Kabul Kuyruklarını Sıfırlayın.",
    heroSub: "Periyodik bakım ve ekspertiz işlemlerinde araç sahipleri 7/24 randevu alsın. Plaka ve şasi bilgisiyle randevuyu karşılayın.",
    metaTitle: "Oto Servis Randevu Yazılımı & Ekspertiz Rezervasyon Sistemi | randevuformu.com",
    metaDescription: "Oto tamir servisleri, ekspertiz ve detailing merkezleri için online araç kabul ve randevu programı.",
    keywords: ["oto servis randevu programı", "oto ekspertiz randevu", "araç bakım rezervasyon sistemi"],
    schemaType: "AutoRepair",
    stats: [
      { label: "Lift Verimliliği", value: "+%40" },
      { label: "Sabah Kuyruğu Düşüşü", value: "%90" },
      { label: "Ortalama Sepet Tutarı", value: "+%25" }
    ],
    painPoints: [
      { problem: "Sabah servis kapısında yığılan araçlar", solution: "Araç sahipleri gün içine dağıtılmış randevu saatlerine gelir." }
    ],
    features: [
      { title: "Plaka, Marka & Model Alanı", desc: "Müşteri randevu alırken aracın plakasını ve kilometresini girer.", icon: "Car" },
      { title: "Lift Bazlı Randevu Dağılımı", desc: "Mekanik bakım lifti ve ekspertiz hattına göre bağımsız kapasite.", icon: "Wrench" }
    ],
    faqs: [
      { question: "Müşteriden araç ruhsat/plaka bilgisi isteyebilir miyiz?", answer: "Evet, formda plaka ve arıza şikayeti zorunlu alan yapılabilir." }
    ],
    exampleSlug: "pro-oto",
    exampleName: "ProTech Oto Servis & Ekspertiz",
    category: "Otomotiv & Servis",
    services: [
      {
        id: "oto-1",
        name: "Periyodik Araç Bakımı & Yağ/Filtre Değişimi",
        duration_minutes: 60,
        price: 2500,
        price_text: "₺2.500",
        description: "Motor yağı, hava/polen filtreleri değişimi ve 30 nokta güvenlik kontrolü."
      },
      {
        id: "oto-2",
        name: "Full Ekspertiz & Bilgisayarlı Arıza Tespiti",
        duration_minutes: 45,
        price: 1500,
        price_text: "₺1.500",
        description: "OBD cihazı ile elektronik beyin taraması, kaporta-boya ve fren testi."
      },
      {
        id: "oto-3",
        name: "Fren & Balata Bakımı / Değişimi",
        duration_minutes: 45,
        price: 1200,
        price_text: "₺1.200",
        description: "Ön ve arka fren disk/balata kontrolü ve hidrolik seviye testi."
      },
      {
        id: "oto-4",
        name: "Detaylı İç Temizlik & Pasta Cila Ön Kontrol",
        duration_minutes: 30,
        description: "Boya kalınlığı ölçümü ve seramik kaplama uygunluk analizi."
      }
    ]
  },
  "dovmeci": {
    slug: "dovmeci",
    title: "Dövme & Piercing Stüdyoları İçin Görsel Yüklemeli Tasarım ve Randevu Sistemi",
    badge: "🖋️ Tattoo & Piercing Studio",
    heroHeadline: "Müşterileriniz Referans Görsellerini Yüklesin, Kaporasını Ödesin.",
    heroSub: "Instagram DM'lerinde kaybolan dövme tasarımlarına son. Dövme boyutu, vücut bölgesi ve referans çizimlerle tam donanımlı randevu alın.",
    metaTitle: "Dövme Stüdyosu Randevu Sistemi & Tattoo Rezervasyon Formu | randevuformu.com",
    metaDescription: "Dövmeciler ve piercing stüdyoları için referans görsel yüklemeli, kapora tahsilatlı online randevu programı.",
    keywords: ["dövmeci randevu sistemi", "tattoo studio rezervasyon", "dövme kapora sistemi"],
    schemaType: "TattooParlor",
    stats: [
      { label: "DM Mesaj Yükü Azalması", value: "%85" },
      { label: "Kapora ile Sıfır İptal", value: "%100" },
      { label: "Sanatçı Memnuniyeti", value: "5.0/5" }
    ],
    painPoints: [
      { problem: "Hazırlanan dövme şablonuna rağmen müşterinin seansa gelmemesi", solution: "Zorunlu ön kapora sistemi ile randevusuna sadık müşterilerle çalışın." }
    ],
    features: [
      { title: "Referans Görsel Yükleme", desc: "Müşteriler istedikleri dövme görselini forma yükler.", icon: "Image" },
      { title: "Online Kapora Kilidi", desc: "Kapora ödenmeden takvimde slot ayrılmaz.", icon: "Lock" }
    ],
    faqs: [
      { question: "Müşteriler randevu alırken fotoğraf yükleyebilir mi?", answer: "Evet, formda görsel yükleme alanı bulunur." }
    ],
    exampleSlug: "ink-art",
    exampleName: "Ink & Art Tattoo Studio",
    category: "Sanat & Dövme",
    services: [
      {
        id: "dov-1",
        name: "Minimal Dövme Seansı (5-10 cm)",
        duration_minutes: 60,
        price: 1500,
        price_text: "₺1.500",
        description: "Tek renk ince çizgi (fine-line) minimal dövme uygulaması."
      },
      {
        id: "dov-2",
        name: "Custom Dövme Tasarım & Ön Konsültasyon",
        duration_minutes: 30,
        price: 500,
        price_text: "₺500",
        description: "Bölge seçimi, ölçü belirleme ve özel şablon çizimi."
      },
      {
        id: "dov-3",
        name: "Piercing Uygulaması & Titanyum Takı",
        duration_minutes: 20,
        price: 400,
        price_text: "₺400",
        description: "Steril tek kullanımlık kanül ile kulak, burun veya göbek delimi."
      },
      {
        id: "dov-4",
        name: "Büyük Proje & Kol Kaplama (Full Sleeve) Seansı",
        duration_minutes: 180,
        description: "Çoklu seans gerektiren özel tasarım dövme çalışması."
      }
    ]
  },
  "fotografci": {
    slug: "fotografci",
    title: "Fotoğrafçılar & Dış Çekim Stüdyoları İçin Çekim Rezervasyon Takvimi",
    badge: "📸 Fotoğraf Stüdyosu & Dış Çekim",
    heroHeadline: "Düğün ve Stüdyo Çekimlerinizi Çakışmasız Planlayın.",
    heroSub: "Altın saatler (Golden Hour), stüdyo seansları ve dış çekim lokasyon randevularını tek platformdan yönetin.",
    metaTitle: "Fotoğrafçı Randevu Sistemi & Çekim Rezervasyon Yazılımı | randevuformu.com",
    metaDescription: "Düğün, yenidoğan, ürün ve stüdyo fotoğrafçıları için online çekim randevu ve sözleşme yönetim sistemi.",
    keywords: ["fotoğrafçı randevu takvimi", "düğün dış çekim rezervasyon", "stüdyo fotoğraf randevu"],
    schemaType: "ProfessionalService",
    stats: [
      { label: "Tarih Çakışması", value: "%0" },
      { label: "Sezonluk Rezervasyon Artışı", value: "+%60" },
      { label: "Müşteri Geri Dönüş Hızı", value: "30 Saniye" }
    ],
    painPoints: [
      { problem: "Düğün sezonunda aynı güne iki çifte söz verilmesi", solution: "Tarih ve saat seçimi otomatik kilitlenir; kapora yatan tarih başkasına açılamaz." }
    ],
    features: [
      { title: "Çekim Konsepti Seçimi", desc: "Dış mekan ve stüdyo paketlerini ayrı sürelerle listeleyin.", icon: "Camera" },
      { title: "Sözleşme Onay Kutusu", desc: "Çekim şartnamesi ve telif maddelerini müşteriye onaylatın.", icon: "FileCheck" }
    ],
    faqs: [
      { question: "Farklı çekim paketleri sunabilir miyim?", answer: "Evet, her paket için farklı süre ve fiyat tanımlayabilirsiniz." }
    ],
    exampleSlug: "lens-studio",
    exampleName: "Lens & Frame Fotoğraf Stüdyosu",
    category: "Fotoğraf & Medya",
    services: [
      {
        id: "foto-1",
        name: "Dış Çekim & Düğün/Nişan Fotoğrafçılığı",
        duration_minutes: 120,
        price: 6000,
        price_text: "₺6.000",
        description: "Seçilen dış mekan lokasyonunda 2 saatlik profesyonel çekim ve retouch."
      },
      {
        id: "foto-2",
        name: "Stüdyo Portre & Biyometrik/CV Çekimi",
        duration_minutes: 30,
        price: 1000,
        price_text: "₺1.000",
        description: "LinkedIn, kurumsal web sitesi ve pasaport için profesyonel ışıkta portre."
      },
      {
        id: "foto-3",
        name: "Ürün & Yemek Fotoğrafçılığı (Stüdyo)",
        duration_minutes: 90,
        price: 4500,
        price_text: "₺4.500",
        description: "E-ticaret veya menü için yüksek çözünürlüklü konsept ürün çekimi."
      },
      {
        id: "foto-4",
        name: "Etkinlik & Lansman Fotoğraf/Video Hizmeti",
        duration_minutes: 180,
        description: "Kurumsal etkinlik, kokteyl veya açılış tam gün/yarım gün çekimi."
      }
    ]
  },
  "pedagog": {
    slug: "pedagog",
    title: "Pedagoglar & Çocuk Gelişim Uzmanları İçin Seans Takvimi",
    badge: "🧸 Pedagoji & Çocuk Gelişimi",
    heroHeadline: "Ebeveyn Danışmanlığı ve Oyun Terapisini Güvenle Planlayın.",
    heroSub: "Çocukların yaş grubu ve gelişim öyküsünü randevu öncesi alın. Seans saatlerini düzenleyin.",
    metaTitle: "Pedagog Randevu Sistemi & Çocuk Gelişim Seans Takip | randevuformu.com",
    metaDescription: "Pedagoglar ve çocuk danışmanlık merkezleri için online seans randevu ve ebeveyn ön bilgi formu.",
    keywords: ["pedagog randevu sistemi", "çocuk gelişim uzmanı takvimi", "oyun terapisi randevu"],
    schemaType: "MedicalClinic",
    stats: [
      { label: "Ebeveyn Memnuniyeti", value: "%99" },
      { label: "Seans Aksama Oranı", value: "< %2" },
      { label: "Ön Bilgi Toplama", value: "%100" }
    ],
    painPoints: [
      { problem: "İlk seansın 20 dakikasını geçmiş öyküyü dinlemekle harcamak", solution: "Ebeveyn randevu alırken çocuğun durumunu formda detaylandırır." }
    ],
    features: [
      { title: "Çocuk Yaş & Gelişim Ön Formu", desc: "Şikayetleri seans öncesi teslim alın.", icon: "Smile" },
      { title: "Oyun Odası Planlama", desc: "Terapi odalarını bağımsız yönetin.", icon: "Puzzle" }
    ],
    faqs: [
      { question: "Ebeveynden çocukla ilgili ön bilgi alabilir miyiz?", answer: "Evet, formda doğum tarihi ve danışmanlık konusu zorunlu tutulabilir." }
    ],
    exampleSlug: "pedagog-aylin",
    exampleName: "Uzm. Pedagog Aylin Şen Danışmanlık",
    category: "Pedagoji & Danışmanlık",
    services: [
      {
        id: "ped-1",
        name: "Ebeveyn Danışmanlığı & Gelişim Takibi",
        duration_minutes: 50,
        price: 1600,
        price_text: "₺1.600",
        description: "Davranış problemleri, sınır koyma ve okul uyum süreci görüşmesi."
      },
      {
        id: "ped-2",
        name: "Çocuk Merkezli Oyun Terapisi Seansı",
        duration_minutes: 45,
        price: 1800,
        price_text: "₺1.800",
        description: "Kaygı, öfke ve travma süreçlerinde terapötik oyun seansı."
      },
      {
        id: "ped-3",
        name: "Gelişimsel Tarama & Dikkat Testleri (WISC-R / Moxo)",
        duration_minutes: 60,
        price: 2200,
        price_text: "₺2.200",
        description: "Bilişsel dikkat, odaklanma ve gelişimsel olgunluk değerlendirmesi."
      },
      {
        id: "ped-4",
        name: "Okula Hazırlık & Oryantasyon Değerlendirmesi",
        duration_minutes: 45,
        description: "Anaokulu ve ilkokul 1. sınıf başlangıç uyum kontrolü."
      }
    ]
  },
  "dis-hekimi": {
    slug: "dis-hekimi",
    title: "Diş Hekimleri & Diş Klinikleri İçin Online Randevu Yazılımı",
    badge: "🦷 Diş Sağlığı & Poliklinik Çözümü",
    heroHeadline: "Hastalarınız 7/24 Randevu Alsın, Tedavi Planlarınız Aksamasın.",
    heroSub: "Telefon trafiğini %80 azaltın. İmplant, kanal tedavisi ve ortodonti randevularını SMS ve WhatsApp onaylı yönetin.",
    metaTitle: "Diş Hekimi Randevu Sistemi & Klinik Otomasyonu | randevuformu.com",
    metaDescription: "Diş hekimleri ve poliklinikler için hasta randevu takip yazılımı. 3D tomografi ön bilgi formu, SMS/WhatsApp hatırlatma ve çoklu koltuk yönetimi.",
    keywords: ["diş hekimi randevu sistemi", "diş kliniği otomasyonu", "implant randevu programı", "dişçi randevu yazılımı"],
    schemaType: "Dentist",
    stats: [
      { label: "No-Show Düşüşü", value: "%85" },
      { label: "Telefon Trafiği", value: "-%80" },
      { label: "Yeni Hasta Dönüşümü", value: "+%45" }
    ],
    painPoints: [
      { problem: "Randevuya gelmeyen hastalar nedeniyle boş kalan dişçi koltuğu", solution: "Onaylı WhatsApp hatırlatmaları ile no-show'u bitirin." },
      { problem: "Sekreteryanın sürekli telefonla randevu organize etmeye çalışması", solution: "Hastalar web üzerinden 7/24 saniyeler içinde yer ayırır." }
    ],
    features: [
      { title: "3D Tomografi & Ön Muayene Formu", desc: "Hastalar randevu alırken röntgen dosyalarını iletsin.", icon: "Scan" },
      { title: "Otomatik WhatsApp Hatırlatma", desc: "Randevudan 24 saat ve 2 saat önce giden onay mesajları.", icon: "MessageCircle" }
    ],
    faqs: [
      { question: "Hastalar röntgen dosyası yükleyebilir mi?", answer: "Evet, formdaki dosya yükleme özelliği ile hastalar röntgenlerini iletebilir." }
    ],
    exampleSlug: "dr-ahmet",
    exampleName: "Dr. Ahmet Yılmaz Diş Kliniği",
    category: "Diş Sağlığı & Poliklinik",
    services: [
      {
        id: "dis-1",
        name: "Genel Diş Muayenesi & Teşhis",
        duration_minutes: 30,
        price: 600,
        price_text: "₺600",
        description: "Ağız içi muayene, dijital panoramik röntgen analizi ve tedavi planlaması."
      },
      {
        id: "dis-2",
        name: "Ultrasonik Diş Taşı Temizliği & Polisaj",
        duration_minutes: 30,
        price: 1200,
        price_text: "₺1.200",
        description: "Plak ve tartar temizliği, diş eti sağlığı bakımı ve cila."
      },
      {
        id: "dis-3",
        name: "Estetik Kompozit Dolgu (Tek Diş)",
        duration_minutes: 45,
        price: 1500,
        price_text: "₺1.500",
        description: "Diş renginde estetik nano-kompozit materyal ile dolgu tedavisi."
      },
      {
        id: "dis-4",
        name: "İmplant & Gülüş Tasarımı Konsültasyonu",
        duration_minutes: 30,
        description: "Eksik dişlerin implant planlaması ve 3D tomografi değerlendirmesi."
      }
    ]
  },
  "kuafor": {
    slug: "kuafor",
    title: "Kuaför & Saç Tasarım Salonları İçin Online Rezervasyon Sistemi",
    badge: "✂️ Kuaför & Hair Studio Çözümü",
    heroHeadline: "Kuaför Salonunuz İçin VIP Randevu Deneyimi.",
    heroSub: "Saç kesimi, sombre, keratin bakımı ve tırnak işlemlerinde müşterileriniz istediği uzmandan saniyeler içinde yer ayırsın.",
    metaTitle: "Kuaför Randevu Sistemi & Salon Rezervasyon Yazılımı | randevuformu.com",
    metaDescription: "Kuaförler, berberler ve saç tasarım salonları için online randevu ve uzman takip programı. WhatsApp onaylı, kapora entegrasyonlu.",
    keywords: ["kuaför randevu yazılımı", "berber randevu sistemi", "kuaför sıra takip programı"],
    schemaType: "HairSalon",
    stats: [
      { label: "Cumartesi Sıra Bekleme", value: "%0" },
      { label: "Uzman Doluluğu", value: "%95" },
      { label: "Yeni Müşteri Artışı", value: "+%38" }
    ],
    painPoints: [
      { problem: "Instagram DM'lerinden randevu yakalama karmaşası", solution: "Profil linkinden 7/24 otomatik randevu alın." }
    ],
    features: [
      { title: "Uzman Bazlı Randevu Seçimi", desc: "Müşteriler dilediği stilisti seçerek randevu alsın.", icon: "Scissors" },
      { title: "Hizmet Süresi Netliği", desc: "İşlem süreleri takvimde otomatik kilitlensin.", icon: "Clock" }
    ],
    faqs: [
      { question: "Müşteriler istedikleri kuaförü seçebilir mi?", answer: "Evet, personellerinizi listeleyebilir, müşteri istediği kişiyi seçebilir." }
    ],
    exampleSlug: "studio-nova",
    exampleName: "Studio Nova Kuaför",
    category: "Kuaför & Saç Bakımı",
    services: [
      {
        id: "kfr-1",
        name: "Saç Kesimi & Yıkama & Fön",
        duration_minutes: 35,
        price: 350,
        price_text: "₺350",
        description: "Kişinin yüz tipine uygun stil saç kesimi, saç yıkama ve fön işlemi."
      },
      {
        id: "kfr-2",
        name: "Sakal Tıraşı & Sıcak Havlu Bakımı",
        duration_minutes: 25,
        price: 200,
        price_text: "₺200",
        description: "Geleneksel ustura tıraşı, sakal şekillendirme ve sıcak buhar havlusu."
      },
      {
        id: "kfr-3",
        name: "Saç + Sakal (Komple Tıraş & Bakım)",
        duration_minutes: 60,
        price: 500,
        price_text: "₺500",
        description: "Komple saç kesimi, sakal tıraşı, saç yıkama, fön ve saç şekillendirme."
      },
      {
        id: "kfr-4",
        name: "Keratin Saç Bakımı & Cilt Maskesi",
        duration_minutes: 45,
        price: 400,
        price_text: "₺400",
        description: "Yıpranmış saçlar için besleyici keratin yüklemesi ve siyah nokta maskesi."
      },
      {
        id: "kfr-5",
        name: "Özel Gün & Damat Tıraşı Paketi",
        duration_minutes: 90,
        description: "Özel gün için VIP komple saç-sakal tasarımı, manikür ve cilt bakımı."
      }
    ]
  },
  "psikolog": {
    slug: "psikolog",
    title: "Psikologlar & Terapistler İçin Güvenli Online Seans Takvimi",
    badge: "🧠 Psikoloji & Terapi Danışmanlığı",
    heroHeadline: "Danışanlarınız İçin Gizli, KVKK Uyumlu Seans Yönetimi.",
    heroSub: "Bireysel terapi, çift terapisi ve online seanslarınızı Google Meet / Zoom linkleri ile otomatik senkronize edin.",
    metaTitle: "Psikolog Randevu Programı & Online Seans Takvimi | randevuformu.com",
    metaDescription: "Psikologlar ve aile danışmanları için KVKK uyumlu online randevu ve seans yazılımı. Zoom entegrasyonlu.",
    keywords: ["psikolog randevu programı", "online terapi randevu takvimi", "psikolog seans takip"],
    schemaType: "MedicalClinic",
    stats: [
      { label: "No-Show Oranı", value: "< %3" },
      { label: "Online Seans Payı", value: "%60" },
      { label: "Gizlilik Skoru", value: "KVKK 100%" }
    ],
    painPoints: [
      { problem: "Seans ücreti tahsilatında yaşanan gecikmeler", solution: "Seans öncesi online güvenli ödeme ile para konusunu seans odasının dışında bırakın." }
    ],
    features: [
      { title: "Otomatik Online Toplantı Linki", desc: "Randevu oluştuğu an Zoom/Google Meet bağlantısı oluşturulup iletilir.", icon: "Video" },
      { title: "KVKK Uyumlu Şifreli Altyapı", desc: "Danışan bilgileri banka seviyesinde SSL ile korunur.", icon: "ShieldCheck" }
    ],
    faqs: [
      { question: "Online terapi için toplantı bağlantısı nasıl iletiliyor?", answer: "Randevu tamamlandığında sistem otomatik olarak Google Meet/Zoom linki üretir ve danışana iletir." }
    ],
    exampleSlug: "psk-melis",
    exampleName: "Uzm. Psk. Melis Aktaş",
    category: "Psikoloji & Terapi",
    services: [
      {
        id: "psk-1",
        name: "Bireysel Yetişkin Psikoterapisi",
        duration_minutes: 50,
        price: 1800,
        price_text: "₺1.800",
        description: "Bilişsel Davranışçı Terapi (BDT) ve Şema Terapi odaklı bireysel seans."
      },
      {
        id: "psk-2",
        name: "Çift & Aile Danışmanlığı Seansı",
        duration_minutes: 60,
        price: 2400,
        price_text: "₺2.400",
        description: "İlişki dinamikleri, iletişim çatışmaları ve uzlaşma terapisi."
      },
      {
        id: "psk-3",
        name: "Online Terapi (Zoom / Google Meet)",
        duration_minutes: 50,
        price: 1600,
        price_text: "₺1.600",
        description: "Güvenli ve şifreli görüntülü bağlantı ile uzaktan psikoterapi seansı."
      },
      {
        id: "psk-4",
        name: "EMDR Travma Terapisi Seansı",
        duration_minutes: 60,
        description: "Göz hareketleriyle duyarsızlaştırma ve travma yeniden işleme seansı."
      }
    ]
  },
  "berber": {
    slug: "berber",
    title: "Erkek Kuaförleri & Berberler İçin Koltuk Rezervasyon ve Randevu Sistemi",
    badge: "💈 Berber & Erkek Kuaförü Çözümü",
    heroHeadline: "Dükkan Önü Beklemelerini Bitirin, Koltuğunuz Hep Dolu Olsun.",
    heroSub: "Müşterileriniz saç ve sakal tıraşı için boş saatleri görsün, istediği ustadan saniyeler içinde randevu alsın. WhatsApp hatırlatmasıyla no-show sıfırlansın.",
    metaTitle: "Berber Randevu Sistemi & Erkek Kuaförü Randevu Programı | randevuformu.com",
    metaDescription: "Berberler ve erkek kuaförleri için WhatsApp onaylı online randevu ve koltuk rezervasyon yazılımı. Sıra bekleme karmaşasına son verin, 7/24 randevu kabul edin.",
    keywords: [
      "berber randevu sistemi",
      "berber randevu programı",
      "erkek kuaförü randevu",
      "berber sıra takip sistemi",
      "kuaför randevu programı"
    ],
    schemaType: "HairSalon",
    stats: [
      { label: "Sıra Bekleme Süresi", value: "0 Dk" },
      { label: "Koltuk Verimliliği", value: "%96" },
      { label: "WhatsApp Onay Oranı", value: "%99" }
    ],
    painPoints: [
      { problem: "Cumartesi günleri kapıda biriken ve beklemekten vazgeçen müşteriler", solution: "Müşteriler randevu saatinde gelir, koltuk boş kalmaz, dükkanda yığılma olmaz." },
      { problem: "Tıraş esnasında sürekli çalan telefonlara bakmak zorunda kalmak", solution: "Müşteriler Instagram bio'nuzdan veya linkinizden randevusunu kendisi oluşturur." }
    ],
    features: [
      { title: "Usta & Koltuk Seçimi", desc: "Müşteriler randevu alırken dilediği berberi seçer.", icon: "Scissors" },
      { title: "Otomatik WhatsApp Bildirimi", desc: "Randevu teyidi ve 2 saat önceki hatırlatma otomatik gider.", icon: "MessageCircle" }
    ],
    faqs: [
      { question: "Müşteriler hangi ustanın boş olduğunu görebilir mi?", answer: "Evet, her personelin ayrı takvimi bulunur. Müşteri boş saatleri canlı olarak görür." },
      { question: "Sakal ve saç tıraşı süreleri farklı mı ayarlanır?", answer: "Evet, her hizmete özel işlem süresi tanımlayabilir, aralara dinlenme/hijyen süresi ekleyebilirsiniz." }
    ],
    exampleSlug: "byerman",
    exampleName: "Erman Usta - Erkek Berberi",
    category: "Berber & Erkek Bakımı",
    services: [
      {
        id: "brb-1",
        name: "Saç Kesimi & Yıkama",
        duration_minutes: 30,
        price: 350,
        price_text: "₺350",
        description: "Yüz hatlarına uygun modern saç kesimi ve yıkama."
      },
      {
        id: "brb-2",
        name: "Sakal Tıraşı & Sıcak Havlu Bakımı",
        duration_minutes: 25,
        price: 200,
        price_text: "₺200",
        description: "Geleneksel ustura tıraşı ve buharlı sıcak havlu kompresi."
      },
      {
        id: "brb-3",
        name: "Saç + Sakal (Komple Bakım)",
        duration_minutes: 60,
        price: 500,
        price_text: "₺500",
        description: "Saç kesimi, sakal tıraşı, saç yıkama ve stil şekillendirme."
      }
    ]
  }
};
