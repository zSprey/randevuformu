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
      // İşletme Bilgileri
      name,
      address,
      city,
      google_maps_url,
      phone,
      working_hours,
      rating_score,
      review_count,
      // Profil / Uzman Bilgileri
      owner_full_name,
      owner_email,
      owner_phone,
      owner_title,
      owner_bio,
      // Müsaitlik & Çalışma Saatleri
      working_days,
      work_start_time,
      work_end_time,
      break_start_time,
      break_end_time,
      slot_interval,
      // Bildirim Tercihleri
      sms_enabled,
      whatsapp_enabled,
      email_enabled,
      auto_confirm,
      // Entegrasyon Durumları
      google_calendar_connected,
      outlook_connected,
      // İptal Politikası
      cancel_policy_hours,
    } = body;

    // Build partial update — only include fields that were explicitly sent
    const partialUpdate: Record<string, any> = {};

    if (name !== undefined) partialUpdate.name = name;
    if (address !== undefined) partialUpdate.address = address;
    if (city !== undefined) partialUpdate.city = city;
    if (google_maps_url !== undefined) partialUpdate.google_maps_url = google_maps_url;
    if (phone !== undefined) partialUpdate.phone = phone;
    if (working_hours !== undefined) partialUpdate.working_hours = working_hours;
    if (rating_score !== undefined) partialUpdate.rating_score = Number(rating_score);
    if (review_count !== undefined) partialUpdate.review_count = Number(review_count);

    if (owner_full_name !== undefined) partialUpdate.owner_full_name = owner_full_name;
    if (owner_email !== undefined) partialUpdate.owner_email = owner_email;
    if (owner_phone !== undefined) partialUpdate.owner_phone = owner_phone;
    if (owner_title !== undefined) partialUpdate.owner_title = owner_title;
    if (owner_bio !== undefined) partialUpdate.owner_bio = owner_bio;

    if (working_days !== undefined) partialUpdate.working_days = working_days;
    if (work_start_time !== undefined) partialUpdate.work_start_time = work_start_time;
    if (work_end_time !== undefined) partialUpdate.work_end_time = work_end_time;
    if (break_start_time !== undefined) partialUpdate.break_start_time = break_start_time;
    if (break_end_time !== undefined) partialUpdate.break_end_time = break_end_time;
    if (slot_interval !== undefined) partialUpdate.slot_interval = slot_interval;

    if (sms_enabled !== undefined) partialUpdate.sms_enabled = Boolean(sms_enabled);
    if (whatsapp_enabled !== undefined) partialUpdate.whatsapp_enabled = Boolean(whatsapp_enabled);
    if (email_enabled !== undefined) partialUpdate.email_enabled = Boolean(email_enabled);
    if (auto_confirm !== undefined) partialUpdate.auto_confirm = Boolean(auto_confirm);

    if (google_calendar_connected !== undefined) partialUpdate.google_calendar_connected = Boolean(google_calendar_connected);
    if (outlook_connected !== undefined) partialUpdate.outlook_connected = Boolean(outlook_connected);

    if (cancel_policy_hours !== undefined) partialUpdate.cancel_policy_hours = cancel_policy_hours;

    const updated = await saveBusinessProfile(slug, partialUpdate);

    revalidatePath(`/${slug}`);
    revalidatePath(`/ornek/${slug}`);
    revalidatePath("/settings");

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
