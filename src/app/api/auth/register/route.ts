import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  createBusinessApplication,
  getApplicationByEmail,
} from "@/lib/storage/applicationStore";
import { sendAdminNewApplicationNotification } from "@/lib/email";
import {
  apiSuccess,
  apiBadRequest,
  apiConflict,
  handleApiError,
} from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      businessName,
      ownerName,
      email,
      password,
      phone,
      category,
      city,
      district,
      website,
      locationUrl,
    } = body;

    // 1. Strict Field Validations
    if (!businessName || typeof businessName !== "string" || !businessName.trim()) {
      return apiBadRequest("İşletme adı zorunludur.");
    }
    if (!ownerName || typeof ownerName !== "string" || !ownerName.trim()) {
      return apiBadRequest("Yetkili ad soyad zorunludur.");
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return apiBadRequest("Geçerli bir e-posta adresi zorunludur.");
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return apiBadRequest("Şifre en az 6 karakter olmalıdır.");
    }
    if (!phone || typeof phone !== "string" || phone.trim().length < 10) {
      return apiBadRequest("Geçerli bir telefon / WhatsApp numarası zorunludur.");
    }
    if (!category || typeof category !== "string" || !category.trim()) {
      return apiBadRequest("İşletme kategorisi / sektörü seçilmelidir.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanBusinessName = businessName.trim();
    const cleanOwnerName = ownerName.trim();
    const cleanPhone = phone.trim();

    // 2. Check if already registered
    const existingApp = await getApplicationByEmail(cleanEmail);
    if (existingApp) {
      if (existingApp.status === "PENDING") {
        return apiConflict(
          "Bu e-posta adresi ile yapılmış bir başvuru zaten yönetici onayında beklemektedir."
        );
      } else if (existingApp.status === "APPROVED") {
        return apiConflict(
          "Bu e-posta adresi ile kayıtlı onaylı bir hesap bulunmaktadır. Lütfen giriş yapın."
        );
      }
    }

    // 3. Supabase Auth SignUp
    let authUserId: string | undefined;
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanOwnerName,
            business_name: cleanBusinessName,
            category,
            phone: cleanPhone,
            city: city || null,
            district: district || null,
          },
        },
      });

      if (authError) {
        // If user already registered in Supabase auth
        if (
          authError.message.toLowerCase().includes("already registered") ||
          authError.message.toLowerCase().includes("user already exists")
        ) {
          return apiConflict("Bu e-posta adresi ile zaten bir hesap oluşturulmuş.");
        }
        console.warn("[Register API] Supabase auth signUp warning:", authError.message);
      } else if (authData?.user) {
        authUserId = authData.user.id;
      }
    } catch (authEx: any) {
      console.warn("[Register API] Supabase Auth exception:", authEx);
    }

    // 4. Create Business Application in Store
    const application = await createBusinessApplication({
      user_id: authUserId,
      business_name: cleanBusinessName,
      owner_name: cleanOwnerName,
      email: cleanEmail,
      phone: cleanPhone,
      category: category.trim(),
      city: (city || "").trim() || undefined,
      district: (district || "").trim() || undefined,
      website: (website || "").trim() || undefined,
      location_url: (locationUrl || "").trim() || undefined,
    });

    // 5. Send Admin Notification Email Asynchronously
    try {
      sendAdminNewApplicationNotification({
        business_name: cleanBusinessName,
        owner_name: cleanOwnerName,
        email: cleanEmail,
        phone: cleanPhone,
        category: category.trim(),
        city: (city || "").trim() || undefined,
        district: (district || "").trim() || undefined,
        website: (website || "").trim() || undefined,
        location_url: (locationUrl || "").trim() || undefined,
      }).catch((err) => console.warn("[Register API] Admin email async err:", err));
    } catch (e) {
      console.warn("[Register API] Email trigger error:", e);
    }

    return apiSuccess(
      {
        applicationId: application.id,
        businessName: application.business_name,
        email: application.email,
        status: application.status,
      },
      "Başvurunuz başarıyla alındı! E-posta adresinize doğrulama bağlantısı gönderildi. Hesabınız yönetici onayının ardından aktif olacaktır."
    );
  } catch (error: any) {
    return handleApiError(error, "Kayıt başvurusu oluşturulurken bir hata oluştu.");
  }
}
