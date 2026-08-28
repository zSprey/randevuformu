import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  apiSuccess,
  apiBadRequest,
  handleApiError,
} from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, company, email, message } = body;

    if (!name || !email || !message) {
      return apiBadRequest("Lütfen isim, e-posta ve mesaj alanlarını eksiksiz doldurun.");
    }

    // SMTP Configuration
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER || "randevuformuu@gmail.com";
    const pass = process.env.SMTP_PASS || "";

    // HTML Email Content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 700;">Yeni B2B Kurumsal Talep</h2>
          <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">randevuformu.com İletişim Formu</p>
        </div>
        <div style="padding: 24px; color: #1e293b; font-size: 15px; line-height: 1.6;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 120px;">Ad Soyad:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Şirket Adı:</td>
              <td style="padding: 8px 0; color: #0f172a;">${company || "Belirtilmedi"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">E-posta:</td>
              <td style="padding: 8px 0; color: #4f46e5;"><a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a></td>
            </tr>
          </table>
          <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 6px; margin-top: 10px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Mesaj:</p>
            <p style="margin: 0; color: #334155; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
          Bu bildirim randevuformu.com kurumsal altyapısı tarafından iletilmiştir.
        </div>
      </div>
    `;

    if (pass) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"randevuformu.com İletişim" <${user}>`,
        to: "randevuformuu@gmail.com",
        replyTo: email,
        subject: `[B2B İletişim] ${company ? `${company} - ` : ""}${name}`,
        html: htmlContent,
      });
    } else {
      console.log("[Contact API] Dev Mode: Logging contact submission:", { name, company, email, message });
    }

    return apiSuccess({}, "Mesajınız başarıyla iletildi.");
  } catch (error: any) {
    return handleApiError(error, "Mesaj gönderilirken bir hata oluştu.");
  }
}
