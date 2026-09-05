import { NextRequest, NextResponse } from "next/server";
import { BruteForceGuard } from "@/lib/security/bruteForceGuard";
import {
  getAllBusinessApplications,
  updateApplicationStatus,
} from "@/lib/storage/applicationStore";
import { sendBusinessApprovedNotification } from "@/lib/email";
import { supabase } from "@/lib/supabase";
import {
  apiSuccess,
  apiUnauthorized,
  apiBadRequest,
  handleApiError,
} from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get("rf_superadmin_session")?.value;
  if (token && BruteForceGuard.verifyAdminToken(token)) {
    return true;
  }
  // Also support secret API header if invoked from internal tooling
  const adminSecret = req.headers.get("x-admin-secret");
  if (adminSecret && adminSecret === process.env.SUPER_ADMIN_PASS) {
    return true;
  }
  return false;
}

// GET: List all applications
export async function GET(req: NextRequest) {
  try {
    if (!checkAdminAuth(req)) {
      return apiUnauthorized("Bu alana erişim için Super Admin oturumu gereklidir.");
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as "PENDING" | "APPROVED" | "REJECTED" | null;

    const applications = await getAllBusinessApplications(status || undefined);

    const pendingCount = applications.filter((a) => a.status === "PENDING").length;
    const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
    const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;

    return apiSuccess({
      applications,
      counts: {
        total: applications.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error: any) {
    return handleApiError(error, "Başvurular listelenirken hata oluştu.");
  }
}

// POST: Approve or Reject an application
export async function POST(req: NextRequest) {
  try {
    if (!checkAdminAuth(req)) {
      return apiUnauthorized("Yetkisiz işlem.");
    }

    const body = await req.json().catch(() => ({}));
    const { id, action, status, reason } = body;

    const targetStatus = status || (action === "approve" ? "APPROVED" : action === "reject" ? "REJECTED" : null);

    if (!id || !targetStatus || !["APPROVED", "REJECTED", "PENDING"].includes(targetStatus)) {
      return apiBadRequest("Geçerli bir id ve durum (APPROVED/REJECTED) belirtilmelidir.");
    }

    const updated = await updateApplicationStatus(id, targetStatus as any, {
      rejection_reason: reason,
      reviewed_by: "musa",
    });

    if (!updated) {
      return apiBadRequest("Başvuru bulunamadı.");
    }

    // If approved:
    if (targetStatus === "APPROVED") {
      const slug = (updated.business_name || "isletme")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "")
        .slice(0, 30);

      // 1. Ensure tenant record in Supabase
      try {
        await supabase.from("tenants").upsert({
          id: slug,
          name: updated.business_name,
          slug,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("[Admin Applications API] Tenant upsert note:", err);
      }

      // 2. Send Congratulations / Approval Email
      try {
        sendBusinessApprovedNotification(
          updated.email,
          updated.owner_name,
          updated.business_name
        ).catch((err) => console.warn("[Admin Applications API] Approval email note:", err));
      } catch (e) {
        console.warn("[Admin Applications API] Email send error:", e);
      }
    }

    return apiSuccess(
      { application: updated },
      targetStatus === "APPROVED"
        ? `${updated.business_name} başvurusu başarıyla onaylandı ve işletmeye bildirim e-postası gönderildi.`
        : `${updated.business_name} başvurusu reddedildi.`
    );
  } catch (error: any) {
    return handleApiError(error, "Başvuru durumu güncellenirken hata oluştu.");
  }
}
