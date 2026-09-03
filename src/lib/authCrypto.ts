import crypto from 'crypto';

/**
 * Parolayı scrypt + salt ile güvenli hash'ler
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Girilen parola ile kayıtlı hash'i doğrular
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Güvenli 64 karakterli aktivasyon / doğrulama tokenı üretir
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
