import { NextRequest, NextResponse } from "next/server";
import { getBusinessProfile, saveBusinessProfile } from "@/lib/storage/profileStore";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || "byerman";
    const profile = await getBusinessProfile(slug);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error("Profile GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Profil bilgileri alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug = "byerman",
      name,
      address,
      city,
      google_maps_url,
      phone,
      working_hours,
      rating_score,
      review_count,
    } = body;

    const updated = await saveBusinessProfile(slug, {
      name,
      address,
      city,
      google_maps_url,
      phone,
      working_hours,
      rating_score: rating_score !== undefined ? Number(rating_score) : undefined,
      review_count: review_count !== undefined ? Number(review_count) : undefined,
    });

    revalidatePath(`/${slug}`);
    revalidatePath(`/ornek/${slug}`);

    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (error: any) {
    console.error("Profile POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Profil güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}
