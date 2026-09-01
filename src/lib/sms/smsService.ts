/**
 * Çift Taraflı Berber SMS Bildirim Motoru
 * Hem randevu alan müşteriye hem de işletme sahibi Erman Usta'ya (+90 538 480 90 01)
 * anında SMS bildirimi gönderir.
 */

interface BarberSmsNotificationPayload {
  customerName: string;
  customerPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
  barberPhone?: string;
}

export const ERMAN_USTA_PHONE = "905384809001";
export const ERMAN_USTA_DISPLAY_PHONE = "0538 480 90 01";

/**
 * Telefon numarasını uluslararası 905XXXXXXXXX formatına dönüştürür.
 */
export function sanitizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "9" + cleaned;
  } else if (!cleaned.startsWith("90") && cleaned.length === 10) {
    cleaned = "90" + cleaned;
  }
  return cleaned;
}

/**
 * NetGSM XML API üzerinden tekli SMS gönderimi
 */
async function sendViaNetgsm(to: string, message: string): Promise<boolean> {
  const usercode = process.env.NETGSM_USERCODE;
  const password = process.env.NETGSM_PASSWORD;
  const header = process.env.NETGSM_MSGHEADER || "ERMANUSTA";

  if (!usercode || !password) {
    return false;
  }

  try {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <company>Netgsm</company>
    <usercode>${usercode}</usercode>
    <password>${password}</password>
    <type>1:n</type>
    <msgheader>${header}</msgheader>
  </header>
  <body>
    <msg><![CDATA[${message}]]></msg>
    <no>${to}</no>
  </body>
</mainbody>`;

    const res = await fetch("https://api.netgsm.com.tr/sms/send/xml", {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=UTF-8" },
      body: xml,
    });

    const responseText = await res.text();
    console.log(`[NetGSM SMS] Gönderildi (${to}):`, responseText);
    return res.ok;
  } catch (err: any) {
    console.error("[NetGSM SMS] Hata:", err.message);
    return false;
  }
}

/**
 * Çift Taraflı SMS Gönderim Fonksiyonu:
 * 1. Müşteriye teyit SMS'i
 * 2. Erman Usta'ya (+90 538 480 90 01) yeni randevu uyarısı
 */
export async function sendDualBarberBookingSms(
  payload: BarberSmsNotificationPayload
): Promise<{ customerSmsSent: boolean; barberSmsSent: boolean }> {
  const customerGsm = sanitizePhoneNumber(payload.customerPhone);
  const barberGsm = sanitizePhoneNumber(payload.barberPhone || ERMAN_USTA_PHONE);

  // Müşteriye giden sade SMS
  const customerMessage = `Sayin ${payload.customerName}, Erman Usta randevunuz ${payload.appointmentDate} saat ${payload.appointmentTime} icin onaylanmistir. Hizmet: ${payload.serviceName}. Iletisim: ${ERMAN_USTA_DISPLAY_PHONE}. By Erman Salonu.`;

  // Erman Usta'ya giden uyarı SMS'i
  const barberMessage = `Yeni Randevu! ${payload.customerName} (${payload.customerPhone}) - ${payload.appointmentDate} saat ${payload.appointmentTime} icin ${payload.serviceName} randevusu aldi.`;

  console.log("--------------------------------------------------");
  console.log(`📲 [SMS MOTORU] Müşteriye SMS Hazırlandı:`);
  console.log(`Alıcı: ${customerGsm}`);
  console.log(`Mesaj: "${customerMessage}"`);
  console.log("--------------------------------------------------");
  console.log(`📲 [SMS MOTORU] Erman Usta'ya SMS Hazırlandı:`);
  console.log(`Alıcı: ${barberGsm}`);
  console.log(`Mesaj: "${barberMessage}"`);
  console.log("--------------------------------------------------");

  // 1. Müşteriye SMS gönder
  const customerSent = await sendViaNetgsm(customerGsm, customerMessage);

  // 2. Erman Usta'ya SMS gönder
  const barberSent = await sendViaNetgsm(barberGsm, barberMessage);

  return {
    customerSmsSent: customerSent,
    barberSmsSent: barberSent,
  };
}
