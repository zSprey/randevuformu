import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standardized API Response Envelope
 */
export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
  [key: string]: any;
}

/**
 * Standard Success Response Helper
 */
export function apiSuccess<T extends Record<string, any> | any[] | undefined>(
  data?: T,
  message?: string,
  status: number = 200,
  headers?: HeadersInit
): NextResponse {
  const payload: ApiResponseEnvelope = {
    success: true,
  };

  if (message) {
    payload.message = message;
  }

  if (data !== undefined) {
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      // Merge top-level fields for backwards compatibility with existing consumers
      Object.assign(payload, data);
      payload.data = data;
    } else {
      payload.data = data;
    }
  }

  return NextResponse.json(payload, { status, headers });
}

/**
 * Standard Error Response Helper
 */
export function apiError(
  message: string,
  status: number = 500,
  code: string = "INTERNAL_SERVER_ERROR",
  details?: any,
  headers?: HeadersInit
): NextResponse {
  const payload: ApiResponseEnvelope = {
    success: false,
    error: message,
    code,
  };

  if (details !== undefined) {
    payload.details = details;
  }

  return NextResponse.json(payload, { status, headers });
}

/**
 * 400 Bad Request
 */
export function apiBadRequest(
  message: string = "Geçersiz istek parametreleri.",
  details?: any
): NextResponse {
  return apiError(message, 400, "BAD_REQUEST", details);
}

/**
 * 400 / 422 Validation Error (Supports ZodError)
 */
export function apiValidationError(
  errorOrMessage: ZodError | string,
  details?: any
): NextResponse {
  if (typeof errorOrMessage === "string") {
    return apiError(errorOrMessage, 422, "VALIDATION_ERROR", details);
  }

  const issues = errorOrMessage.issues || (errorOrMessage as any).errors || [];
  const formattedIssues = issues.map((err: any) => ({
    field: Array.isArray(err.path) ? err.path.join(".") : String(err.path || ""),
    message: err.message,
  }));

  const primaryMessage = formattedIssues[0]?.message || "Doğrulama hatası meydana geldi.";

  return apiError(primaryMessage, 422, "VALIDATION_ERROR", {
    issues: formattedIssues,
  });
}

/**
 * 401 Unauthorized
 */
export function apiUnauthorized(
  message: string = "Yetkisiz erişim. Lütfen giriş yapınız.",
  details?: any
): NextResponse {
  return apiError(message, 401, "UNAUTHORIZED", details);
}

/**
 * 403 Forbidden
 */
export function apiForbidden(
  message: string = "Bu işlem için yetkiniz bulunmamaktadır.",
  details?: any
): NextResponse {
  return apiError(message, 403, "FORBIDDEN", details);
}

/**
 * 404 Not Found
 */
export function apiNotFound(
  message: string = "Talep edilen kaynak bulunamadı.",
  details?: any
): NextResponse {
  return apiError(message, 404, "NOT_FOUND", details);
}

/**
 * 409 Conflict (e.g. Slot double-booking, lock held, capacity full)
 */
export function apiConflict(
  message: string = "Seçilen saat dilimi veya kaynak şu anda müsait değil.",
  details?: any
): NextResponse {
  return apiError(message, 409, "RESOURCE_CONFLICT", details);
}

/**
 * 429 Rate Limited / Too Many Requests
 */
export function apiRateLimited(
  message: string = "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin.",
  retryAfterSeconds?: number,
  details?: any
): NextResponse {
  const headers: Record<string, string> = {};
  if (retryAfterSeconds) {
    headers["Retry-After"] = String(retryAfterSeconds);
  }

  return apiError(
    message,
    429,
    "RATE_LIMIT_EXCEEDED",
    {
      ...(details || {}),
      retryAfterSeconds,
    },
    headers
  );
}

/**
 * Generic Catch Handler for Route handlers
 */
export function handleApiError(
  error: unknown,
  fallbackMessage: string = "İşlem sırasında beklenmeyen bir hata meydana geldi."
): NextResponse {
  if (error instanceof ZodError) {
    return apiValidationError(error);
  }

  const err = error as any;
  const message = err?.message || fallbackMessage;
  const status = typeof err?.statusCode === "number" ? err.statusCode : 500;
  const code = err?.code || "UNHANDLED_EXCEPTION";

  console.error(`[API Error] ${code} (${status}):`, error);

  return apiError(
    message,
    status,
    code,
    process.env.NODE_ENV === "development" ? { stack: err?.stack } : undefined
  );
}
