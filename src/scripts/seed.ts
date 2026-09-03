import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually without external dependencies
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...vals] = trimmed.split('=');
          const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
          if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
          if (key.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseAnonKey = val;
        }
      });
    }
  } catch (e) {
    console.warn('Could not read .env.local directly');
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ortam değişkenleri tanımlanmalıdır.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const businessesData = [
  {
    name: 'Dr. Ahmet Yılmaz Diş Kliniği',
    category: 'Sağlık & Diş',
    slug: 'dr-ahmet',
    services: [
      { name: 'İmplant Konsültasyonu', duration_minutes: 30, price_text: 'Ücretsiz', description: 'Ön muayene ve 3D tomografi planlama' },
      { name: 'Estetik Gülüş Tasarımı', duration_minutes: 45, price_text: '₺1.500', description: 'Zirkonyum ve lamine kaplama ön analizi' },
      { name: 'Diş Beyazlatma (Bleaching)', duration_minutes: 60, price_text: '₺3.000', description: 'Tek seansta lazerli beyazlatma' },
      { name: 'Kanal Tedavisi & Dolgu', duration_minutes: 60, price_text: '₺1.200', description: 'Ağrısız endodontik müdahale' },
    ]
  },
  {
    name: 'Studio Nova Kuaför & Güzellik',
    category: 'Güzellik & Kuaför',
    slug: 'studio-nova',
    services: [
      { name: 'Saç Kesimi & Styling', duration_minutes: 45, price_text: '₺450', description: 'Yüz şekline özel kesim ve fön' },
      { name: 'Sombre & Balayage', duration_minutes: 120, price_text: '₺2.800', description: 'Doğal renk geçişli renklendirme' },
      { name: 'Keratin Bakımı & Botoks', duration_minutes: 90, price_text: '₺1.800', description: 'Yıpranmış saçlar için yoğun onarım' },
      { name: 'Manikür & Pedikür (Kalıcı Oje)', duration_minutes: 60, price_text: '₺650', description: 'Medikal el ve ayak bakımı' },
    ]
  },
  {
    name: 'Uzm. Psk. Melis Aktaş Danışmanlık',
    category: 'Psikoloji & Terapi',
    slug: 'psk-melis',
    services: [
      { name: 'Bireysel Yetişkin Terapisi', duration_minutes: 50, price_text: '₺1.750', description: 'Bilişsel Davranışçı Terapi (BDT) seansı' },
      { name: 'Çift ve Aile Terapisi', duration_minutes: 75, price_text: '₺2.400', description: 'İlişki dinamikleri ve iletişim odaklı seans' },
      { name: 'EMDR Travma Terapisi', duration_minutes: 60, price_text: '₺2.000', description: 'Göz hareketleriyle duyarsızlaştırma' },
      { name: 'Online Terapi Görüşmesi', duration_minutes: 50, price_text: '₺1.500', description: 'Zoom/Google Meet üzerinden görüntülü seans' },
    ]
  },
  {
    name: 'Apex Hukuk & Arabuluculuk',
    category: 'Danışmanlık & Hukuk',
    slug: 'apex-hukuk',
    services: [
      { name: 'Ticaret Hukuku Danışmanlığı', duration_minutes: 45, price_text: '₺2.500', description: 'Şirket sözleşmeleri ve regülasyon analizi' },
      { name: 'İş Hukuku ve Arabuluculuk', duration_minutes: 60, price_text: '₺2.000', description: 'İşçi-işveren uyuşmazlık çözümü' },
      { name: 'Gayrimenkul Hukuku Danışmanlığı', duration_minutes: 45, price_text: '₺2.200', description: 'Tapu, kira ve tahliye danışmanlığı' },
    ]
  },
  {
    name: 'FitLife Bireysel Antrenörlük',
    category: 'Spor & Fitness',
    slug: 'fitlife-studio',
    services: [
      { name: 'Postür & Vücut Analizi', duration_minutes: 40, price_text: '₺500', description: 'InBody ölçümü ve duruş bozukluğu testi' },
      { name: '1e1 Personal Training Seansı', duration_minutes: 60, price_text: '₺900', description: 'Kişiye özel hipertrofi ve yağ yakım antrenmanı' },
      { name: 'Klinik Pilates & Reformer', duration_minutes: 50, price_text: '₺800', description: 'Omurga sağlığı ve esneklik seansı' },
    ]
  },
  {
    name: 'Dyt. Selin Erdem Beslenme Kliniği',
    category: 'Sağlık & Beslenme',
    slug: 'dyt-selin',
    services: [
      { name: 'İlk Muayene & Beslenme Programı', duration_minutes: 45, price_text: '₺1.200', description: 'Detaylı vücut analizi ve 1 aylık liste' },
      { name: 'Haftalık Kontrol Seansı', duration_minutes: 20, price_text: '₺600', description: 'Ölçüm takibi ve liste revizyonu' },
      { name: 'Online Diyet Takip Paketi', duration_minutes: 30, price_text: '₺2.500', description: 'WhatsApp destekli aylık diyet programı' },
    ]
  },
  {
    name: 'Garaj 34 Detailing & Seramik',
    category: 'Otomotiv & Bakım',
    slug: 'garaj-34',
    services: [
      { name: 'Detaylı İç & Dış Yıkama', duration_minutes: 90, price_text: '₺750', description: 'Koltuk yıkama ve nano cila uygulaması' },
      { name: 'Pasta Cila & Boya Koruma', duration_minutes: 180, price_text: '₺4.500', description: '3 aşamalı çizik giderme ve parlaklık' },
      { name: '9H Seramik Kaplama', duration_minutes: 240, price_text: '₺12.000', description: '3 yıl garantili seramik zırh koruması' },
    ]
  },
  {
    name: 'Luna Fotoğrafçılık & Prodüksiyon',
    category: 'Sanat & Fotoğraf',
    slug: 'luna-studio',
    services: [
      { name: 'Kurumsal Portre & Headshot', duration_minutes: 45, price_text: '₺1.800', description: 'LinkedIn ve web sitesi için 5 retouche foto' },
      { name: 'Ürün & E-Ticaret Çekimi', duration_minutes: 120, price_text: '₺4.000', description: 'Beyaz fonda 20 ürün fotoğrafı' },
      { name: 'Dış Çekim & Düğün Hikayesi', duration_minutes: 180, price_text: '₺8.500', description: 'Albüm ve video klip dahil çekim' },
    ]
  }
];

const customerNames = [
  'Caner Öztürk', 'Burcu Çelik', 'Emre Demir', 'Elif Yılmaz', 'Mert Aksoy',
  'Ayşe Gündoğan', 'Kemal Şahin', 'Seda Kılıç', 'Tolga Arslan', 'Zehra Aydın',
  'Kaan Bozkurt', 'Büşra Yıldız', 'Onur Karaca', 'Deniz Güler', 'Pelin Koç',
  'Volkan Polat', 'Ece Doğan', 'Alperen Çetin', 'Gözde Korkmaz', 'Serkan Kurt'
];

async function seed() {
  console.log('🚀 Supabase Seeding işlemi başlatılıyor...');
  console.log(`📡 Bağlantı URL: ${supabaseUrl}`);

  for (const b of businessesData) {
    // 1. Check or Insert Business
    let businessId: string;
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', b.slug)
      .single();

    if (existing) {
      businessId = existing.id;
      console.log(`✓ İşletme mevcut: ${b.name} (${b.slug})`);
    } else {
      const { data: inserted, error: bErr } = await supabase
        .from('businesses')
        .insert([{ name: b.name, category: b.category, slug: b.slug }])
        .select()
        .single();

      if (bErr || !inserted) {
        console.error(`X İşletme eklenemedi: ${b.name}`, bErr?.message);
        continue;
      }
      businessId = inserted.id;
      console.log(`+ Yeni işletme eklendi: ${b.name}`);
    }

    // 2. Insert Services
    const serviceIds: string[] = [];
    for (const s of b.services) {
      const { data: existingService } = await supabase
        .from('services')
        .select('id')
        .eq('business_id', businessId)
        .eq('name', s.name)
        .single();

      if (existingService) {
        serviceIds.push(existingService.id);
      } else {
        const { data: sInserted, error: sErr } = await supabase
          .from('services')
          .insert([{
            business_id: businessId,
            name: s.name,
            duration_minutes: s.duration_minutes,
            price_text: s.price_text,
            description: s.description
          }])
          .select()
          .single();

        if (sInserted) {
          serviceIds.push(sInserted.id);
          console.log(`  + Hizmet eklendi: ${s.name}`);
        }
      }
    }

    // 3. Insert Dummy Appointments for this business
    if (serviceIds.length > 0) {
      const appointmentsToInsert = [];
      const times = ['09:00', '10:00', '11:30', '14:00', '15:30', '16:45', '17:30'];
      const statuses = ['confirmed', 'confirmed', 'confirmed', 'pending', 'cancelled'];
      
      for (let i = 0; i < 5; i++) {
        const randomCustomer = customerNames[Math.floor(Math.random() * customerNames.length)];
        const randomServiceId = serviceIds[Math.floor(Math.random() * serviceIds.length)];
        const randomTime = times[Math.floor(Math.random() * times.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + (i % 7) + 1);
        const dateStr = targetDate.toISOString().split('T')[0];

        appointmentsToInsert.push({
          business_id: businessId,
          service_id: randomServiceId,
          customer_name: `${randomCustomer} ${i + 1}`,
          customer_phone: `0532 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(10 + Math.random() * 90)} ${Math.floor(10 + Math.random() * 90)}`,
          customer_note: 'Online randevu formu üzerinden otomatik oluşturuldu.',
          appointment_date: dateStr,
          appointment_time: `${randomTime}:00`,
          status: randomStatus
        });
      }

      const { error: appErr } = await supabase.from('appointments').insert(appointmentsToInsert);
      if (!appErr) {
        console.log(`  ✓ 5 adet örnek randevu eklendi: ${b.name}`);
      } else {
        console.warn(`  ! Randevu ekleme uyarısı:`, appErr.message);
      }
    }
  }

  console.log('🎉 Veritabanı doldurma (Seeding) tamamlandı!');
}

seed();
