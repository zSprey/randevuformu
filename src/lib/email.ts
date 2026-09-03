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
