import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getStoredServices,
  saveStoredServices,
  StoredBusinessService,
  DEFAULT_BYERMAN_SERVICES,
} from "@/lib/storage/servicesStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "byerman";

    const services = await getStoredServices(slug);

    return NextResponse.json(
      {
        success: true,
        services,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.error("[API Business Services GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Hizmetler yüklenirken bir sorun oluştu.", services: DEFAULT_BYERMAN_SERVICES },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug = "byerman", action, services, service, serviceId } = body;

    const currentServices = await getStoredServices(slug);
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
    } catch {}

    return NextResponse.json({
      success: true,
      services: updatedList,
      message: "Hizmetler bulutta başarıyla güncellendi.",
    });
  } catch (error: any) {
    console.error("[API Business Services POST Error]:", error);
    return NextResponse.json(
      { success: false, error: "Hizmet kaydedilirken sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
