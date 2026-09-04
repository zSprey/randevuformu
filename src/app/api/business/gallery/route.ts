import { NextRequest, NextResponse } from "next/server";
import {
  getStoredGallery,
  saveGalleryPhotos,
  addGalleryPhoto,
  deleteGalleryPhoto,
  GalleryPhoto,
} from "@/lib/storage/galleryStore";
import { revalidatePath } from "next/cache";

// 1. GET /api/business/gallery?slug=byerman
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "byerman";

    const photos = await getStoredGallery(slug);

    return NextResponse.json(
      {
        success: true,
        slug,
        count: photos.length,
        photos,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
        },
      }
    );
  } catch (error: any) {
    console.error("[API Gallery GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Galeri fotoğrafları alınamadı." },
      { status: 500 }
    );
  }
}

// 2. POST /api/business/gallery
// Supports file upload (multipart/form-data) OR JSON (action: 'save_all' | 'add' | 'delete')
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Case A: Multipart Form Data (Direct File Upload from Device)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const slug = (formData.get("slug") as string) || "byerman";
      const title = (formData.get("title") as string) || "Salon Fotoğrafı";
      const subtitle = (formData.get("subtitle") as string) || "İşletme Görseli";
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "Yüklenecek dosya seçilmedi." },
          { status: 400 }
        );
      }

      // Read file buffer and convert to optimized base64 data URI
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = file.type || "image/jpeg";
      const base64Url = `data:${mimeType};base64,${buffer.toString("base64")}`;

      const newPhoto = await addGalleryPhoto(slug, {
        url: base64Url,
        title,
        subtitle,
        source: "business_upload",
      });

      // Purge cache for live dynamic routes
      try {
        revalidatePath(`/${slug}`, "page");
        revalidatePath(`/ornek/${slug}`, "page");
      } catch {}

      const updatedPhotos = await getStoredGallery(slug);

      return NextResponse.json({
        success: true,
        message: "Fotoğraf başarıyla yüklendi ve buluta kaydedildi.",
        photo: newPhoto,
        photos: updatedPhotos,
      });
    }

    // Case B: JSON Request (save_all, add URL, delete)
    const body = await req.json();
    const slug = (body.slug as string) || "byerman";
    const action = body.action || "save_all";

    if (action === "delete") {
      const photoId = body.photoId;
      if (!photoId) {
        return NextResponse.json(
          { success: false, error: "Silinecek fotoğraf ID'si belirtilmedi." },
          { status: 400 }
        );
      }
      await deleteGalleryPhoto(slug, photoId);
      const remaining = await getStoredGallery(slug);
      return NextResponse.json({
        success: true,
        message: "Fotoğraf galeriden silindi.",
        photos: remaining,
      });
    }

    if (action === "add") {
      const { url, title, subtitle, source } = body.photo || {};
      if (!url) {
        return NextResponse.json(
          { success: false, error: "Görsel URL veya verisi zorunludur." },
          { status: 400 }
        );
      }
      const added = await addGalleryPhoto(slug, {
        url,
        title: title || "Salon Fotoğrafı",
        subtitle: subtitle || "İşletme Görseli",
        source: source || "google_maps",
      });
      const updated = await getStoredGallery(slug);
      return NextResponse.json({
        success: true,
        message: "Fotoğraf buluta kaydedildi.",
        photo: added,
        photos: updated,
      });
    }

    // Default: Bulk save all photos
    if (Array.isArray(body.photos)) {
      await saveGalleryPhotos(slug, body.photos as GalleryPhoto[]);
      try {
        revalidatePath(`/${slug}`, "page");
        revalidatePath(`/ornek/${slug}`, "page");
      } catch {}

      return NextResponse.json({
        success: true,
        message: "Galeri bulut veritabanına başarıyla kaydedildi.",
        photos: body.photos,
      });
    }

    return NextResponse.json(
      { success: false, error: "Geçersiz istek formatı." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[API Gallery POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "İşlem sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
