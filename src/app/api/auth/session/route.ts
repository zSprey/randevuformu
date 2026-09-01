import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = (body.identifier || body.username || body.email || "").trim().toLowerCase();
    const password = body.password || "";

    const isByErman =
      identifier === "byerman" ||
      identifier === "byerman@randevuformu.com" ||
      identifier === "byerman@gmail.com" ||
      identifier === "ermankuafor" ||
      identifier === "ermankuafor@randevuformu.com";

    if (isByErman) {
      if (password && password !== "byerman123" && password !== "ermankuafor123") {
        return NextResponse.json(
          { success: false, error: "Şifre hatalı. Lütfen tekrar deneyin." },
          { status: 401 }
        );
      }
    }

    const host = (req.headers.get("host") || "").toLowerCase().split(":")[0];
    const isRandevuFormuDomain = host.includes("randevuformu.com");
    const cookieDomain = isRandevuFormuDomain ? ".randevuformu.com" : undefined;

    const userTenant = isByErman
      ? "byerman"
      : (body.tenant || body.businessName || identifier || "default").replace(/[^a-z0-9_-]/gi, "").toLowerCase() || "default";

    const res = NextResponse.json({
      success: true,
      user: {
        username: isByErman ? "byerman" : identifier || "user",
        tenant: userTenant,
      },
    });

    const oneYear = 60 * 60 * 24 * 365;

    const cookieOptions = {
      path: "/",
      maxAge: oneYear,
      httpOnly: false, // Accessible to client JS as well
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production" || req.url.startsWith("https"),
      domain: cookieDomain,
    };

    res.cookies.set("rf_session", "true", cookieOptions);
    res.cookies.set("demo_session", "true", cookieOptions);
    res.cookies.set("rf_user", isByErman ? "byerman" : identifier || "user", cookieOptions);
    res.cookies.set("rf_tenant", userTenant, cookieOptions);

    return res;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase().split(":")[0];
  const isRandevuFormuDomain = host.includes("randevuformu.com");
  const cookieDomain = isRandevuFormuDomain ? ".randevuformu.com" : undefined;

  const res = NextResponse.json({ success: true });
  const clearOptions = {
    path: "/",
    maxAge: 0,
    domain: cookieDomain,
  };

  res.cookies.set("rf_session", "", clearOptions);
  res.cookies.set("demo_session", "", clearOptions);
  res.cookies.set("rf_user", "", clearOptions);
  res.cookies.set("rf_tenant", "", clearOptions);

  return res;
}

export async function GET(req: NextRequest) {
  const rfSession = req.cookies.get("rf_session")?.value;
  const rfUser = req.cookies.get("rf_user")?.value;
  const isAuth = rfSession === "true" || Boolean(rfUser);

  return NextResponse.json({
    authenticated: isAuth,
    user: rfUser || null,
  });
}
