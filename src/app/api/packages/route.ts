import { NextRequest } from "next/server";
import { INITIAL_PACKAGES, INITIAL_CLIENT_PACKAGES, PackageEngine, ClientPackageBalance } from "@/lib/packageData";
import { EInvoiceEngine } from "@/lib/integrations/eInvoiceEngine";
import { apiSuccess, apiBadRequest, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    return apiSuccess({
      packages: INITIAL_PACKAGES,
      clientPackages: INITIAL_CLIENT_PACKAGES,
    });
  } catch (err) {
    return handleApiError(err, "Paketler listelenirken hata oluştu.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, packageId, clientId, clientName, clientPhone, clientPackageId } = body;

    // Action 1: Deduct Session
    if (action === "DEDUCT_SESSION") {
      const clientPkg = INITIAL_CLIENT_PACKAGES.find((p) => p.id === clientPackageId);
      if (!clientPkg) {
        return apiBadRequest("Geçerli bir müşteri paket bakiyesi bulunamadı.");
      }

      const result = PackageEngine.deductSession(clientPkg);
      if (!result.success) {
        return apiBadRequest(result.message);
      }

      return apiSuccess({
        clientPackage: clientPkg,
        remaining: result.remaining,
      }, result.message);
    }

    // Action 2: Sell / Assign Package to Client
    const pkgDef = INITIAL_PACKAGES.find((p) => p.id === packageId);
    if (!pkgDef) {
      return apiBadRequest("Geçerli bir paket tanımı bulunamadı.");
    }

    // Generate E-Invoice automatically for the package purchase
    const invoice = EInvoiceEngine.generateInvoice({
      customerName: clientName || "Müşteri",
      itemName: pkgDef.name,
      amount: pkgDef.price,
    });

    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + pkgDef.validityDays);

    const newClientPkg: ClientPackageBalance = {
      id: `cp-${Date.now()}`,
      clientId: clientId || `cl-${Date.now()}`,
      clientName: clientName || "Yeni Müşteri",
      clientPhone: clientPhone || "05550000000",
      packageId: pkgDef.id,
      packageName: pkgDef.name,
      totalSessions: pkgDef.totalSessions,
      usedSessions: 0,
      remainingSessions: pkgDef.totalSessions,
      purchaseDate: new Date().toISOString().split("T")[0],
      expiresAt: expiresDate.toISOString().split("T")[0],
      invoiceNumber: invoice.invoiceNumber,
      status: "ACTIVE",
    };

    INITIAL_CLIENT_PACKAGES.unshift(newClientPkg);

    return apiSuccess({
      clientPackage: newClientPkg,
      invoice,
    }, "Paket satışı başarıyla tamamlandı ve e-fatura oluşturuldu.");
  } catch (err) {
    return handleApiError(err, "Paket işlemi sırasında hata oluştu.");
  }
}
