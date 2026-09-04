import { NextRequest, NextResponse } from 'next/server';
import { generateBusinessSummary } from '@/lib/ai/chatbotEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId') || 'cl_demo_business_123';

    const summary = await generateBusinessSummary(businessId);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Business Chat API Error:', error);
    return NextResponse.json({ error: 'Analiz üretilirken hata oluştu.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, businessId = 'cl_demo_business_123' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mesaj metni zorunludur.' }, { status: 400 });
    }

    const result = await generateBusinessSummary(businessId, message);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Business Chat API Error:', error);
    return NextResponse.json(
      { reply: 'Şu anda yanıt veremedim. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
