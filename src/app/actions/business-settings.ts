'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// 1. WhatsApp İletişim Hattı Ayarları Doğrulama Şeması
const WhatsappSettingsSchema = z.object({
  businessId: z.string().min(1, 'İşletme ID zorunludur.'),
  whatsappNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Geçerli bir telefon numarası giriniz. (Örn: +905551234567)').optional().nullable(),
  isWhatsappActive: z.boolean(),
  whatsappDefaultMessage: z.string().max(250, 'Varsayılan mesaj 250 karakteri geçemez.').optional().nullable(),
});

// 2. Dinamik İndirim & Yield Management Şeması (Modül 3)
const YieldSettingsSchema = z.object({
  businessId: z.string().min(1, 'İşletme ID zorunludur.'),
  isDynamicDiscountActive: z.boolean(),
  dynamicDiscountPercent: z.number().min(5, 'İndirim en az %5 olmalıdır.').max(50, 'İndirim en fazla %50 olabilir.'),
  discountThresholdHours: z.number().min(1, 'Eşik en az 1 saat olmalıdır.').max(48, 'Eşik en fazla 48 saat olabilir.'),
});

/**
 * İşletme WhatsApp Hattı Bilgilerini Güncelle
 */
export async function updateBusinessWhatsapp(formData: FormData) {
  try {
    const rawData = {
      businessId: formData.get('businessId'),
      whatsappNumber: formData.get('whatsappNumber'),
      isWhatsappActive: formData.get('isWhatsappActive') === 'true',
      whatsappDefaultMessage: formData.get('whatsappDefaultMessage'),
    };

    const parsedData = WhatsappSettingsSchema.parse(rawData);

    await prisma.business.update({
      where: { id: parsedData.businessId },
      data: {
        whatsappNumber: parsedData.whatsappNumber ? parsedData.whatsappNumber.replace(/[^0-9+]/g, '') : null,
        isWhatsappActive: parsedData.isWhatsappActive,
        whatsappDefaultMessage: parsedData.whatsappDefaultMessage,
      },
    });

    revalidatePath('/settings');
    revalidatePath('/panel');

    return { success: true, message: 'WhatsApp iletişim ayarları başarıyla kaydedildi.' };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstMsg = error.issues?.[0]?.message || (error as any).errors?.[0]?.message;
      return { success: false, message: firstMsg || 'Geçersiz form verisi.' };
    }
    console.error('WhatsApp Settings Update Error:', error);
    return { success: false, message: 'Sistemsel bir hata oluştu, lütfen tekrar deneyin.' };
  }
}

/**
 * Modül 3: Dinamik İndirim & Günün Boş Saatleri Ayarları
 */
export async function updateYieldManagementSettings(formData: FormData) {
  try {
    const rawData = {
      businessId: formData.get('businessId'),
      isDynamicDiscountActive: formData.get('isDynamicDiscountActive') === 'true',
      dynamicDiscountPercent: Number(formData.get('dynamicDiscountPercent') || 15),
      discountThresholdHours: Number(formData.get('discountThresholdHours') || 4),
    };

    const parsedData = YieldSettingsSchema.parse(rawData);

    await prisma.business.update({
      where: { id: parsedData.businessId },
      data: {
        isDynamicDiscountActive: parsedData.isDynamicDiscountActive,
        dynamicDiscountPercent: parsedData.dynamicDiscountPercent,
        discountThresholdHours: parsedData.discountThresholdHours,
      },
    });

    revalidatePath('/settings');
    revalidatePath('/panel');

    return { success: true, message: 'Günün Boş Saatleri indirim motoru başarıyla güncellendi.' };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstMsg = error.issues?.[0]?.message || (error as any).errors?.[0]?.message;
      return { success: false, message: firstMsg || 'Geçersiz ayar parametreleri.' };
    }
    console.error('Yield Settings Update Error:', error);
    return { success: false, message: 'İndirim ayarları kaydedilirken bir hata oluştu.' };
  }
}
