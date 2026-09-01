import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const host = "randevuformu.com";
    const key = "randevuformu2026indexnowkey";
    const keyLocation = `https://${host}/randevuformu-indexnow.txt`;

    const urlList = [
      `https://${host}`,
      `https://${host}/login`,
      `https://${host}/ornek`,
      `https://${host}/kesfet`,
      `https://${host}/contact`,
      `https://${host}/blog`,
      `https://${host}/sektorler/dis-hekimi`,
      `https://${host}/sektorler/kuafor`,
      `https://${host}/sektorler/guzellik-merkezi`,
      `https://${host}/sektorler/diyetisyen`,
      `https://${host}/sektorler/psikolog`,
      `https://${host}/sektorler/avukat`,
    ];

    const payload = {
      host,
      key,
      keyLocation,
      urlList,
    };

    // 1. Submit to IndexNow API (Bing / IndexNow)
    const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: true,
      indexNowStatus: indexNowRes.status,
      submittedUrls: urlList.length,
      message: "IndexNow bildirimleri başarıyla gönderildi. Arama motorları dizine ekleme sürecini başlattı.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
