'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';

const JoinWaitlistSchema = z.object({
  businessId: z.string().min(1, 'İşletme ID zorunludur.'),
  serviceId: z.string().min(1, 'Hizmet seçimi zorunludur.'),
  customerPhone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Geçerli bir telefon numarası giriniz.'),
  targetDate: z.string().min(10, 'Tarih seçimi zorunludur.'),
  timeRange: z.string().default('Tüm Gün'),
});

/**
 * Modül 4: Akıllı Bekleme Listesine Katıl
 */
export async function joinWaitlist(formData: FormData) {
  try {
    const rawData = {
      businessId: formData.get('businessId'),
      serviceId: formData.get('serviceId'),
      customerPhone: formData.get('customerPhone'),
      targetDate: formData.get('targetDate'),
      timeRange: formData.get('timeRange') || 'Tüm Gün',
    };

    const parsed = JoinWaitlistSchema.parse(rawData);
    const cleanPhone = parsed.customerPhone.replace(/[^0-9]/g, '');

    // Bekleme listesi kaydı oluştur
    const entry = await prisma.waitlistEntry.create({
      data: {
        businessId: parsed.businessId,
        serviceId: parsed.serviceId,
        customerPhone: cleanPhone,
        targetDate: new Date(parsed.targetDate),
        timeRange: parsed.timeRange,
        status: 'WAITING',
      },
    });

    return {
      success: true,
      message: 'Talebiniz alındı! Bu tarihte bir randevu iptal edilirse ilk size SMS ile haber verilecek.',
      entryId: entry.id,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstMsg = error.issues?.[0]?.message || (error as any).errors?.[0]?.message;
      return { success: false, message: firstMsg || 'Geçersiz form verisi.' };
    }
    console.error('Join waitlist error:', error);
    return { success: false, message: 'Bekleme listesine kaydedilirken bir hata oluştu.' };
  }
}

/**
 * Bir randevu iptal edildiğinde sıradaki adaya bildirim tetikle
 */
export async function notifyWaitlistOnCancellation(businessId: string, canceledDate: string) {
  try {
    const targetDateObj = new Date(canceledDate);

    // Bu gün için bekleyen en eski adayı bul
    const candidate = await prisma.waitlistEntry.findFirst({
      where: {
        businessId,
        targetDate: targetDateObj,
        status: 'WAITING',
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        service: true,
      },
    });

    if (!candidate) {
      return { notified: false, message: 'Bekleme listesinde bekleyen aday yok.' };
    }

    // Durumu NOTIFIED olarak güncelle
    await prisma.waitlistEntry.update({
      where: { id: candidate.id },
      data: { status: 'NOTIFIED' },
    });

    return {
      notified: true,
      customerPhone: candidate.customerPhone,
      serviceName: candidate.service?.name,
      message: `Adaya bildirim gönderildi: ${candidate.customerPhone}`,
    };
  } catch (err) {
    console.error('Notify waitlist error:', err);
    return { notified: false, message: 'Bildirim gönderilemedi.' };
  }
}
