import Link from 'next/link';
import { verifyEmailToken } from '@/app/actions/auth';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;

  let result = { success: false, message: 'Doğrulama kodu bulunamadı.' };

  if (token) {
    result = await verifyEmailToken(token);
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          {result.success ? (
            <div className="rounded-full bg-emerald-50 p-4 text-emerald-600">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          ) : (
            <div className="rounded-full bg-red-50 p-4 text-red-600">
              <XCircle className="h-12 w-12" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {result.success ? 'E-Postanız Doğrulandı!' : 'Doğrulama Başarısız'}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          {result.message}
        </p>

        <div className="mt-8">
          {result.success ? (
            <Link
              href="/login"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 font-semibold text-white shadow transition-transform hover:bg-zinc-800 active:scale-95"
            >
              <span>Giriş Yap ve Başla</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="space-y-3">
              <Link
                href="/login"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-zinc-900 px-6 font-semibold text-white transition-transform hover:bg-zinc-800 active:scale-95"
              >
                Giriş Ekranına Dön
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Destek ile İletişime Geç
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
