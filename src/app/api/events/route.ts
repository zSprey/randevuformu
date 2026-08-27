import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Event'leri getiren GET isteği
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let query = supabase.from('events').select('*');

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query = query
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());
    }

    const { data: events, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ events }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Etkinlikler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni bir event oluşturan POST isteği (Çakışma kontrolü ile)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, start_time, end_time, capacity } = body;

    if (!title || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Başlık, başlangıç zamanı ve bitiş zamanı zorunludur' },
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

    // Event seviyesinde çakışma (conflict) kontrolü
    // Aynı zaman diliminde başka bir etkinlik var mı kontrolü (opsiyonel ama iyi bir pratik)
    const { data: overlappingEvents, error: overlapError } = await supabase
      .from('events')
      .select('*')
      .lt('start_time', endTime.toISOString())
      .gt('end_time', startTime.toISOString());

    if (overlapError) {
      throw overlapError;
    }

    if (overlappingEvents && overlappingEvents.length > 0) {
      return NextResponse.json(
        { error: 'Bu zaman diliminde zaten başka bir etkinlik mevcut (Çakışma tespit edildi)' },
        { status: 409 }
      );
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert([
        {
          title,
          description: description || '',
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          capacity: capacity || 1,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Etkinlik oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
