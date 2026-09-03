import prisma from '@/lib/prisma';

export interface ReputationResult {
  phone: string;
  riskScore: number; // 0 - 100
  requiresMandatoryDeposit: boolean;
  completedCount: number;
  noShowCount: number;
  badge: 'Güvenilir Danışan' | 'Standart' | 'Riskli Danışan (Kapora Zorunlu)';
}

/**
 * Modül 5: "Gelmeyen Müşteri" Risk Radarı & No-Show Skoru
 * Telefon numarasına göre müşteri itibarını analiz eder.
 */
export async function getCustomerReputation(customerPhone: string): Promise<ReputationResult> {
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');

  try {
    const reputation = await prisma.customerReputation.findUnique({
      where: { customerPhone: cleanPhone },
    });

    if (!reputation) {
      return {
        phone: cleanPhone,
        riskScore: 0,
        requiresMandatoryDeposit: false,
        completedCount: 0,
        noShowCount: 0,
        badge: 'Standart',
      };
    }

    const { riskScore, completedCount, noShowCount } = reputation;

    // Risk skoru > 40 ise zorunlu kapora uygulanır
    const requiresMandatoryDeposit = riskScore >= 40 || (noShowCount > 1 && completedCount < 2);

    let badge: ReputationResult['badge'] = 'Standart';
    if (requiresMandatoryDeposit) {
      badge = 'Riskli Danışan (Kapora Zorunlu)';
    } else if (completedCount >= 3 && noShowCount === 0) {
      badge = 'Güvenilir Danışan';
    }

    return {
      phone: cleanPhone,
      riskScore,
      requiresMandatoryDeposit,
      completedCount,
      noShowCount,
      badge,
    };
  } catch (error) {
    console.warn('No-Show Radar error, returning default safe profile:', error);
    return {
      phone: cleanPhone,
      riskScore: 0,
      requiresMandatoryDeposit: false,
      completedCount: 0,
      noShowCount: 0,
      badge: 'Standart',
    };
  }
}

/**
 * Başarıyla Tamamlanan Seansı Kaydet (Risk Skorunu Düşürür)
 */
export async function recordCompletedAppointment(customerPhone: string) {
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');

  try {
    const current = await prisma.customerReputation.findUnique({
      where: { customerPhone: cleanPhone },
    });

    const newCompleted = (current?.completedCount || 0) + 1;
    const noShow = current?.noShowCount || 0;
    
    // Risk Skoru Formülü: No-show ağırlıklı oran
    const calculatedRisk = Math.max(0, Math.min(100, Math.round((noShow / (newCompleted + noShow * 2)) * 100)));

    await prisma.customerReputation.upsert({
      where: { customerPhone: cleanPhone },
      create: {
        customerPhone: cleanPhone,
        completedCount: 1,
        noShowCount: 0,
        riskScore: 0,
      },
      update: {
        completedCount: newCompleted,
        riskScore: calculatedRisk,
      },
    });
  } catch (err) {
    console.warn('Record completed appointment failed:', err);
  }
}

/**
 * Gelmeyen (No-Show) Seansı Kaydet (Risk Skorunu Yükseltir)
 */
export async function recordNoShowAppointment(customerPhone: string) {
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');

  try {
    const current = await prisma.customerReputation.findUnique({
      where: { customerPhone: cleanPhone },
    });

    const completed = current?.completedCount || 0;
    const newNoShow = (current?.noShowCount || 0) + 1;

    // Yüksek no-show cezası: Her no-show riski en az 35 puan artırır
    const calculatedRisk = Math.min(100, Math.round((newNoShow / (completed + newNoShow)) * 100) + 20);

    await prisma.customerReputation.upsert({
      where: { customerPhone: cleanPhone },
      create: {
        customerPhone: cleanPhone,
        completedCount: 0,
        noShowCount: 1,
        riskScore: 50, // İlk no-show'da doğrudan %50 risk
      },
      update: {
        noShowCount: newNoShow,
        riskScore: calculatedRisk,
      },
    });
  } catch (err) {
    console.warn('Record no-show failed:', err);
  }
}
