import { NextRequest, NextResponse } from "next/server";
import {
  getReputationSettings,
  saveReputationSettings,
  getFeaturedReviews,
  getPrivateFeedbacks,
  addPrivateFeedback,
  updateFeedbackStatus,
} from "@/lib/storage/reputationStore";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || "byerman";
    const includeFeedbacks = searchParams.get("include_feedbacks") === "true";

    const [settings, reviews] = await Promise.all([
      getReputationSettings(slug),
      getFeaturedReviews(slug),
    ]);

    let feedbacks: any[] = [];
    if (includeFeedbacks) {
      feedbacks = await getPrivateFeedbacks(slug);
    }

    return NextResponse.json({
      success: true,
      settings,
      reviews,
      feedbacks,
    });
  } catch (error: any) {
    console.error("Reputation GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get reputation data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, slug = "byerman" } = body;

    if (action === "submit_feedback") {
      const { customer_name, customer_phone, rating, comment } = body;

      if (!rating || typeof rating !== "number") {
        return NextResponse.json(
          { success: false, error: "Puanlama zorunludur." },
          { status: 400 }
        );
      }

      // If 1-3 stars, store privately so business can intervene
      let storedEntry = null;
      if (rating <= 3) {
        storedEntry = await addPrivateFeedback({
          business_slug: slug,
          customer_name: customer_name || "Misafir Müşteri",
          customer_phone: customer_phone || "-",
          rating,
          comment: comment || "Yorum belirtilmedi.",
        });
      }

      return NextResponse.json({
        success: true,
        is_private: rating <= 3,
        stored: storedEntry,
      });
    }

    if (action === "save_settings") {
      const { google_review_url, rating_score, review_count, reviews_enabled } = body;

      const updated = await saveReputationSettings(slug, {
        google_review_url,
        rating_score: rating_score !== undefined ? Number(rating_score) : undefined,
        review_count: review_count !== undefined ? Number(review_count) : undefined,
        reviews_enabled: reviews_enabled !== undefined ? Boolean(reviews_enabled) : undefined,
      });

      revalidatePath(`/${slug}`);
      revalidatePath(`/ornek/${slug}`);

      return NextResponse.json({
        success: true,
        settings: updated,
      });
    }

    if (action === "update_feedback_status") {
      const { feedback_id, status } = body;
      if (!feedback_id || !status) {
        return NextResponse.json(
          { success: false, error: "feedback_id ve status gereklidir." },
          { status: 400 }
        );
      }

      const ok = await updateFeedbackStatus(slug, feedback_id, status);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json(
      { success: false, error: "Geçersiz işlem." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Reputation POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "İşlem sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
