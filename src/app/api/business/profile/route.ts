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
    if (body.amenities !== undefined && Array.isArray(body.amenities)) {
      partialUpdate.amenities = body.amenities.filter((a: string) => !a.toLowerCase().includes("wifi") && !a.toLowerCase().includes("wi-fi"));
    }

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

    // WhatsApp & Hotlines
    if (body.whatsapp_number !== undefined) partialUpdate.whatsapp_number = String(body.whatsapp_number).trim();
    if (body.whatsapp_default_message !== undefined) partialUpdate.whatsapp_default_message = String(body.whatsapp_default_message).trim();
    if (body.is_whatsapp_active !== undefined) partialUpdate.is_whatsapp_active = Boolean(body.is_whatsapp_active);

    // Dynamic Discount / Yield Management
    if (body.is_dynamic_discount_active !== undefined) partialUpdate.is_dynamic_discount_active = Boolean(body.is_dynamic_discount_active);
    if (body.dynamic_discount_percent !== undefined) partialUpdate.dynamic_discount_percent = Number(body.dynamic_discount_percent);
    if (body.discount_threshold_hours !== undefined) partialUpdate.discount_threshold_hours = Number(body.discount_threshold_hours);

    // Desktop QR Stand Customization
    if (body.qr_stand_settings !== undefined) partialUpdate.qr_stand_settings = body.qr_stand_settings;

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
