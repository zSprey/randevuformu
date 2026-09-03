'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { hashPassword, generateSecureToken } from '@/lib/authCrypto';
import { sendVerificationEmail } from '@/lib/email';

const RegisterBusinessSchema = z.object({
  name: z.string().min(2, 'Ad ve soyad en az 2 karakter olmalıdır.'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
  businessName: z.string().min(2, 'İşletme adı en az 2 karakter olmalıdır.'),
  category: z.string().default('kuafor'),
  whatsappNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Geçerli bir telefon numarası giriniz.').optional().nullable(),
});

/**
 * İşletme Kayıt & Aktivasyon E-postası Gönderimi
 */
export async function registerBusiness(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      businessName: formData.get('businessName'),
      category: formData.get('category') || 'kuafor',
      whatsappNumber: formData.get('whatsappNumber') || null,
    };

    const parsed = RegisterBusinessSchema.parse(rawData);
    const cleanEmail = parsed.email.trim().toLowerCase();

    // 1. E-posta zaten kayıtlı mı kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return { success: false, message: 'Bu e-posta adresi zaten kullanımda.' };
    }

    // 2. Slug oluşturma (örn: "Erman Kuaför" -> "erman-kuafor")
    let baseSlug = parsed.businessName
      .toLowerCase()
      .trim()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!baseSlug) baseSlug = 'isletme';

    // Slug çakışması kontrolü
    let slug = baseSlug;
    let count = 1;
    while (await prisma.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // 3. Şifre hash'leme ve Kullanıcı + İşletme oluşturma
    const passwordHash = hashPassword(parsed.password);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: parsed.name.trim(),
        passwordHash,
        isEmailVerified: false,
        business: {
          create: {
            name: parsed.businessName.trim(),
            slug,
            category: parsed.category,
            whatsappNumber: parsed.whatsappNumber ? parsed.whatsappNumber.replace(/[^0-9]/g, '') : null,
            isWhatsappActive: true,
          },
        },
      },
      include: {
        business: true,
      },
    });

    // 4. Doğrulama Token'ı oluşturma (24 saat geçerli)
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // 5. Aktivasyon E-postasını Gönder
    await sendVerificationEmail(cleanEmail, parsed.name.trim(), token);

    return {
      success: true,
      message: 'Kayıt başarılı! Lütfen gelen kutunuzdaki doğrulama bağlantısına tıklayın.',
      slug: user.business?.slug,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstMsg = error.issues?.[0]?.message || (error as any).errors?.[0]?.message;
      return { success: false, message: firstMsg || 'Geçersiz form verisi.' };
    }
    console.error('[Auth Action Error] Register business failed:', error);
    return { success: false, message: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.' };
  }
}

/**
 * E-Posta Doğrulama Token Kontrolü
 */
export async function verifyEmailToken(token: string) {
  try {
    if (!token || token.trim().length === 0) {
      return { success: false, message: 'Geçersiz veya eksik doğrulama kodu.' };
    }

    const verification = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      return { success: false, message: 'Doğrulama bağlantısı geçersiz veya daha önce kullanılmış.' };
    }

    if (new Date() > verification.expiresAt) {
      // Süresi dolmuş token'ı sil
      await prisma.verificationToken.delete({ where: { token } });
      return { success: false, message: 'Doğrulama bağlantısının süresi dolmuş. Lütfen tekrar aktivasyon maili isteyin.' };
    }

    // Kullanıcının e-posta doğrulamasını güncelle
    await prisma.user.update({
      where: { id: verification.userId },
      data: { isEmailVerified: true },
    });

    // Kullanılan token'ı güvenle sil
    await prisma.verificationToken.delete({ where: { token } });

    return {
      success: true,
      message: 'E-posta adresiniz başarıyla doğrulandı! Giriş yapabilirsiniz.',
      userEmail: verification.user.email,
    };
  } catch (error) {
    console.error('[Auth Action Error] Verify token failed:', error);
    return { success: false, message: 'Doğrulama sırasında bir hata oluştu.' };
  }
}
