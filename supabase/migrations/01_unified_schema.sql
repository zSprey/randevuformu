-- ============================================================
-- randevuformu.com — Birleşik Kanonik Veritabanı Şeması
-- Migration: 01_unified_schema.sql
-- Tarih: 2026-08-28
-- ============================================================

-- 1. TENANTS (İşletmeler / Klinikler)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  custom_domain TEXT,
  category TEXT DEFAULT 'clinic',
  timezone TEXT DEFAULT 'Europe/Istanbul',
  currency TEXT DEFAULT 'TRY',
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  cancellation_policy_hours INT DEFAULT 24,
  kvkk_consent_text TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','pro','enterprise')),
  stripe_customer_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. STAFF (Personel / Hekimler)
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  role TEXT DEFAULT 'STAFF' CHECK (role IN ('SUPER_ADMIN','TENANT_OWNER','TENANT_ADMIN','STAFF')),
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  google_refresh_token TEXT,
  outlook_refresh_token TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. STAFF WORKING HOURS (Çalışma Saatleri)
CREATE TABLE IF NOT EXISTS staff_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start TIME,
  break_end TIME,
  is_off_day BOOLEAN DEFAULT false,
  UNIQUE (staff_id, day_of_week)
);

-- 4. SERVICES (Hizmetler)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  buffer_before INT DEFAULT 0,
  buffer_after INT DEFAULT 5,
  price NUMERIC(10,2) DEFAULT 0,
  price_text TEXT,
  currency TEXT DEFAULT 'TRY',
  require_prepayment BOOLEAN DEFAULT false,
  max_capacity INT DEFAULT 1,
  assigned_staff_ids UUID[] DEFAULT '{}',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. APPOINTMENTS (Randevular)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  staff_id UUID REFERENCES staff(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  customer_note TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  start_utc TIMESTAMPTZ NOT NULL,
  end_utc TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW')),
  cancellation_token UUID DEFAULT gen_random_uuid(),
  google_event_id TEXT,
  outlook_event_id TEXT,
  payment_status TEXT DEFAULT 'PENDING'
    CHECK (payment_status IN ('PENDING','PAID','REFUNDED','FAILED')),
  payment_amount NUMERIC(10,2),
  payment_gateway TEXT,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. FORM SCHEMAS (Dinamik Form Tanımları)
CREATE TABLE IF NOT EXISTS form_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Ön Bilgi Formu',
  fields JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SLOT LOCKS (Distributed Geçici Slot Kilitleri)
CREATE TABLE IF NOT EXISTS slot_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id),
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  locked_by TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. WAITLIST (Akıllı Yedek Bekleme Listesi)
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  preferred_date DATE NOT NULL,
  preferred_time_start TIME,
  preferred_time_end TIME,
  priority_score INT DEFAULT 50,
  status TEXT DEFAULT 'WAITING'
    CHECK (status IN ('WAITING','OFFERED','ACCEPTED','EXPIRED')),
  offered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. NOTIFICATION LOGS (Bildirim Geçmişi)
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('SMS','WHATSAPP','EMAIL')),
  recipient TEXT NOT NULL,
  message_body TEXT,
  status TEXT DEFAULT 'SENT' CHECK (status IN ('SENT','DELIVERED','FAILED')),
  provider_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. SUBSCRIPTIONS (Abonelik Paketleri)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free','pro','enterprise')),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','past_due','cancelled','trialing')),
  monthly_appointment_count INT DEFAULT 0,
  monthly_sms_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. REFERRALS (Viral Büyüme Yönlendirme Sistemi)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_tenant_id UUID REFERENCES tenants(id),
  referred_tenant_id UUID REFERENCES tenants(id),
  referral_code TEXT UNIQUE NOT NULL,
  reward_type TEXT DEFAULT 'free_month',
  is_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PERFORMANS İNDEKSLERİ
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_tenant ON staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_services_tenant ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_date ON appointments(tenant_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_date ON appointments(staff_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_slot_locks_expiry ON slot_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_slot_locks_tenant_date ON slot_locks(tenant_id, slot_date, slot_time);
CREATE INDEX IF NOT EXISTS idx_waitlist_tenant_date ON waitlist(tenant_id, preferred_date);
CREATE INDEX IF NOT EXISTS idx_notification_logs_tenant ON notification_logs(tenant_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Herkes kendi tenant'ının verilerini görebilir (anon key ile public okuma)
CREATE POLICY "Public read tenants" ON tenants FOR SELECT USING (is_active = true);
CREATE POLICY "Public read services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public read appointments" ON appointments FOR SELECT USING (true);
CREATE POLICY "Public insert appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read slot_locks" ON slot_locks FOR SELECT USING (true);
CREATE POLICY "Public insert slot_locks" ON slot_locks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert waitlist" ON waitlist FOR INSERT WITH CHECK (true);

-- ============================================================
-- UPDATED_AT TRİGGERLERİ
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_form_schemas_updated_at BEFORE UPDATE ON form_schemas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- EXPIRED SLOT LOCK TEMİZLEME FONKSİYONU
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void AS $$
BEGIN
  DELETE FROM slot_locks WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
