import { NextRequest, NextResponse } from "next/server";
import {
  getStoredWaitlist,
  saveNewWaitlistEntry,
  updateWaitlistStatus,
  deleteWaitlistEntry,
  StoredWaitlistEntry,
} from "@/lib/storage/waitlistStore";
import { waitlistEngine } from "@/lib/engine/waitlistEngine";
import {
  apiSuccess,
  apiBadRequest,
  handleApiError,
} from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET: Fetch waitlist entries by tenant, with optional date and status filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant =
      searchParams.get("tenant") ||
      searchParams.get("tenantId") ||
      searchParams.get("businessId") ||
      "byerman";
    const date = searchParams.get("date") || searchParams.get("preferred_date");
    const status = searchParams.get("status") as StoredWaitlistEntry["status"] | null;

    let list = await getStoredWaitlist(tenant);

    if (date) {
      list = list.filter((item) => item.preferred_date === date);
    }

    if (status) {
      list = list.filter((item) => item.status === status);
    }

    return apiSuccess({
      count: list.length,
      total: list.length,
      waitlist: list,
    });
  } catch (error: any) {
    return handleApiError(error, "Bekleme listesi getirilemedi.");
  }
}

/**
 * POST: Add new customer to waitlist
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenant_id,
      tenantId,
      business_id,
      service_id,
      serviceId,
      service_name,
      serviceName,
      customer_name,
      customerName,
      customer_phone,
      customerPhone,
      customer_email,
      customerEmail,
      preferred_date,
      preferredDate,
      time_range,
      timeRange,
      preferredTimeRange,
      notes,
      customerNote,
      staff_id,
      staffId,
      priority_score,
      priorityScore,
    } = body;

    const targetTenant = (tenant_id || tenantId || business_id || "byerman").toLowerCase();
    const targetName = (customer_name || customerName || "").trim();
    const targetPhone = (customer_phone || customerPhone || "").trim();
    const targetDate = (preferred_date || preferredDate || "").trim();
    const targetServiceId = service_id || serviceId || "default-service";
    const targetServiceName = service_name || serviceName || "Saç Kesimi & Yıkama";
    
    let targetTimeRange: string | undefined = undefined;
    if (typeof time_range === "string") {
      targetTimeRange = time_range;
    } else if (typeof timeRange === "string") {
      targetTimeRange = timeRange;
    } else if (preferredTimeRange && typeof preferredTimeRange === "object") {
      targetTimeRange = `${preferredTimeRange.start || "09:00"} - ${preferredTimeRange.end || "18:00"}`;
    }

    const targetNotes = notes || customerNote || "";
    const targetStaffId = staff_id || staffId || undefined;
    const targetPriority = priority_score ?? priorityScore ?? 85;

    if (!targetName || !targetPhone || !targetDate) {
      return apiBadRequest(
        "Eksik parametreler (customer_name, customer_phone ve preferred_date zorunludur)."
      );
    }

    const entryId = `wl_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const newEntry: StoredWaitlistEntry = {
      id: entryId,
      tenant_id: targetTenant,
      service_id: targetServiceId,
      service_name: targetServiceName,
      customer_name: targetName,
      customer_phone: targetPhone,
      customer_email: customer_email || customerEmail || undefined,
      preferred_date: targetDate,
      time_range: targetTimeRange,
      notes: targetNotes,
      staff_id: targetStaffId,
      status: "WAITING",
      priority_score: targetPriority,
      created_at: new Date().toISOString(),
    };

    await saveNewWaitlistEntry(newEntry);

    // Keep in-memory waitlistEngine in sync
    try {
      waitlistEngine.joinWaitlist({
        tenantId: targetTenant,
        serviceId: targetServiceId,
        customerName: targetName,
        customerPhone: targetPhone,
        customerEmail: customer_email || customerEmail || "",
        preferredDate: targetDate,
        priorityScore: targetPriority,
      });
    } catch {
      // Best-effort
    }

    return apiSuccess(
      { entry: newEntry },
      "Bekleme listesine başarıyla kaydedildiniz. Slot açıldığında WhatsApp/SMS ile bildirim alacaksınız.",
      201
    );
  } catch (error: any) {
    return handleApiError(error, "Bekleme listesi kaydı başarısız oldu.");
  }
}

/**
 * PATCH: Update waitlist entry status (e.g. WAITING -> OFFERED -> ACCEPTED)
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, tenant, tenant_id, tenantId } = body;

    if (!id || !status) {
      return apiBadRequest("ID ve status zorunludur.");
    }

    const validStatuses: StoredWaitlistEntry["status"][] = [
      "WAITING",
      "OFFERED",
      "ACCEPTED",
      "EXPIRED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return apiBadRequest(`Geçersiz status değeri: ${status}`);
    }

    const targetTenant = (tenant || tenant_id || tenantId || "byerman").toLowerCase();
    await updateWaitlistStatus(id, status, targetTenant);

    return apiSuccess(
      { success: true, id, status },
      "Bekleme listesi durumu başarıyla güncellendi."
    );
  } catch (error: any) {
    return handleApiError(error, "Bekleme listesi durumu güncellenemedi.");
  }
}

/**
 * DELETE: Remove an entry from waitlist
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    let tenant = searchParams.get("tenant") || searchParams.get("tenantId") || "byerman";

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
        if (body.tenant || body.tenant_id) {
          tenant = body.tenant || body.tenant_id;
        }
      } catch {
        // No body
      }
    }

    if (!id) {
      return apiBadRequest("ID parametresi zorunludur.");
    }

    await deleteWaitlistEntry(id, tenant.toLowerCase());
    return apiSuccess({ success: true, id }, "Bekleme listesi kaydı başarıyla silindi.");
  } catch (error: any) {
    return handleApiError(error, "Bekleme listesi kaydı silinemedi.");
  }
}
