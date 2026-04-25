import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.RESEND_SMTP_HOST || "smtp.resend.com",
        port: Number(process.env.RESEND_SMTP_PORT) || 587,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: process.env.EMAIL_FROM || "noreply@knowbest.ro",
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as Record<string, unknown>).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as Record<string, unknown>).id = token.sub!;
        (session.user as Record<string, unknown>).role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Allow sign in
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  events: {
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`)
    },
  },
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }