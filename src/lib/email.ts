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

const SENDER_EMAIL = '"RandevuFormu" <randevuformuu@gmail.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://randevuformu.com';

/**
 * 1. YENİ İŞLETME KAYDI ALINDIĞINDA İŞLETME SAHİBİNE KURUMSAL HOŞ GELDİNİZ VE ORYANTASYON E-POSTASI
 */
export async function sendBusinessApplicationReceivedNotification(app: {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  category: string;
  city?: string;
  district?: string;
  slug?: string;
}) {
  const customSlug = app.slug || app.business_name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  const previewUrl = `${APP_URL}/${customSlug}`;
  const waSupportUrl = "https://wa.me/905384809001?text=" + encodeURIComponent(`Merhaba RandevuFormu ekibi, ${app.business_name} başvurumuz hakkında bilgi almak istiyorum.`);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Başvurunuz Alındı | RandevuFormu</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 32px 16px; -webkit-font-smoothing: antialiased; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 42, 74, 0.05); }
        .header { background: #ffffff; padding: 32px 32px 24px 32px; border-bottom: 1px solid #f1f5f9; text-align: left; }
        .brand { font-size: 22px; font-weight: 900; color: #0f2a4a; letter-spacing: -0.5px; text-decoration: none; display: inline-block; }
        .brand span { color: #0062ff; }
        .badge-pill { display: inline-block; background: #eff6ff; color: #0062ff; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
        .content { padding: 32px; }
        h1 { font-size: 22px; font-weight: 800; color: #0f2a4a; margin: 0 0 12px 0; line-height: 1.3; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 24px 0; }
        .card-title { font-size: 12px; font-weight: 800; color: #0f2a4a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2f7; font-size: 13px; }
        .row:last-child { border-bottom: none; }
        .row-lbl { color: #64748b; font-weight: 500; }
        .row-val { color: #0f2a4a; font-weight: 700; text-align: right; }
        .steps-box { margin: 28px 0; border-top: 1px solid #f1f5f9; padding-top: 24px; }
        .steps-title { font-size: 14px; font-weight: 800; color: #0f2a4a; margin-bottom: 16px; }
        .step-item { display: flex; align-items: flex-start; margin-bottom: 16px; }
        .step-num { width: 24px; height: 24px; border-radius: 8px; background: #0062ff; color: #ffffff; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; }
        .step-text { font-size: 13px; color: #334155; line-height: 1.5; }
        .step-text strong { color: #0f2a4a; }
        .btn-primary { display: inline-block; background: #0062ff; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0, 98, 255, 0.25); }
        .btn-wa { display: inline-block; background: #22c55e; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 10px; margin-top: 8px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6; }
        .footer a { color: #0062ff; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <span class="brand">Randevu<span>Formu</span></span>
        </div>
        <div class="content">
          <span class="badge-pill">✓ Başvurunuz Alındı</span>
          <h1>Aramıza Hoş Geldiniz, ${app.owner_name}!</h1>
          <p><strong>${app.business_name}</strong> için oluşturduğunuz işletme kayıt başvurusu güvenle sistemimize ulaştı. Ekibimiz başvurunuzu inceliyor.</p>

          <div class="card">
            <div class="card-title">Kayıt Başvuru Detayları</div>
            <div class="row"><span class="row-lbl">İşletme Adı:</span><span class="row-val">${app.business_name}</span></div>
            <div class="row"><span class="row-lbl">Sektör / Kategori:</span><span class="row-val">${app.category}</span></div>
            <div class="row"><span class="row-lbl">Yetkili Kişi:</span><span class="row-val">${app.owner_name}</span></div>
            <div class="row"><span class="row-lbl">Telefon:</span><span class="row-val">${app.phone}</span></div>
            ${app.city ? `<div class="row"><span class="row-lbl">Konum:</span><span class="row-val">${app.city}${app.district ? ` / ${app.district}` : ""}</span></div>` : ""}
            <div class="row"><span class="row-lbl">Özel Randevu Linkiniz:</span><span class="row-val" style="color: #0062ff;">${previewUrl}</span></div>
          </div>

          <div class="steps-box">
            <div class="steps-title">🚀 Sırada Ne Var? (3 Kolay Adım)</div>
            <div class="step-item">
              <div class="step-num">1</div>
              <div class="step-text"><strong>Hızlı Onay (15-30 Dakika):</strong> Başvurunuz incelendikten sonra hesabınız aktif edilecek ve onay e-postası alacaksınız.</div>
            </div>
            <div class="step-item">
              <div class="step-num">2</div>
              <div class="step-text"><strong>Hizmetlerinizi &amp; Saatlerinizi Ekleyin:</strong> Yönetim panelinize giriş yaparak sunduğunuz hizmetleri, fiyatları ve çalışma saatlerinizi belirleyin.</div>
            </div>
            <div class="step-item">
              <div class="step-num">3</div>
              <div class="step-text"><strong>Sosyal Medya Biyonuza Ekleyin:</strong> Size özel randevu linkinizi Instagram veya WhatsApp profilinize ekleyerek 7/24 otonom randevu almaya başlayın.</div>
            </div>
          </div>

          <div style="text-align: center; margin: 28px 0 12px 0;">
            <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Aklınıza takılan her konuda ekibimize WhatsApp üzerinden ulaşabilirsiniz:</p>
            <a href="${waSupportUrl}" class="btn-wa" target="_blank">💬 WhatsApp Canlı Destek</a>
          </div>
        </div>

        <div class="footer">
          <strong>RandevuFormu.com</strong> • Türkiye'nin Yeni Nesil Randevu &amp; Rezervasyon Altyapısı<br>
          Bu e-posta, kayıt talebiniz doğrultusunda otomatik olarak gönderilmiştir.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: SENDER_EMAIL,
      to: app.email,
      subject: `🎉 Başvurunuz Alındı: ${app.business_name} | RandevuFormu`,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error("[Email Error] Application received notification failed:", error);
    return { success: false, error };
  }
}

/**
 * 2. YENİ İŞLETME KAYIT BAŞVURUSU GELDİĞİNDE YÖNETİCİYE KURUMSAL BİLDİRİM E-POSTASI
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Yeni Kayıt Başvurusu | Super Admin</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 32px 16px; }
        .wrapper { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 42, 74, 0.05); }
        .header { background: #0f2a4a; padding: 24px 32px; color: #ffffff; }
        .header-brand { font-size: 16px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; }
        .header-brand span { color: #38bdf8; }
        .badge { display: inline-block; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; margin-top: 8px; }
        .content { padding: 32px; }
        h1 { font-size: 20px; font-weight: 800; color: #0f2a4a; margin: 0 0 10px 0; }
        p { font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 20px 0; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 24px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2f7; font-size: 13px; }
        .row:last-child { border-bottom: none; }
        .row-lbl { color: #64748b; font-weight: 600; width: 35%; }
        .row-val { color: #0f2a4a; font-weight: 700; width: 65%; text-align: right; }
        .btn-group { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 24px; }
        .btn-primary { display: inline-block; background: #0062ff; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 10px; }
        .btn-wa { display: inline-block; background: #22c55e; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 20px; border-radius: 10px; }
        .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="header-brand">Randevu<span>Formu</span> • Super Admin</div>
          <span class="badge">Yeni Başvuru Bildirimi</span>
        </div>
        <div class="content">
          <h1>🔔 Yeni İşletme: ${app.business_name}</h1>
          <p>Platform üzerinden yeni bir işletme kayıt başvurusu yapıldı. Detaylar aşağıdadır:</p>

          <div class="card">
            <div class="row"><span class="row-lbl">İşletme Adı:</span><span class="row-val">${app.business_name}</span></div>
            <div class="row"><span class="row-lbl">Kategori / Sektör:</span><span class="row-val" style="color: #0062ff;">${app.category}</span></div>
            <div class="row"><span class="row-lbl">Yetkili Kişi:</span><span class="row-val">${app.owner_name}</span></div>
            <div class="row"><span class="row-lbl">E-Posta:</span><span class="row-val"><a href="mailto:${app.email}" style="color: #0062ff;">${app.email}</a></span></div>
            <div class="row"><span class="row-lbl">Telefon:</span><span class="row-val"><a href="tel:${app.phone}" style="color: #0062ff;">${app.phone}</a></span></div>
            ${app.city ? `<div class="row"><span class="row-lbl">Konum:</span><span class="row-val">${app.city}${app.district ? ` / ${app.district}` : ""}</span></div>` : ""}
            ${app.website ? `<div class="row"><span class="row-lbl">Web Sitesi:</span><span class="row-val"><a href="${app.website}" target="_blank" style="color: #0062ff;">${app.website}</a></span></div>` : ""}
            ${app.location_url ? `<div class="row"><span class="row-lbl">Harita:</span><span class="row-val"><a href="${app.location_url}" target="_blank" style="color: #0062ff;">Google Haritalar</a></span></div>` : ""}
          </div>

          <div class="btn-group">
            <a href="${adminUrl}" class="btn-primary" target="_blank">Admin Panelinde İncele &amp; Onayla →</a>
            ${waUrl ? `<a href="${waUrl}" class="btn-wa" target="_blank">WhatsApp'tan Ulaş</a>` : ""}
          </div>
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
 * 3. İŞLETME BAŞVURUSU ONAYLANDIĞINDA İŞLETME SAHİBİNE TEBRİK & GİRİŞ E-POSTASI
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hesabınız Onaylandı | RandevuFormu</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 32px 16px; }
        .wrapper { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 42, 74, 0.05); }
        .header { background: #ffffff; padding: 32px 32px 20px 32px; border-bottom: 1px solid #f1f5f9; }
        .brand { font-size: 22px; font-weight: 900; color: #0f2a4a; letter-spacing: -0.5px; }
        .brand span { color: #0062ff; }
        .badge { display: inline-block; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px; }
        .content { padding: 32px; }
        h1 { font-size: 22px; font-weight: 800; color: #0f2a4a; margin: 0 0 12px 0; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }
        .btn-primary { display: inline-block; background: #0062ff; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0, 98, 255, 0.25); }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <span class="brand">Randevu<span>Formu</span></span>
        </div>
        <div class="content">
          <span class="badge">✓ Başvurunuz Onaylandı</span>
          <h1>Tebrikler Sayın ${ownerName}!</h1>
          <p><strong>${businessName}</strong> için yaptığınız RandevuFormu kayıt başvurusu onaylandı ve işletme sayfanız aktif edildi.</p>
          <p>Artık yönetim panelinize giriş yapabilir; hizmetlerinizi, koltuk ve çalışma saatlerinizi düzenleyerek randevu kabul etmeye başlayabilirsiniz.</p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${loginUrl}" class="btn-primary" target="_blank">Yönetim Paneline Giriş Yap →</a>
          </div>

          <p style="font-size: 13px; color: #64748b; text-align: center;">Kayıt olurken kullandığınız e-posta ve şifrenizle doğrudan giriş yapabilirsiniz.</p>
        </div>

        <div class="footer">
          <strong>RandevuFormu.com</strong> • Türkiye'nin Yeni Nesil Randevu Platformu<br>
          Sorularınız için bize her zaman yanıt verebilirsiniz.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: SENDER_EMAIL,
      to: email,
      subject: `🎉 Hesabınız Onaylandı: ${businessName} | RandevuFormu`,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error("[Email Error] Approval notification failed:", error);
    return { success: false, error };
  }
}

/**
 * 4. ŞİFRE SIFIRLAMA E-POSTASI
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Şifrenizi Sıfırlayın | RandevuFormu</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 32px 16px; }
        .wrapper { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 36px 32px; }
        .brand { font-size: 22px; font-weight: 900; color: #0f2a4a; margin-bottom: 24px; display: inline-block; }
        .brand span { color: #0062ff; }
        h1 { font-size: 20px; font-weight: 800; color: #0f2a4a; margin: 0 0 12px 0; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0; }
        .btn-primary { display: inline-block; background: #0062ff; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; text-align: center; }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="brand">Randevu<span>Formu</span></div>
        <h1>Şifre Sıfırlama Talebi</h1>
        <p>RandevuFormu hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki bağlantıya tıklayın:</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" class="btn-primary" target="_blank">Şifremi Sıfırla →</a>
        </div>
        <div class="footer">
          Bu bağlantı güvenlik nedeniyle 1 saat geçerlidir. Eğer bu talebi siz yapmadıysanız lütfen bu e-postayı yok sayın.
        </div>
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
 * 5. HESAP / E-POSTA DOĞRULAMA E-POSTASI
 */
export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>E-Postanızı Doğrulayın | RandevuFormu</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 32px 16px; }
        .wrapper { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 36px 32px; box-shadow: 0 10px 25px -5px rgba(15, 42, 74, 0.05); }
        .brand { font-size: 22px; font-weight: 900; color: #0f2a4a; margin-bottom: 24px; display: inline-block; text-decoration: none; }
        .brand span { color: #0062ff; }
        .badge { display: inline-block; background: #eff6ff; color: #0062ff; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px; }
        h1 { font-size: 20px; font-weight: 800; color: #0f2a4a; margin: 0 0 12px 0; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0; }
        .btn-primary { display: inline-block; background: #0062ff; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0, 98, 255, 0.25); }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="brand">Randevu<span>Formu</span></div>
        <div>
          <span class="badge">E-Posta Doğrulama</span>
          <h1>Merhaba ${name},</h1>
          <p>RandevuFormu hesabınızı aktifleştirmek ve randevu sayfanızı kullanmaya başlamak için lütfen aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın:</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${verifyUrl}" class="btn-primary" target="_blank">E-Postamı Doğrula →</a>
          </div>
          <p style="font-size: 13px; color: #64748b;">Eğer buton çalışmıyorsa aşağıdaki bağlantıyı tarayıcınıza yapıştırabilirsiniz:<br><a href="${verifyUrl}" style="color: #0062ff; word-break: break-all;">${verifyUrl}</a></p>
          <div class="footer">
            Bu bağlantı güvenlik nedeniyle 24 saat geçerlidir. Eğer bu hesabı siz oluşturmadıysanız bu e-postayı yok sayabilirsiniz.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: SENDER_EMAIL,
      to: email,
      subject: 'E-Posta Adresinizi Doğrulayın | RandevuFormu',
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error('[Email Error] Verification email failed:', error);
    return { success: false, error };
  }
}

