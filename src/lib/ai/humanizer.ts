// Humanizer AI Engine for randevuformu.com
// Eliminates robotic LLM footprints, bypasses Google HCU AI penalties,
// and ensures natural Turkish conversational cadence and business realism.

export interface HumanizerOptions {
  context?: "blog" | "chat" | "marketing";
  authorRole?: string;
  tone?: "warm_artisan" | "expert_consultant" | "direct_friendly";
}

// Robotic and cliché phrases to ban / replace
const ROBOTIC_CLICHES: Array<{ pattern: RegExp; replacement: string | ((m: string) => string) }> = [
  // Açılış Klişeleri
  { pattern: /dijitalleşen dünyada,?\s*/gi, replacement: "günümüzde " },
  { pattern: /hızla dijitalleşen çağımızda,?\s*/gi, replacement: "artık günümüzde " },
  { pattern: /teknolojinin hızla geliştiği günümüzde,?\s*/gi, replacement: "bugün " },
  { pattern: /gelin birlikte (adım adım )?inceleyelim:?/gi, replacement: "şimdi net adımlara bakalım:" },
  { pattern: /gelin,? detaylara birlikte göz atalım:?/gi, replacement: "işin püf noktaları şunlar:" },
  { pattern: /hiç şüphe yok ki,?\s*/gi, replacement: "açıkçası " },
  { pattern: /kuşkusuz( ki)?,?\s*/gi, replacement: "doğrusunu söylemek gerekirse " },

  // Dolgu ve Pasif Cümle Klişeleri
  { pattern: /büyük bir önem taşımaktadır/gi, replacement: "hayati derecede önemlidir" },
  { pattern: /büyük önem arz etmektedir/gi, replacement: "işletmenin can damarıdır" },
  { pattern: /kritik bir rol oynamaktadır/gi, replacement: "doğrudan ciroya yansır" },
  { pattern: /önemle belirtmek gerekir ki,?\s*/gi, replacement: "özellikle dikkat edin: " },
  { pattern: /unutulmamalıdır ki,?\s*/gi, replacement: "şunu unutmayın: " },
  { pattern: /adeta bir/gi, replacement: "gerçek bir" },
  { pattern: /vazgeçilmez bir parçası haline gelmiştir/gi, replacement: "artık olmazsa olmaz bir standarttır" },
  { pattern: /devrim niteliğinde/gi, replacement: "kökten dönüştüren" },

  // Kapanış Klişeleri
  { pattern: /sonuç olarak\s+(ve\s+)?özetlemek gerekirse,?\s*/gi, replacement: "özetle: " },
  { pattern: /sonuç olarak,?\s*/gi, replacement: "özetle: " },
  { pattern: /özetlemek gerekirse,?\s*/gi, replacement: "kısacası: " },
  { pattern: /netice itibariyle,?\s*/gi, replacement: "toparlayacak olursak: " },
  { pattern: /başarıya ulaşmak için/gi, replacement: "ciroyu ve sadakati katlamak için" },
];

// Esnaf & Klinik Doğal Jargon Sözlüğü
const INDUSTRY_VOICE_MAP: Record<string, string[]> = {
  "Diş Hekimliği": [
    "Koltuk boş kaldı mı hekimin o saatlik mesaisi telafi edilemez.",
    "Hasta kapıdan girdiğinde bekletilmekten hoşlanmaz; hekim de randevusuna gelmeyen hastadan.",
    "WhatsApp'tan gelen 'Hocam yarın 14:00 uygun mu?' mesajlarına yetişmek poliklinik sekreterinin tüm gününü kilitler.",
  ],
  "Güzellik & Kuaför": [
    "Cumartesi günü öğlen dükkanda çalan telefona bakarken müşterinin fönünü yakamazsınız.",
    "Boş kalan koltuk esnafın cebinden her ay binlerce lira kira götürür.",
    "Müşteri cuma akşamı saat 23:00'te randevu almak ister; dükkan kapalıyken randevu kabul edemiyorsanız müşteri komşu salona kayar.",
  ],
  "Beslenme & Diyet": [
    "Danışanla haftalık seans saatini ayarlamak için karşılıklı 15 mesaj yazışmak tam bir zaman israfıdır.",
    "Kredi kartıyla seans bedeli peşin alınmadığında son dakika iptalleri danışmanın gününü böler.",
  ],
  "Veteriner Hekimlik": [
    "Kedi ve köpek sahipleri aşı gününü unutur; veteriner klinikleri de bu yüzden yıllık aşı gelirlerinin neredeyse yarısını kaybeder.",
    "Zamanında yapılan tek bir WhatsApp aşı uyarısı hem can dostumuzun sağlığını korur hem kliniğin düzenli hastasını tutar.",
  ],
};

/**
 * Humanizes any AI generated Turkish text by eliminating robotic tropes,
 * smoothing sentence transitions, and injecting direct natural business cadence.
 */
export function humanizeText(text: string, options: HumanizerOptions = {}): string {
  if (!text || typeof text !== "string") return "";

  let cleaned = text;

  // 1. Remove robotic clichés & passive academic filler
  for (const { pattern, replacement } of ROBOTIC_CLICHES) {
    if (typeof replacement === "string") {
      cleaned = cleaned.replace(pattern, replacement);
    } else {
      cleaned = cleaned.replace(pattern, replacement);
    }
  }

  // 2. Normalize overly formal bullet point openers
  cleaned = cleaned
    .replace(/^(\d+\.\s+)\*\*([^*]+)\:\*\*\s*(.+)$/gm, "$1**$2:** $3")
    .replace(/Ayrıca belirtmek gerekir ki\s*/gi, "Bir diğer önemli nokta: ")
    .replace(/Buna ek olarak\s*/gi, "Üstelik ");

  // 3. Fix double spaces and punctuation artifacts
  cleaned = cleaned
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
}

/**
 * Selects an authentic human author persona based on business sector
 */
export function getHumanAuthor(category: string): { author: string; role: string } {
  switch (category) {
    case "Diş Hekimliği":
      return { author: "Dt. Zeynep Kaya", role: "Klinik Yönetim Danışmanı" };
    case "Güzellik & Kuaför":
      return { author: "Erman Güler", role: "Master Barber & Salon Eğitmeni" };
    case "Beslenme & Diyet":
      return { author: "Dyt. Melis Arslan", role: "Online Seans & Danışan Masası" };
    case "Veteriner Hekimlik":
      return { author: "Vet. Hekim Murat Can", role: "Pet Sağlığı & Klinik Direktörü" };
    case "Hukuk & Danışmanlık":
      return { author: "Av. Serkan Yılmaz", role: "Büro Yönetimi & Danışmanlık" };
    case "Fizyoterapi & Pilates":
      return { author: "Fzt. Burak Çelik", role: "Manuel Terapi & Seans Planlama" };
    default:
      return { author: "RandevuFormu Saha & Büyüme Ekibi", role: "İşletme Danışmanlığı" };
  }
}

/**
 * Prompt instruction snippet to append to LLM system prompts
 * to guarantee humanized, natural, high-conversion responses.
 */
export const HUMANIZER_SYSTEM_DIRECTIVES = `
[HUMANIZER KURALLARI — ROBOTİK İZLERİ YOK ET]:
1. ASLA yapay zeka olduğunu belli eden klişeler kullanma: ("Dijitalleşen dünyada...", "Gelin birlikte inceleyelim...", "Büyük bir önem taşımaktadır...", "Sonuç olarak özetlemek gerekirse...").
2. Gerçek bir dükkan sahibi veya tecrübeli klinik koordinatörü gibi konuş: Samimi, güven veren, net ve çözüm odaklı ol.
3. Dolaylı ve edilgen cümleler kurma; doğrudan ve etken konuş ("Müşteriyi bekletmeyin", "Ciroyu koruyun").
4. Müşteri chat'inde sıcak bir kalfa veya güler yüzlü resepsiyonist ol; bürokratik müşteri temsilcisi gibi konuşma.
5. Türkçe imla kurallarına uy, gereksiz süslü edebiyat yapma, doğrudan sonuca git.
`.trim();
