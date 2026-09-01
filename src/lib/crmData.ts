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

export const INITIAL_CLIENTS: ClientProfile[] = [];
