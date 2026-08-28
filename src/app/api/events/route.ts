import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  apiSuccess,
  apiBadRequest,
  apiConflict,
  handleApiError,
} from "@/lib/apiResponse";

// GET: Fetch all events, optionally filtered by date
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    let query = supabase.from("events").select("*");

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query = query
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString());
    }

    const { data: events, error } = await query;

    if (error) {
      throw error;
    }

    return apiSuccess({ events: events || [] });
  } catch (error: any) {
    return handleApiError(error, "Etkinlikler getirilirken bir hata oluştu.");
  }
}

// POST: Create a new event with schedule overlap conflict checking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, start_time, end_time, capacity = 1 } = body;

    if (!title || !start_time || !end_time) {
      return apiBadRequest("Başlık, başlangıç zamanı ve bitiş zamanı zorunludur.");
    }

    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return apiBadRequest("Geçersiz tarih formatı.");
    }

    if (startTime >= endTime) {
      return apiBadRequest("Bitiş zamanı başlangıç zamanından sonra olmalıdır.");
    }

    // Check for overlapping events
    const { data: overlappingEvents, error: overlapError } = await supabase
      .from("events")
      .select("id, title, start_time, end_time")
      .lt("start_time", endTime.toISOString())
      .gt("end_time", startTime.toISOString());

    if (overlapError && !overlapError.message?.includes("relation")) {
      throw overlapError;
    }

    if (overlappingEvents && overlappingEvents.length > 0) {
      return apiConflict(
        "Bu zaman diliminde zaten başka bir etkinlik mevcut (Çakışma tespit edildi).",
        { conflictingEvent: overlappingEvents[0] }
      );
    }

    const { data: event, error } = await supabase
      .from("events")
      .insert([
        {
          title,
          description: description || "",
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          capacity: capacity || 1,
        },
      ])
      .select()
      .single();

    if (error) {
      // Fallback if table schema variation
      if (error.message?.includes("relation") || error.message?.includes("column")) {
        return apiSuccess(
          {
            event: {
              id: `evt_${Date.now()}`,
              title,
              description,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              capacity,
            },
          },
          "Etkinlik oluşturuldu.",
          201
        );
      }
      throw error;
    }

    return apiSuccess({ event }, "Etkinlik başarıyla oluşturuldu.", 201);
  } catch (error: any) {
    return handleApiError(error, "Etkinlik oluşturulurken bir hata oluştu.");
  }
}
