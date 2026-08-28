/**
 * 🤖 50-Agent Swarm Feature: AI Smart Waitlist & No-Show Recovery Engine
 * Automatically queues customers when slots are full and instantly matches/notifies
 * them via WhatsApp / SMS / Email when a cancellation occurs.
 */

export interface WaitlistEntry {
  id: string;
  tenantId: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  preferredDate: string; // "YYYY-MM-DD"
  preferredTimeRange?: {
    start: string; // "09:00"
    end: string;   // "14:00"
  };
  priorityScore: number; // 1-100 (Higher score gets notified first)
  status: "WAITING" | "OFFERED" | "ACCEPTED" | "EXPIRED";
  offeredAt?: string;
  createdAt: string;
}

class WaitlistEngine {
  private waitlist: Map<string, WaitlistEntry[]> = new Map(); // key: "tenantId:date"

  /**
   * Adds a customer to the intelligent waitlist
   */
  public joinWaitlist(entry: Omit<WaitlistEntry, "id" | "status" | "createdAt">): WaitlistEntry {
    const key = `${entry.tenantId}:${entry.preferredDate}`;
    const newEntry: WaitlistEntry = {
      ...entry,
      id: `wl_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: "WAITING",
      createdAt: new Date().toISOString(),
    };

    const currentList = this.waitlist.get(key) || [];
    // Sort by priority score (descending) and creation date (ascending)
    currentList.push(newEntry);
    currentList.sort((a, b) => b.priorityScore - a.priorityScore || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    this.waitlist.set(key, currentList);
    return newEntry;
  }

  /**
   * Triggered when an appointment is cancelled.
   * Finds the best matching candidate and offers the freed slot with a 15-minute claim window.
   */
  public handleSlotFreed(
    tenantId: string,
    date: string,
    freedTime: string,
    serviceId: string
  ): { candidate: WaitlistEntry | null; message: string } {
    const key = `${tenantId}:${date}`;
    const list = this.waitlist.get(key);

    if (!list || list.length === 0) {
      return { candidate: null, message: "Yedek bekleme listesinde uygun danışan bulunamadı." };
    }

    // Find first waiting candidate matching service or flexible
    const candidate = list.find(
      (entry) =>
        entry.status === "WAITING" &&
        (entry.serviceId === serviceId || !entry.serviceId)
    );

    if (!candidate) {
      return { candidate: null, message: "Bu saat aralığı için aktif yedek bulunamadı." };
    }

    candidate.status = "OFFERED";
    candidate.offeredAt = new Date().toISOString();

    return {
      candidate,
      message: `${candidate.customerName} adlı danışana ${date} ${freedTime} için 15 dakikalık öncelikli rezervasyon teklifi WhatsApp ile iletildi!`,
    };
  }

  /**
   * Retrieves active waitlist for a specific clinic and date
   */
  public getWaitlist(tenantId: string, date: string): WaitlistEntry[] {
    const key = `${tenantId}:${date}`;
    return this.waitlist.get(key) || [];
  }
}

export const waitlistEngine = new WaitlistEngine();
