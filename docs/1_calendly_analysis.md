# Calendly Sistem Analizi ve Mimari İncelemesi

Bu doküman, Calendly'nin temel sistem mimarisini ve çalışma mantığını detaylandırarak platformumuzda mutlaka yer alması gereken özellikleri listelemektedir.

## 1. Genel Mimari ve Sistem Tasarımı (Architecture Overview)
Calendly, mikroservis/servis odaklı mimari (SOA) kullanarak gerçek zamanlı müsaitlik yönetimi sunar.
*   **Frontend (İstemci Katmanı):** Modern bir SPA (React vb.) ile çalışır. Kullanıcı için Dashboard ve davetliler için sade, sihirbaz tabanlı bir rezervasyon arayüzü sunar.
*   **Backend (Servis Katmanı):**
    *   *Availability/Calendar Sync Service:* En kritik bileşendir. Dış takvimlerden (Google, Outlook) OAuth 2.0 aracılığıyla eşzamanlı "Busy" (Meşgul) verisini çeker ve "Çifte rezervasyonu (double-booking)" engeller.
    *   *Booking/Event Management Engine:* Randevu kurallarını ve tiplerini yönetir.
    *   *Notification & Workflow Engine:* Rezervasyon onayları, hatırlatıcılar ve iptallerde e-posta/SMS gönderimini ve webhook tetiklemelerini üstlenir.
*   **Platformumuzda Eksik Kalmaması Gereken Özellikler:** Güçlü bir "Conflict-check" (çakışma kontrolü) motoru, OAuth 2.0 ile güvenli takvim senkronizasyon altyapısı ve bildirimler için asenkron bir kuyruk (queue) mimarisi.

## 2. Kullanıcı Kayıt Akışı (Onboarding Flow)
Kullanıcının "Time-to-Value" (değer elde etme süresi) metriğini minimize edecek şekilde tasarlanmıştır.
*   **Kayıt ve Doğrulama:** SSO (Google/Microsoft) ile tek tıkla kayıt.
*   **Kritik Kurulum (Takvim Bağlama):** İlk girişte kullanıcıyı anında ana takvimini bağlamaya zorlar. Bu adım atlanmamalıdır, aksi takdirde sistem müsaitliği hesaplayamaz.
*   **İlk Etkinlik Tipi ve Entegrasyon:** Varsayılan olarak 30 dakikalık bir "1:1" etkinlik tipi oluşturulur ve Zoom/Meet gibi video konferans araçlarının bağlanması istenir.
*   **Platformumuzda Eksik Kalmaması Gereken Özellikler:** Kullanıcı sisteme girdiği an takvim bağlantısının ve video konferans (Google Meet vb.) entegrasyonunun tamamlanmasını sağlayan yönlendirici, akıcı bir onboarding sihirbazı ve varsayılan (hazır şablon) etkinlik tipi atanması.

## 3. Randevu Tipleri (Event Types)
Sistem farklı kullanım senaryolarını kapsayan 4 ana randevu tipi sunar:
*   **Birebir (1-on-1):** Standart tek kişi - tek davetli modeli.
*   **Grup (Group):** Bir host'un (düzenleyici) aynı anda birden fazla kişiyle (ör. webinar, eğitim) buluştuğu tiptir. (Maksimum katılımcı sınırı kota mantığıyla çalışır).
*   **Round Robin (Sırayla Atama):** Davetli, bir ekibin takvimine girer. Sistem, "Müsaitliği Maksimize Et" (herhangi bir müsait üyeye atama) veya "Eşit Dağıtım" (yükü dengelemek için sıradakine atama) mantığına göre otomatik atama yapar.
*   **Collective (Ortak):** Davetli, birden fazla ekip üyesiyle aynı anda görüşecekse seçilir. Sistem sadece *tüm* ekip üyelerinin aynı anda müsait olduğu saatleri davetliye gösterir.
*   **Platformumuzda Eksik Kalmaması Gereken Özellikler:** Dinamik host ataması yapabilen Round Robin algoritmaları (Load-balancing vs. Availability) ve birden fazla takvimin kesişim kümesini hesaplayıp (AND logic) tek bir slot halinde sunan Collective toplantı motoru.

## 4. Yönlendirmeler ve Formlar (Routing Forms)
Özellikle satış ekipleri ve yüksek hacimli trafikler için lead kalifikasyonu sağlar.
*   **Mantık:** Ziyaretçi takvimi görmeden önce form doldurur. Formdaki cevaplara göre (ör. "Şirket çalışan sayısı > 500") sistem belirli if/then kurallarını işletir ve ziyaretçiyi doğru takımın/kişinin randevu sayfasına yönlendirir.
*   **CRM Eşleşmesi:** Gelişmiş routing, HubSpot/Salesforce gibi CRM'leri kontrol ederek, formdaki e-posta adresi sistemde varsa doğrudan atanmış hesap yöneticisinin (Account Executive) takvimine yönlendirir.
*   **Platformumuzda Eksik Kalmaması Gereken Özellikler:** "If-This-Then-That" temelli bir kural motoru. Form yanıtlarına göre sayfa gizleme veya sayfa yönlendirme (conditional logic) yeteneği.

## 5. Zaman Dilimi Hesaplamaları (Timezone Handling)
Global zaman senkronizasyonu mükemmel bir şeffaflıkla arka planda çözülür.
*   **Tarayıcı/Cihaz Tespiti:** Sistem, ziyaretçinin IP veya tarayıcı ayarlarından lokal zaman dilimini otomatik algılar. Host'un müsaitliği, anlık olarak ziyaretçinin yerel saatine çevrilerek gösterilir.
*   **UTC Standardı:** Tüm başlangıç/bitiş zamanları (start_time, end_time) veritabanında kesinlikle **UTC (Coordinated Universal Time)** formatında saklanır.
*   **DST (Yaz Saati Uygulaması):** UTC bazlı saklama yapıldığı için yaz/kış saati geçişlerindeki kaymalar otomatik absorbe edilir.
*   **Override (Geçersiz Kılma):** Fiziksel toplantılar için (ör. Paris'teki bir ofiste), host o etkinliğin zaman dilimini "Paris" olarak kilitleyebilir (Locked Timezone), böylece ziyaretçi nerede olursa olsun saati Paris saati olarak görür.
*   **Platformumuzda Eksik Kalmaması Gereken Özellikler:** Veritabanında (DB) mutlak UTC kullanımı, Frontend'de "moment.js/date-fns" veya Intl API ile tarayıcı lokali algılama ve etkinlik ayarlarında "Zaman Dilimini Kilitle" seçeneği.
