// Hyperframes HTML-to-Video / Reels Engine for randevuformu.com
// Generates programmatic 9:16 vertical video templates (1080x1920) for Instagram Reels & TikTok.

export interface ReelScene {
  durationSeconds: number;
  headline: string;
  subheadline: string;
  badgeText: string;
  metricHighlight?: string;
  highlightColor?: string; // Hex or Tailwind color
  callToAction?: string;
}

export interface ReelTemplate {
  id: string;
  title: string;
  targetSector: string;
  scenes: ReelScene[];
}

export const VIRAL_REEL_TEMPLATES: Record<string, ReelTemplate> = {
  barber_growth: {
    id: "barber_growth",
    title: "Berberlerde Ayda 45.000 TL Boş Koltuk Kaybını Önleme",
    targetSector: "Kuaför & Berber",
    scenes: [
      {
        durationSeconds: 3,
        headline: "Günde Sadece 2 Koltuk Boş Kalıyorsa...",
        subheadline: "Ayda en az 45.000 TL kiranızı çöpe atıyorsunuz demektir.",
        badgeText: "⚠️ ESNAFIN GİZLİ ZARARI",
        highlightColor: "#EF4444",
      },
      {
        durationSeconds: 3.5,
        headline: "Müşteriler Gece 23:00'te Randevu Arıyor",
        subheadline: "Dükkan kapalıyken telefon açılmıyor, müşteri yan salona kaçıyor.",
        badgeText: "🌙 %65 GECE KURALI",
        metricHighlight: "%65",
        highlightColor: "#F59E0B",
      },
      {
        durationSeconds: 3.5,
        headline: "Tek Bir Linkle Koltukları 7/24 Doldurun",
        subheadline: "Instagram biyografinize ve Google Haritalar'a randevu formunu koyun.",
        badgeText: "🚀 OTONOM ÇÖZÜM",
        highlightColor: "#10B981",
      },
      {
        durationSeconds: 4,
        headline: "Ücretsiz Randevu Formunuzu 30 Saniyede Açın",
        subheadline: "randevuformu.com ile hemen başlayın, kasanızı rahatlatın.",
        badgeText: "💈 ÜCRETSİZ DENE",
        callToAction: "randevuformu.com",
        highlightColor: "#0062FF",
      },
    ],
  },
  clinic_noshow: {
    id: "clinic_noshow",
    title: "Kliniklerde Randevuya Gelmeme (No-Show) Oranını %90 Azaltma",
    targetSector: "Klinik & Estetik",
    scenes: [
      {
        durationSeconds: 3,
        headline: "Randevusuna Gelmeyen Hasta Hekimin Saatini Çalar",
        subheadline: "O koltuk ve o saat bir daha asla geri gelmez.",
        badgeText: "❌ NO-SHOW PROBLEMİ",
        highlightColor: "#EF4444",
      },
      {
        durationSeconds: 3.5,
        headline: "2 Kademeli WhatsApp Teyidi & Kapora",
        subheadline: "24 saat ve 2 saat kala giden otomatik teyit ile gelmeme oranı sıfırlanır.",
        badgeText: "📲 AKILLI ONAY",
        metricHighlight: "%90 Düşüş",
        highlightColor: "#10B981",
      },
      {
        durationSeconds: 3.5,
        headline: "İptal Masası ile Boşalan Yeri Anında Doldurun",
        subheadline: "Bekleme listesindeki sıradaki hastaya tek tıkla yer teklifi gönderin.",
        badgeText: "⚡ FLASH WAITLIST",
        highlightColor: "#F59E0B",
      },
      {
        durationSeconds: 4,
        headline: "Kliniğinizi Dijitalleştirin",
        subheadline: "randevuformu.com ile hemen ücretsiz başlayın.",
        badgeText: "🏥 KLİNİK YÖNETİMİ",
        callToAction: "randevuformu.com",
        highlightColor: "#0062FF",
      },
    ],
  },
};

/**
 * Generates standalone, full 1080x1920 9:16 animated HTML/CSS presentation
 * ready to be rendered in browser or converted to video via Playwright / ffmpeg.
 */
export function generateReelHtml(templateKey: keyof typeof VIRAL_REEL_TEMPLATES): string {
  const template = VIRAL_REEL_TEMPLATES[templateKey] || VIRAL_REEL_TEMPLATES.barber_growth;
  const totalDuration = template.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.title} | randevuformu.com</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #030712;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }
    .reel-container {
      width: 450px;
      height: 800px;
      max-width: 100vw;
      max-height: 100vh;
      background: radial-gradient(circle at top, #0F2A4A, #050B14);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    /* Brand Header */
    .brand-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 10;
    }
    .logo {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-dot {
      width: 10px;
      height: 10px;
      background: #0062FF;
      border-radius: 50%;
      box-shadow: 0 0 12px #0062FF;
    }
    /* Progress Bar */
    .progress-bar {
      position: absolute;
      top: 12px;
      left: 16px;
      right: 16px;
      height: 3px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #0062FF;
      width: 0%;
      animation: progressAnim ${totalDuration}s linear infinite;
    }
    @keyframes progressAnim {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    /* Dynamic Scene Slide */
    .scene-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      padding: 20px 0;
      animation: pulseScene 3.5s ease-in-out infinite;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
      background: rgba(0, 98, 255, 0.15);
      border: 1px solid #0062FF;
      color: #60A5FA;
    }
    .headline {
      font-size: 32px;
      font-weight: 900;
      line-height: 1.25;
      letter-spacing: -0.8px;
      margin-bottom: 16px;
      background: linear-gradient(180deg, #FFFFFF, #94A3B8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subheadline {
      font-size: 17px;
      color: #CBD5E1;
      line-height: 1.5;
      max-width: 90%;
      margin: 0 auto;
    }
    /* Footer CTA */
    .footer-cta {
      text-align: center;
      z-index: 10;
    }
    .cta-button {
      display: inline-block;
      width: 100%;
      padding: 16px;
      background: #0062FF;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 16px;
      border-radius: 16px;
      text-decoration: none;
      box-shadow: 0 10px 25px -5px rgba(0, 98, 255, 0.5);
    }
  </style>
</head>
<body>
  <div class="reel-container">
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
    <div class="brand-bar">
      <div class="logo">
        <div class="logo-dot"></div>
        <span>randevuformu.com</span>
      </div>
      <span style="font-size: 12px; color: #94A3B8; font-weight: 600;">#BüyümeTaktikleri</span>
    </div>

    <div class="scene-content" id="sceneBox">
      <div class="badge" id="sceneBadge">${template.scenes[0].badgeText}</div>
      <h1 class="headline" id="sceneHeadline">${template.scenes[0].headline}</h1>
      <p class="subheadline" id="sceneSub">${template.scenes[0].subheadline}</p>
    </div>

    <div class="footer-cta">
      <a href="https://randevuformu.com" class="cta-button">Hemen Ücretsiz Başlayın 👉</a>
    </div>
  </div>

  <script>
    const scenes = ${JSON.stringify(template.scenes)};
    let currentIndex = 0;

    function playScenes() {
      const scene = scenes[currentIndex];
      document.getElementById('sceneBadge').innerText = scene.badgeText;
      document.getElementById('sceneHeadline').innerText = scene.headline;
      document.getElementById('sceneSub').innerText = scene.subheadline;

      setTimeout(() => {
        currentIndex = (currentIndex + 1) % scenes.length;
        playScenes();
      }, scene.durationSeconds * 1000);
    }

    playScenes();
  </script>
</body>
</html>`;
}
