import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

// Nodemailer SMTP konfigürasyonu
// Not: Ortam değişkenleri (Environment Variables) kullanılmalıdır
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'your_email@gmail.com',
    pass: process.env.SMTP_PASS || 'your_app_password',
  },
});

// Belirli bir event'e ait randevuları getiren GET isteği
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    let query = supabase.from('bookings').select('*');

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data: bookings, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Randevular getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni bir randevu oluşturan POST isteği (Çakışma Kontrolü ve Mail Tetikleyici içerir)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_id, user_name, user_email, start_time, end_time } = body;

    // Zorunlu alanların kontrolü
    if (!event_id || !user_name || !user_email || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Eksik bilgi: event_id, user_name, user_email, start_time ve end_time zorunludur' },
        { status: 400 }
      );
    }

    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'Bitiş zamanı başlangıç zamanından sonra olmalıdır' },
        { status: 400 }
      );
    }

    // 1. Etkinliğin var olup olmadığını ve kapasitesini kontrol et
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    // 2. CONFLICT RESOLUTION (ÇAKIŞMA ÖNLEME) ALGORİTMASI
    // Aynı etkinlik için istenen zaman aralığıyla kesişen randevuları bul
    // Kesişim mantığı: Mevcut randevunun başlangıcı, yeni randevunun bitişinden önce VE Mevcut randevunun bitişi, yeni randevunun başlangıcından sonra olmalıdır
    const { data: overlappingBookings, error: overlapError } = await supabase
      .from('bookings')
      .select('*')
      .eq('event_id', event_id)
      .lt('start_time', endTime.toISOString())
      .gt('end_time', startTime.toISOString());

    if (overlapError) {
      throw overlapError;
    }

    // Kapasite kontrolü
    const currentBookingsCount = overlappingBookings ? overlappingBookings.length : 0;
    const capacity = event.capacity || 1;

    if (currentBookingsCount >= capacity) {
      return NextResponse.json(
        { error: 'Seçilen zaman dilimi tamamen dolu. (Kapasite sınırı aşıldı)' },
        { status: 409 }
      );
    }

    // Opsiyonel: Kullanıcının aynı anda başka bir randevusu var mı kontrolü (Çifte randevu önleme)
    const { data: userOverlaps, error: userOverlapError } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_email', user_email)
      .lt('start_time', endTime.toISOString())
      .gt('end_time', startTime.toISOString());

    if (userOverlapError) {
      throw userOverlapError;
    }

    if (userOverlaps && userOverlaps.length > 0) {
      return NextResponse.json(
        { error: 'Bu zaman diliminde zaten başka bir randevunuz bulunuyor.' },
        { status: 409 }
      );
    }

    // 3. Çakışma yoksa randevuyu veritabanına ekle
    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert([
        {
          event_id,
          user_name,
          user_email,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'confirmed',
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 4. MAİL GÖNDERİM TETİKLEYİCİSİ (Nodemailer)
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || '"Randevu Sistemi" <noreply@example.com>',
      to: user_email,
      subject: `Randevunuz Onaylandı: ${event.title}`,
      text: `Merhaba ${user_name},\n\n"${event.title}" için randevunuz başarıyla oluşturuldu.\n\nBaşlangıç: ${startTime.toLocaleString('tr-TR')}\nBitiş: ${endTime.toLocaleString('tr-TR')}\n\nTeşekkür ederiz!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #4CAF50;">Randevunuz Onaylandı</h2>
          <p>Merhaba <strong>${user_name}</strong>,</p>
          <p><strong>${event.title}</strong> için randevunuz başarıyla oluşturulmuştur.</p>
          <ul style="list-style-type: none; padding-left: 0;">
            <li>📅 <strong>Başlangıç:</strong> ${startTime.toLocaleString('tr-TR')}</li>
            <li>⏳ <strong>Bitiş:</strong> ${endTime.toLocaleString('tr-TR')}</li>
          </ul>
          <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Bu e-posta otomatik olarak gönderilmiştir, lütfen cevaplamayınız.</p>
        </div>
      `,
    };

    // Mail gönderim işlemini bekletip sonucuna göre response dönebiliriz.
    // Eğer mail gönderiminin kullanıcıyı bekletmemesi isteniyorsa 'await' kaldırılabilir (Fire and Forget)
    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error('Mail gönderim hatası:', mailError);
      // Mail gönderilemese bile randevu oluşturulduğu için 201 dönülebilir, 
      // ancak client'a mail gönderilemediği bilgisi verilebilir.
      return NextResponse.json(
        { booking, message: 'Randevu oluşturuldu ancak onay maili gönderilemedi.', mailError: true },
        { status: 201 }
      );
    }

    // Başarılı yanıt döndür
    return NextResponse.json(
      { booking, message: 'Randevu başarıyla oluşturuldu ve onay maili gönderildi.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Randevu oluşturma hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Randevu oluşturulurken beklenmeyen bir hata meydana geldi' },
      { status: 500 }
    );
  }
}
