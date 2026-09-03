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
