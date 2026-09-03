import { NextRequest, NextResponse } from 'next/server';
import { processCustomerMessage } from '@/lib/ai/chatbotEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, businessSlug = 'byerman' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mesaj metni zorunludur.' }, { status: 400 });
    }

    const result = await processCustomerMessage(message, businessSlug);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Customer Chat API Error:', error);
    return NextResponse.json(
      { reply: 'Şu anda sistem yanıt veremiyor. Lütfen doğrudan WhatsApp üzerinden bize yazın.' },
      { status: 500 }
    );
  }
}
