/**
 * 🏛️ Software Architecture - Multi-Tenant Domain Model for randevuformu.com
 * Relational Entities, Role-Based Access, and Tenant Isolation
 */

export type Role = 'SUPER_ADMIN' | 'TENANT_OWNER' | 'TENANT_ADMIN' | 'STAFF' | 'CUSTOMER';

export type AppointmentStatus = 
  | 'PENDING'       // Randevu oluşturuldu, onay veya ödeme bekliyor
  | 'CONFIRMED'     // Onaylandı ve takvime işlendi
  | 'IN_PROGRESS'   // Randevu şu an gerçekleşiyor
  | 'COMPLETED'     // Tamamlandı
  | 'CANCELLED'     // İptal edildi (Müşteri veya İşletme tarafından)
  | 'NO_SHOW';      // Danışan randevuya gelmedi

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
export type PaymentGateway = 'IYZICO' | 'STRIPE' | 'OFFLINE_PAY_AT_VENUE';

export type NotificationChannel = 'SMS_NETGSM' | 'SMS_TWILIO' | 'WHATSAPP' | 'EMAIL_RESEND' | 'EMAIL_SMTP';
export type NotificationStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';

// 1. Tenant (İşletme / Kurum / Profesyonel)
export interface Tenant {
  id: string;
  name: string;
  slug: string; // Örn: 'dr-ahmet' (firma.randevuformu.com veya randevuformu.com/dr-ahmet)
  customDomain?: string; // Örn: 'randevu.drahmetyilmaz.com'
  logoUrl?: string;
  category: 'HEALTH' | 'BEAUTY' | 'LEGAL' | 'CONSULTING' | 'FITNESS' | 'EDUCATION' | 'OTHER';
  timezone: string; // Örn: 'Europe/Istanbul'
  currency: 'TRY' | 'USD' | 'EUR';
  phone?: string;
  email: string;
  address?: string;
  isActive: boolean;
  kvkkConsentText?: string;
  cancellationPolicyHours: number; // Randevudan kaç saat öncesine kadar iptale izin verilir
  createdAt: string;
  updatedAt: string;
}

// 2. User & Profiles
export interface User {
  id: string;
  tenantId?: string; // Multi-tenant bağlamı (SuperAdmin için null)
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// 3. Staff / Specialists (Hizmet Veren Uzmanlar)
export interface Staff {
  id: string;
  tenantId: string;
  userId?: string;
  name: string;
  title?: string; // Örn: 'Uzm. Klinik Psikolog'
  email: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  googleCalendarConnected: boolean;
  googleCalendarRefreshToken?: string;
  outlookConnected: boolean;
  workingHours: StaffWorkingHours[];
  createdAt: string;
  updatedAt: string;
}

export interface StaffWorkingHours {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: Pazar, 1: Pazartesi ... 6: Cumartesi
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  breakStartTime?: string; // "12:30"
  breakEndTime?: string;   // "13:30"
  isOffDay: boolean;
}

// 4. Service (Hizmet / Randevu Tipi)
export interface Service {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  durationMinutes: number; // Örn: 30, 45, 60
  bufferTimeBeforeMinutes: number; // Randevu öncesi hazırlık tamponu
  bufferTimeAfterMinutes: number;  // Randevu sonrası toparlanma tamponu
  price: number;
  currency: string;
  requirePrepayment: boolean;
  prepaymentAmount?: number;
  maxCapacityPerSlot: number; // Grup randevuları için (1 = Birebir)
  formSchemaId?: string; // Özel form alanları bağlantısı
  assignedStaffIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 5. Dynamic Form Schema (Özel Form Alanları - No-Code Builder)
export interface FormField {
  id: string;
  type: 'TEXT' | 'NUMBER' | 'EMAIL' | 'PHONE' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'TEXTAREA' | 'FILE_UPLOAD';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // SELECT / RADIO için seçenekler
  validationRule?: string;
}

export interface FormSchema {
  id: string;
  tenantId: string;
  title: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

// 6. Appointment (Rezervasyon / Randevu Kaydı)
export interface Appointment {
  id: string;
  tenantId: string;
  serviceId: string;
  staffId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNotes?: string;
  customFormData?: Record<string, any>; // FormBuilder'dan gelen dinamik yanıtlar
  startUtc: string; // ISO 8601 UTC
  endUtc: string;   // ISO 8601 UTC
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentId?: string;
  googleEventId?: string;
  outlookEventId?: string;
  cancellationToken: string;
  rescheduleToken: string;
  createdAt: string;
  updatedAt: string;
}

// 7. Notification Logs (SMS & WhatsApp & Email Geçmişi)
export interface NotificationLog {
  id: string;
  tenantId: string;
  appointmentId: string;
  recipient: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  templateName: string;
  payload: Record<string, any>;
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

// 8. Payment Transaction (İyzico / Stripe Kaydı)
export interface PaymentTransaction {
  id: string;
  tenantId: string;
  appointmentId: string;
  gateway: PaymentGateway;
  transactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  cardLastFour?: string;
  rawGatewayResponse?: any;
  createdAt: string;
}
