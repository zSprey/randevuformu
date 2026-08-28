export interface PackageDefinition {
  id: string;
  name: string;
  serviceCategory: string;
  totalSessions: number;
  price: number;
  validityDays: number;
  description: string;
}

export interface ClientPackageBalance {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  packageId: string;
  packageName: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  purchaseDate: string;
  expiresAt: string;
  invoiceNumber?: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED";
}

export const INITIAL_PACKAGES: PackageDefinition[] = [
  {
    id: "pkg-1",
    name: "10 Seans Reformer Pilates & Postür",
    serviceCategory: "Pilates & Spor",
    totalSessions: 10,
    price: 9500,
    validityDays: 90,
    description: "Birebir eğitmen eşliğinde 10 seanslık reformer ve esneme programı.",
  },
  {
    id: "pkg-2",
    name: "6 Seans Medikal Cilt Bakımı & Yenileme",
    serviceCategory: "Güzellik & Estetik",
    totalSessions: 6,
    price: 7200,
    validityDays: 120,
    description: "Hydrafacial, peeling ve mezoterapi kombinasyonlu 6 seanslık bakım.",
  },
  {
    id: "pkg-3",
    name: "5 Seans Klinik Psikoterapi & Danışmanlık",
    serviceCategory: "Psikoloji & Terapi",
    totalSessions: 5,
    price: 8000,
    validityDays: 60,
    description: "Bilişsel davranışçı terapi odaklı 5 haftalık online/yüzyüze seans.",
  },
  {
    id: "pkg-4",
    name: "8 Seans Manuel Terapi & Fizyoterapi",
    serviceCategory: "Fizyoterapi & Sağlık",
    totalSessions: 8,
    price: 11000,
    validityDays: 90,
    description: "Bel, boyun ve omurga rehabilitasyonu için 8 seanslık uzman protokolü.",
  },
];

export const INITIAL_CLIENT_PACKAGES: ClientPackageBalance[] = [
  {
    id: "cp-1",
    clientId: "cl-101",
    clientName: "Zeynep Demir",
    clientPhone: "0532 111 22 33",
    packageId: "pkg-2",
    packageName: "6 Seans Medikal Cilt Bakımı & Yenileme",
    totalSessions: 6,
    usedSessions: 2,
    remainingSessions: 4,
    purchaseDate: "2026-07-15",
    expiresAt: "2026-11-15",
    invoiceNumber: "EAR202600000142",
    status: "ACTIVE",
  },
  {
    id: "cp-2",
    clientId: "cl-102",
    clientName: "Mehmet Can Yıldız",
    clientPhone: "0544 222 33 44",
    packageId: "pkg-1",
    packageName: "10 Seans Reformer Pilates & Postür",
    totalSessions: 10,
    usedSessions: 3,
    remainingSessions: 7,
    purchaseDate: "2026-06-01",
    expiresAt: "2026-09-01",
    invoiceNumber: "EAR202600000118",
    status: "ACTIVE",
  },
];

export class PackageEngine {
  /**
   * Deduct 1 session atomically from a client's package balance
   */
  public static deductSession(packageBalance: ClientPackageBalance): {
    success: boolean;
    remaining: number;
    message: string;
  } {
    if (packageBalance.remainingSessions <= 0) {
      return {
        success: false,
        remaining: 0,
        message: "Paket bakiyesinde kullanılabilir seans kalmadı.",
      };
    }

    const remaining = packageBalance.remainingSessions - 1;
    packageBalance.usedSessions += 1;
    packageBalance.remainingSessions = remaining;

    if (remaining === 0) {
      packageBalance.status = "COMPLETED";
    }

    return {
      success: true,
      remaining,
      message: `1 seans düşüldü. Kalan seans: ${remaining}`,
    };
  }
}
