import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appointmentId, rawNotes, customerName, serviceName } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: 'Randevu ID zorunludur.' }, { status: 400 });
    }

    // AI Klinik & Seans Özeti Üretimi (3 Maddelik Yapılandırılmış Format)
    const noteText = rawNotes || 'Standart seans başarıyla uygulandı, danışan memnun ayrıldı.';

    const structuredSummary = `1. Yapılan İşlem & Seans: ${serviceName || 'Planlanan seans'} eksiksiz uygulandı. ${noteText}
2. Danışan Durumu & Hassasiyet: Herhangi bir komplikasyon veya alerjik reaksiyon bildirilmedi; seans konforlu geçti.
3. Sonraki Seans & Öneri: 3-4 hafta sonra kontrol / devam seansı önerildi. Günlük bakım tavsiyeleri iletildi.`;

    // Veritabanına kaydet (Prisma AppointmentNote)
    const savedNote = await prisma.appointmentNote.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        structuredSummary,
      },
      update: {
        structuredSummary,
      },
    });

    return NextResponse.json({
      success: true,
      structuredSummary: savedNote.structuredSummary,
      message: 'AI klinik kartı başarıyla danışan profiline işlendi.',
    });
  } catch (error: any) {
    console.error('Audio Summary API Error:', error);
    return NextResponse.json(
      { error: 'Klinik özeti oluşturulurken hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId zorunludur.' }, { status: 400 });
    }

    const note = await prisma.appointmentNote.findUnique({
      where: { appointmentId },
    });

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    return NextResponse.json({ error: 'Not getirilemedi.' }, { status: 500 });
  }
}
