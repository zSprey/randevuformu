import nodemailer from 'nodemailer';

// SMTP Transporter yapılandırması
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'randevuformuu@gmail.com',
    pass: process.env.SMTP_PASS || '',
  },
});

const SENDER_EMAIL = '"RandevuFormu Destek" <randevuformuu@gmail.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://randevuformu.com';

/**
 * İşletme Kayıt Aktivasyon / E-Posta Doğrulama E-postası
 */
export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <title>E-posta Adresinizi Doğrulayın</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; color: #18181b; margin: 0; padding: 24px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .logo { font-size: 20px; font-weight: 800; color: #09090b; letter-spacing: -0.5px; margin-bottom: 24px; }
        .logo span { color: #2563eb; }
        h1 { font-size: 22px; font-weight: 700; color: #09090b; margin-bottom: 16px; line-height: 1.3; }
        p { font-size: 15px; line-height: 1.6; color: #52525b; margin-bottom: 24px; }
        .btn { display: inline-block; background-color: #18181b; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 10px; min-height: 44px; text-align: center; }
        .btn:hover { background-color: #27272a; }
        .footer { margin-top: 36px; padding-top: 24px; border-top: 1px solid #f4f4f5; font-size: 12px; color: #a1a1aa; line-height: 1.5; }
        .link-text { word-break: break-all; color: #71717a; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Randevu<span>Formu</span></div>
        <h1>Hoş Geldiniz, ${name}!</h1>
        <p>İşletmenizi RandevuFormu platformuna başarıyla kaydettiniz. Hesabınızı güvenle aktif etmek ve randevu yönetim panelinize erişmek için lütfen aşağıdaki butona tıklayın:</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" class="btn" target="_blank">Hesabımı Doğrula ve Başla</a>
        </div>
        
        <p>Eğer butona tıklayamıyorsanız, aşağıdaki bağlantıyı kopyalayıp tarayıcınızın adres çubuğuna yapıştırabilirsiniz:</p>
        <p class="link-text"><a href="${verifyUrl}">${verifyUrl}</a></p>
        
        <div class="footer">
          Bu e-posta, RandevuFormu.com üzerinde yeni bir işletme kaydı oluşturulduğu için gönderilmiştir. Eğer bu kaydı siz yapmadıysanız bu mesajı güvenle yok sayabilirsiniz.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: SENDER_EMAIL,
      to: email,
      subject: 'Hesabınızı Doğrulayın | RandevuFormu',
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email Error] Verification email failed:', error);
    return { success: false, error };
  }
}

/**
 * Şifre Sıfırlama E-postası
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <title>Şifrenizi Sıfırlayın</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; color: #18181b; padding: 24px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 40px 32px; }
        .btn { display: inline-block; background-color: #18181b; color: #ffffff !important; text-decoration: none; font-weight: 600; padding: 14px 28px; border-radius: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Şifre Sıfırlama Talebi</h2>
        <p>RandevuFormu hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni bir şifre belirlemek için aşağıdaki bağlantıyı kullanabilirsiniz:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" class="btn">Şifremi Sıfırla</a>
        </div>
        <p style="font-size: 12px; color: #a1a1aa;">Bu bağlantı 1 saat boyunca geçerlidir.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: SENDER_EMAIL,
      to: email,
      subject: 'Şifre Sıfırlama Talebi | RandevuFormu',
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error('[Email Error] Password reset email failed:', error);
    return { success: false, error };
  }
}

/**
 * Yeni İşletme Kayıt Başvurusu Geldiğinde Yöneticiye Bildirim E-postası
 */
export async function sendAdminNewApplicationNotification(app: {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  category: string;
  city?: string;
  district?: string;
  website?: string;
  location_url?: string;
}) {
  const adminUrl = `${APP_URL}/admin`;
  const cleanPhone = app.phone.replace(/[^0-9]/g, "");
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("90") ? cleanPhone : "90" + cleanPhone}` : "";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <title>Yeni İşletme Kayıt Başvurusu</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A0F1D; color: #F8FAFC; margin: 0; padding: 24px; }
        .box { max-width: 580px; margin: 0 auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 16px; padding: 32px; }
        .badge { display: inline-block; background: #0284C7; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; }
        h1 { font-size: 20px; font-weight: 700; color: #F8FAFC; margin: 16px 0 8px 0; }
        p { font-size: 14px; color: #94A3B8; line-height: 1.5; margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .table td { padding: 10px 12px; border-bottom: 1px solid #1E293B; font-size: 13px; }
        .table td.lbl { color: #64748B; width: 35%; font-weight: 600; }
        .table td.val { color: #F1F5F9; font-weight: 500; }
        .btn-primary { display: inline-block; background: #0062FF; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; margin-right: 10px; }
        .btn-secondary { display: inline-block; background: #22C55E; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; }
        .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 11px; color: #64748B; }
      </style>
    </head>
    <body>
      <div class="box">
        <span class="badge">Yeni Başvuru Alındı</span>
        <h1>🔔 Yeni İşletme Kaydı: ${app.business_name}</h1>
        <p>Platform üzerinden yeni bir işletme kayıt başvurusu yapıldı. Detaylar aşağıdadır:</p>

        <table class="table">
          <tr><td class="lbl">İşletme Adı:</td><td class="val">${app.business_name}</td></tr>
          <tr><td class="lbl">Yetkili Kişi:</td><td class="val">${app.owner_name}</td></tr>
          <tr><td class="lbl">Kategori / Sektör:</td><td class="val"><strong>${app.category}</strong></td></tr>
          <tr><td class="lbl">E-posta:</td><td class="val"><a href="mailto:${app.email}" style="color: #38BDF8;">${app.email}</a></td></tr>
          <tr><td class="lbl">Telefon / WhatsApp:</td><td class="val"><a href="tel:${app.phone}" style="color: #38BDF8;">${app.phone}</a></td></tr>
          ${app.city ? `<tr><td class="lbl">Konum / Şehir:</td><td class="val">${app.city}${app.district ? ` / ${app.district}` : ""}</td></tr>` : ""}
          ${app.website ? `<tr><td class="lbl">Web Sitesi:</td><td class="val"><a href="${app.website}" style="color: #38BDF8;" target="_blank">${app.website}</a></td></tr>` : ""}
          ${app.location_url ? `<tr><td class="lbl">Harita Konumu:</td><td class="val"><a href="${app.location_url}" style="color: #38BDF8;" target="_blank">Haritada Gör</a></td></tr>` : ""}
        </table>

        <div style="margin: 24px 0;">
          <a href="${adminUrl}" class="btn-primary" target="_blank">Admin Panelinde İncele &amp; Onayla →</a>
          ${waUrl ? `<a href="${waUrl}" class="btn-secondary" target="_blank">WhatsApp'tan Ulaş</a>` : ""}
        </div>

        <div class="footer">
          RandevuFormu Super Admin Otomasyon Bildirimi • ${new Date().toLocaleString("tr-TR")}
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const adminEmail = process.env.SMTP_USER || "randevuformuu@gmail.com";
    await transporter.sendMail({
      from: SENDER_EMAIL,
      to: adminEmail,
      subject: `🔔 Yeni İşletme Kayıt Başvurusu: ${app.business_name} (${app.category})`,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error("[Email Error] Admin notification failed:", error);
    return { success: false, error };
  }
}

/**
 * İşletme Başvurusu Onaylandığında İşletme Sahibine Tebrik & Giriş E-postası
 */
export async function sendBusinessApprovedNotification(
  email: string,
  ownerName: string,
  businessName: string
) {
  const loginUrl = `${APP_URL}/login`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <title>RandevuFormu Hesabınız Onaylandı</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; color: #18181b; margin: 0; padding: 24px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .badge { display: inline-block; background: #DCFCE7; color: #15803D; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
        h1 { font-size: 22px; font-weight: 700; color: #09090b; margin-bottom: 12px; }
        p { font-size: 15px; line-height: 1.6; color: #52525b; margin-bottom: 20px; }
        .btn { display: inline-block; background-color: #0062FF; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-align: center; }
        .footer { margin-top: 36px; padding-top: 24px; border-top: 1px solid #f4f4f5; font-size: 12px; color: #a1a1aa; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="badge">✓ Başvurunuz Onaylandı</span>
        <h1>Tebrikler Sayın ${ownerName}!</h1>
        <p><strong>${businessName}</strong> için yaptığınız RandevuFormu kayıt başvurusu incelendi ve başarıyla onaylandı.</p>
        <p>Artık işletme yönetim panelinize giriş yapabilir; hizmetlerinizi, çalışma saatlerinizi ve randevu takviminizi dilediğiniz gibi yapılandırabilirsiniz.</p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${loginUrl}" class="btn" target="_blank">Yönetim Paneline Giriş Yap →</a>
        </div>

        <p style="font-size: 13px; color: #71717a;">Kayıt olurken belirlediğiniz e-posta ve şifrenizle giriş yapabilirsiniz.</p>

        <div class="footer">
          RandevuFormu.com • Türkiye'nin Yeni Nesil Randevu Platformu<br>
          Destek ve sorularınız için bize her zaman yanıt verebilirsiniz.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: SENDER_EMAIL,
      to: email,
      subject: `🎉 RandevuFormu Hesabınız Onaylandı! (${businessName})`,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error("[Email Error] Approval notification failed:", error);
    return { success: false, error };
  }
}

