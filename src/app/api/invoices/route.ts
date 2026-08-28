import { NextRequest } from "next/server";
import { EInvoiceEngine, EInvoicePayload } from "@/lib/integrations/eInvoiceEngine";
import { apiSuccess, apiBadRequest, handleApiError } from "@/lib/apiResponse";

const INITIAL_INVOICES: EInvoicePayload[] = [
  EInvoiceEngine.generateInvoice({
    customerName: "Zeynep Demir",
    itemName: "6 Seans Medikal Cilt Bakımı & Yenileme",
    amount: 7200,
    provider: "PARASUT",
  }),
  EInvoiceEngine.generateInvoice({
    customerName: "Mehmet Can Yıldız",
    itemName: "10 Seans Reformer Pilates & Postür",
    amount: 9500,
    provider: "BIZIMHESAP",
  }),
  EInvoiceEngine.generateInvoice({
    customerName: "Ayşe Nur Şahin",
    itemName: "Kompozit Dolgu Tedavisi",
    amount: 2200,
    provider: "LOCAL_EARCHIVE",
  }),
];

export async function GET(req: NextRequest) {
  try {
    return apiSuccess({
      invoices: INITIAL_INVOICES,
    });
  } catch (err) {
    return handleApiError(err, "Faturalar listelenirken hata oluştu.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerTaxOrId, itemName, amount, provider } = body;

    if (!customerName || !amount) {
      return apiBadRequest("Müşteri adı ve tutar zorunludur.");
    }

    const invoice = EInvoiceEngine.generateInvoice({
      customerName,
      customerTaxOrId,
      itemName: itemName || "Hizmet Bedeli",
      amount: Number(amount),
      provider,
    });

    INITIAL_INVOICES.unshift(invoice);

    return apiSuccess({
      invoice,
      xml: EInvoiceEngine.toUblXml(invoice),
    }, "E-Arşiv Fatura başarıyla oluşturuldu.");
  } catch (err) {
    return handleApiError(err, "Fatura oluşturulurken hata meydana geldi.");
  }
}
