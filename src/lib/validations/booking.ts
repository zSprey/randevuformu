import { z } from "zod";

/**
 * 🛡️ Security & Validation Layer
 * Zod schemas with sanitization for appointments, forms, and tenant settings
 */

// Turkish Phone Number Regex (+905XXXXXXXXX or 05XXXXXXXXX or 5XXXXXXXXX)
const trPhoneRegex = /^(?:\+90|0)?5[0-9]{9}$/;

export const CreateAppointmentSchema = z.object({
  tenantSlug: z
    .string()
    .min(2, "İşletme kimliği en az 2 karakter olmalıdır.")
    .max(64, "İşletme kimliği çok uzun.")
    .regex(/^[a-z0-9-]+$/, "Geçersiz işletme formatı."),
  serviceId: z.string().min(1, "Hizmet seçimi zorunludur."),
  staffId: z.string().optional(),
  customerName: z
    .string()
    .min(2, "Ad Soyad en az 2 karakter olmalıdır.")
    .max(100, "Ad Soyad en fazla 100 karakter olabilir.")
    .transform((val) => val.trim()),
  customerEmail: z
    .string()
    .email("Geçerli bir e-posta adresi giriniz.")
    .toLowerCase()
    .transform((val) => val.trim()),
  customerPhone: z
    .string()
    .min(10, "Telefon numarası en az 10 hane olmalıdır.")
    .refine((val) => trPhoneRegex.test(val.replace(/\s+/g, "")), {
      message: "Lütfen geçerli bir cep telefonu numarası giriniz (Örn: 05XX XXX XX XX)",
    }),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih formatı YYYY-AA-GG şeklinde olmalıdır."),
  appointmentTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Saat formatı SS:DD şeklinde olmalıdır."),
  customerNotes: z
    .string()
    .max(500, "Not en fazla 500 karakter olabilir.")
    .optional()
    .transform((val) => val?.trim() || ""),
  customFormData: z.record(z.string(), z.any()).optional(),
  kvkkConsent: z
    .boolean()
    .refine((val) => val === true, {
      message: "KVKK Aydınlatma Metnini onaylamanız gerekmektedir.",
    }),
});

export const ContactFormSchema = z.object({
  name: z.string().min(2, "Ad Soyad zorunludur.").max(100),
  company: z.string().max(100).optional(),
  email: z.string().email("Geçerli bir e-posta giriniz."),
  phone: z.string().optional(),
  message: z.string().min(5, "Mesajınız en az 5 karakter olmalıdır.").max(2000),
});

export const TenantSettingsSchema = z.object({
  name: z.string().min(2, "İşletme adı zorunludur."),
  phone: z.string().optional(),
  email: z.string().email(),
  timezone: z.string().default("Europe/Istanbul"),
  currency: z.enum(["TRY", "USD", "EUR"]).default("TRY"),
  cancellationPolicyHours: z.number().min(0).max(72).default(24),
  kvkkConsentText: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type ContactFormInput = z.infer<typeof ContactFormSchema>;
export type TenantSettingsInput = z.infer<typeof TenantSettingsSchema>;
