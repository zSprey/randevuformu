import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Kullanıcı Adı", type: "text" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        // Banka seviyesi yetkilendirme mantığı (ör. 2FA, HSM doğrulama, vs.)
        // Bu örnekte temel bir doğrulama yapıyoruz.
        if (credentials?.username === "admin" && credentials?.password === "SecureBankPassword!123") {
          return { id: "1", name: "Banka Yöneticisi", email: "admin@banka.local" };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // Banka uygulamaları için kısa oturum süresi: 15 dakika
  },
  jwt: {
    maxAge: 15 * 60,
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "strict", // CSRF koruması için strict
        path: "/",
        secure: true, // Yalnızca HTTPS üzerinden iletilir
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "SUPER_SECRET_BANK_LEVEL_KEY_PLEASE_CHANGE_IN_PROD",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
