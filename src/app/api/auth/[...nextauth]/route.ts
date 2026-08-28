import { NextResponse } from "next/server";

/**
 * 🔒 NextAuth Mock Deprecated
 * Auth is centrally managed via Supabase Auth SSR (@supabase/ssr).
 * All authentication requests are handled by /login and src/middleware.ts.
 */
export async function GET() {
  return NextResponse.json({
    status: "deprecated",
    message: "NextAuth mock disabled. Supabase Auth is active.",
  });
}

export async function POST() {
  return NextResponse.json({
    status: "deprecated",
    message: "NextAuth mock disabled. Supabase Auth is active.",
  });
}
