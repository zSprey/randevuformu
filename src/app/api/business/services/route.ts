import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getStoredServices,
  saveStoredServices,
  normalizeTenant,
  StoredBusinessService,
  DEFAULT_BYERMAN_SERVICES,
} from "@/lib/storage/servicesStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSlug = searchParams.get("slug") || "byerman";
    const slug = normalizeTenant(rawSlug);

    // skipCache=true to always read the latest authoritative data from Edge Config
    const services = await getStoredServices(slug, true);

    return NextResponse.json(
      {
        success: true,
        services,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error: any) {
    console.error("[API Business Services GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Hizmetler yüklenirken bir sorun oluştu.", services: DEFAULT_BYERMAN_SERVICES },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug: rawSlug = "byerman", action, services, service, serviceId } = body;
    const slug = normalizeTenant(rawSlug);

    const currentServices = await getStoredServices(slug, true);
    let updatedList: StoredBusinessService[] = [...currentServices];

    if (action === "save_all" && Array.isArray(services)) {
      updatedList = services;
    } else if (action === "add" && service) {
      const newService: StoredBusinessService = {
        id: service.id || `srv-${Date.now()}`,
        name: service.name,
        duration_minutes: Number(service.duration_minutes) || 30,
        price: service.price ? Number(service.price) : undefined,
        price_text: service.price ? `₺${Number(service.price).toLocaleString("tr-TR")}` : undefined,
        description: service.description || "",
        is_extra: Boolean(service.is_extra),
        category: service.category || (service.is_extra ? "Ekstra Hizmet" : "Ana Hizmet"),
        created_at: new Date().toISOString(),
      };
      updatedList.push(newService);
    } else if (action === "update" && service && service.id) {
      updatedList = updatedList.map((s) =>
        s.id === service.id
          ? {
              ...s,
              name: service.name,
              duration_minutes: Number(service.duration_minutes) || 30,
              price: service.price ? Number(service.price) : undefined,
              price_text: service.price ? `₺${Number(service.price).toLocaleString("tr-TR")}` : undefined,
              description: service.description || "",
              is_extra: Boolean(service.is_extra),
              category: service.category || (service.is_extra ? "Ekstra Hizmet" : "Ana Hizmet"),
            }
          : s
      );
    } else if (action === "delete" && serviceId) {
      updatedList = updatedList.filter((s) => s.id !== serviceId);
    }

    await saveStoredServices(slug, updatedList);

    // Revalidate paths so changes take effect across all routes
    try {
      revalidatePath(`/${slug}`);
      revalidatePath("/settings");
      revalidatePath("/panel");
      revalidatePath("/byerman");
      revalidatePath("/");
    } catch {}

    return NextResponse.json(
      {
        success: true,
        services: updatedList,
        message: "Hizmetler bulutta başarıyla güncellendi.",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("[API Business Services POST Error]:", error);
    return NextResponse.json(
      { success: false, error: "Hizmet kaydedilirken sunucu hatası oluştu." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
