// app/actions/booking.ts
'use server'

import prisma from '@/lib/prisma';
import { z } from 'zod';

const BookingSchema = z.object({
  businessId: z.string(),
  serviceId: z.string(),
  customerName: z.string().min(2, "Adınız en az 2 karakter olmalıdır."),
  customerPhone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Geçerli bir telefon numarası giriniz."),
  startTime: z.string(), // ISO String
  endTime: z.string(),   // ISO String
});

export async function createBooking(formData: FormData) {
  try {
    const rawData = {
      businessId: formData.get('businessId'),
      serviceId: formData.get('serviceId'),
      customerName: formData.get('customerName'),
      customerPhone: formData.get('customerPhone'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
    };

    const parsedData = BookingSchema.parse(rawData);

    // İşletme bilgilerini ve WhatsApp numarasını çek
    const business = await prisma.business.findUnique({
      where: { id: parsedData.businessId },
      select: { name: true, whatsappNumber: true },
    });

    if (!business) {
      throw new Error("İşletme bulunamadı.");
    }

    // Veritabanına randevuyu yaz (İyzico olmadan, varsayılan PENDING ve isDepositPaid: false)
    const appointment = await prisma.appointment.create({
      data: {
        businessId: parsedData.businessId,
        serviceId: parsedData.serviceId,
        customerName: parsedData.customerName,
        customerPhone: parsedData.customerPhone,
        startTime: new Date(parsedData.startTime),
        endTime: new Date(parsedData.endTime),
        totalAmount: 0, // Şimdilik 0, servis tablosundan çekilebilir
      },
    });

    // Müşterinin WhatsApp'tan işletmeye göndereceği teyit mesajını oluştur
    const formattedDate = new Date(parsedData.startTime).toLocaleString('tr-TR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    const whatsappMsg = `Merhaba, ${business.name} için randevu oluşturdum.\n\n👤 İsim: ${parsedData.customerName}\n🗓 Tarih: ${formattedDate}\n\nRandevumu onaylıyor musunuz?`;
    
    const whatsappUrl = business.whatsappNumber 
      ? `https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMsg)}`
      : null;

    return { 
      success: true, 
      appointmentId: appointment.id,
      whatsappRedirectUrl: whatsappUrl 
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstMsg = error.issues?.[0]?.message || (error as { errors?: { message: string }[] }).errors?.[0]?.message;
      return { success: false, message: firstMsg || "Geçersiz form verisi." };
    }
    console.error("Booking Error:", error);
    return { success: false, message: "Randevu oluşturulurken bir hata meydana geldi." };
  }
}
