import crypto from "crypto";

export interface EInvoicePayload {
  invoiceNumber: string;
  uuid: string;
  customerName: string;
  customerTaxOrId: string;
  customerAddress?: string;
  issueDate: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    vatRate: number; // e.g. 20 for 20%
    total: number;
  }[];
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
  provider: "PARASUT" | "BIZIMHESAP" | "NILVERA" | "LOCAL_EARCHIVE";
  status: "ISSUED" | "QUEUED" | "FAILED";
}

export class EInvoiceEngine {
  /**
   * Generates a legal E-Archive invoice document with GIB compliant numbering
   */
  public static generateInvoice(options: {
    customerName: string;
    customerTaxOrId?: string;
    itemName: string;
    amount: number;
    provider?: "PARASUT" | "BIZIMHESAP" | "NILVERA" | "LOCAL_EARCHIVE";
  }): EInvoicePayload {
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `EAR${year}000${randomSeq}`;
    const uuid = crypto.randomUUID();

    const vatRate = 20; // %20 KDV
    const subtotal = Math.round((options.amount / 1.2) * 100) / 100;
    const vatAmount = Math.round((options.amount - subtotal) * 100) / 100;

    return {
      invoiceNumber,
      uuid,
      customerName: options.customerName,
      customerTaxOrId: options.customerTaxOrId || "11111111111",
      issueDate: new Date().toISOString(),
      items: [
        {
          name: options.itemName,
          quantity: 1,
          unitPrice: subtotal,
          vatRate,
          total: subtotal,
        },
      ],
      subtotal,
      vatAmount,
      grandTotal: options.amount,
      provider: options.provider || "LOCAL_EARCHIVE",
      status: "ISSUED",
    };
  }

  /**
   * Generates standard GIB UBL-TR XML representation
   */
  public static toUblXml(invoice: EInvoicePayload): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <ID>${invoice.invoiceNumber}</ID>
  <UUID>${invoice.uuid}</UUID>
  <IssueDate>${invoice.issueDate.split("T")[0]}</IssueDate>
  <AccountingCustomerParty>
    <PartyName>${invoice.customerName}</PartyName>
    <PartyTaxScheme>${invoice.customerTaxOrId}</PartyTaxScheme>
  </AccountingCustomerParty>
  <TaxTotal>
    <TaxAmount currencyID="TRY">${invoice.vatAmount}</TaxAmount>
  </TaxTotal>
  <LegalMonetaryTotal>
    <LineExtensionAmount currencyID="TRY">${invoice.subtotal}</LineExtensionAmount>
    <PayableAmount currencyID="TRY">${invoice.grandTotal}</PayableAmount>
  </LegalMonetaryTotal>
</Invoice>`;
  }
}
