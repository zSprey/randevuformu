export interface TreatmentRecord {
  id: string;
  date: string;
  title: string;
  doctorName: string;
  notes: string;
  prescription?: string;
  cost: number;
  status: "COMPLETED" | "SCHEDULED" | "CANCELLED";
}

export interface BeforeAfterMedia {
  id: string;
  treatmentTitle: string;
  date: string;
  beforeImage: string;
  afterImage: string;
  notes: string;
}

export interface ClientProfile {
  id: string;
  fullName: string;
  identityNumber?: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  allergies: string[];
  chronicConditions: string[];
  bloodType: string;
  totalSpent: number;
  loyaltyPoints: number;
  packageBalance: {
    packageName: string;
    totalSessions: number;
    remainingSessions: number;
    expiresAt: string;
  } | null;
  treatments: TreatmentRecord[];
  mediaGallery: BeforeAfterMedia[];
  status: "ACTIVE" | "VIP" | "INACTIVE";
  createdAt: string;
}

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: "cl-101",
    fullName: "Zeynep Demir",
    identityNumber: "12345678901",
    phone: "0532 111 22 33",
    email: "zeynep.demir@example.com",
    birthDate: "1994-05-14",
    gender: "FEMALE",
    allergies: ["Penisilin", "Lokal Anestezi Hassasiyeti"],
    chronicConditions: ["Hafif Astım"],
    bloodType: "A Rh+",
    totalSpent: 12500,
    loyaltyPoints: 1250,
    packageBalance: {
      packageName: "6 Seans Lazer & Cilt Bakımı",
      totalSessions: 6,
      remainingSessions: 4,
      expiresAt: "2026-12-31",
    },
    status: "VIP",
    createdAt: "2026-01-15",
    mediaGallery: [
      {
        id: "media-1",
        treatmentTitle: "Zirkonyum Gülüş Tasarımı",
        date: "2026-07-10",
        beforeImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80",
        afterImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80",
        notes: "4 üye üst çene zirkonyum kaplama tamamlandı.",
      },
    ],
    treatments: [
      {
        id: "tr-1",
        date: "2026-08-20",
        title: "Zirkonyum Kaplama & Polisaj",
        doctorName: "Dr. Ahmet Yılmaz",
        notes: "Diş eti uyumu mükemmel, oklüzyon kontrol edildi.",
        prescription: "Gargara ve yumuşak fırça önerildi.",
        cost: 6500,
        status: "COMPLETED",
      },
      {
        id: "tr-2",
        date: "2026-06-12",
        title: "Kanal Tedavisi (Sol Alt 6)",
        doctorName: "Dr. Ahmet Yılmaz",
        notes: "2 kanal temizlendi ve dolduruldu.",
        cost: 3200,
        status: "COMPLETED",
      },
    ],
  },
  {
    id: "cl-102",
    fullName: "Mehmet Can Yıldız",
    identityNumber: "28491029384",
    phone: "0544 222 33 44",
    email: "mehmet.yildiz@example.com",
    birthDate: "1988-11-03",
    gender: "MALE",
    allergies: ["Yok"],
    chronicConditions: ["Hipertansiyon"],
    bloodType: "0 Rh+",
    totalSpent: 8400,
    loyaltyPoints: 840,
    packageBalance: {
      packageName: "10 Seans Reformer Pilates",
      totalSessions: 10,
      remainingSessions: 7,
      expiresAt: "2026-11-01",
    },
    status: "ACTIVE",
    createdAt: "2026-03-20",
    mediaGallery: [],
    treatments: [
      {
        id: "tr-3",
        date: "2026-08-15",
        title: "Diş Taşı Temizliği & Florür",
        doctorName: "Dr. Ahmet Yılmaz",
        notes: "Tartar temizlendi, diş eti kanaması azaldı.",
        cost: 1400,
        status: "COMPLETED",
      },
    ],
  },
  {
    id: "cl-103",
    fullName: "Ayşe Nur Şahin",
    identityNumber: "91827364510",
    phone: "0555 333 44 55",
    email: "ayse.sahin@example.com",
    birthDate: "1997-09-22",
    gender: "FEMALE",
    allergies: ["Lateks"],
    chronicConditions: ["Yok"],
    bloodType: "B Rh+",
    totalSpent: 4500,
    loyaltyPoints: 450,
    packageBalance: null,
    status: "ACTIVE",
    createdAt: "2026-07-01",
    mediaGallery: [],
    treatments: [
      {
        id: "tr-4",
        date: "2026-07-28",
        title: "Kompozit Dolgu",
        doctorName: "Dr. Ahmet Yılmaz",
        notes: "Sağ üst 4 numara estetik dolgu yapıldı.",
        cost: 2200,
        status: "COMPLETED",
      },
    ],
  },
];
