import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" }, // Required when using Credentials with an Adapter
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;

        // 1. Check if user exists in DB
        let user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });

        // 2. LAB HACK: If user doesn't exist, create them on the fly!
        // (In a real app, you would have a separate Register page)
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: email,
              name: "New User",
              password: "password", // In production, HASH this!
            }
          })
        }

        // 3. Validate Password
        // (In production, use bcrypt.compare(credentials.password, user.password))
        if (credentials.password === user.password) {
          return user;
        }

        return null;
      },
    }),
  ],
})
