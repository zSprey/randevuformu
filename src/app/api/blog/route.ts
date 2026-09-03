import { NextResponse } from "next/server";
import { getAllBlogPosts } from "@/lib/blogStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await getAllBlogPosts();
    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
