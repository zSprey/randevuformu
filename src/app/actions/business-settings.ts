'use server'

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Zod ile Türkçe hata mesajlı veri doğrulama
const WhatsappSettingsSchema = z.object({
  businessId: z.string().min(1, "İşletme ID zorunludur."),
  whatsappNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Geçerli bir telefon numarası giriniz. (Örn: +905551234567)").optional().nullable(),
  isWhatsappActive: z.boolean(),
  whatsappDefaultMessage: z.string().max(250, "Varsayılan mesaj 250 karakteri geçemez.").optional().nullable(),
});

export async function updateBusinessWhatsapp(formData: FormData) {
  try {
    const rawData = {
      businessId: formData.get('businessId'),
      whatsappNumber: formData.get('whatsappNumber'),
      isWhatsappActive: formData.get('isWhatsappActive') === 'true',
      whatsappDefaultMessage: formData.get('whatsappDefaultMessage'),
    };

    // 1. Validasyon
    const parsedData = WhatsappSettingsSchema.parse(rawData);

    // 2. Veritabanı Güncellemesi (Prisma)
    await prisma.business.update({
      where: { id: parsedData.businessId },
      data: {
        whatsappNumber: parsedData.whatsappNumber,
        isWhatsappActive: parsedData.isWhatsappActive,
        whatsappDefaultMessage: parsedData.whatsappDefaultMessage,
      },
    });

    // 3. Cache Temizliği (Güncel numaranın anında formda görünmesi için)
    revalidatePath('/panel/ayarlar');
    revalidatePath('/kesfet/[sehir]/[ilce]/[sektor]/[slug]', 'page');

    return { success: true, message: "WhatsApp iletişim ayarları başarıyla güncellendi." };

  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstMsg = error.issues?.[0]?.message || (error as { errors?: { message: string }[] }).errors?.[0]?.message;
      return { success: false, message: firstMsg || "Geçersiz form verisi." };
    }
    console.error("WhatsApp Settings Update Error:", error);
    return { success: false, message: "Sistemsel bir hata oluştu, lütfen tekrar deneyin." };
  }
}
