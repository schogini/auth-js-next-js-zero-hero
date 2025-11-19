import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// ... imports and providers remain the same ...

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // ... keep your existing GitHub and Credentials providers ...
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // ... keep your existing authorize logic ...
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        
        let user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            const role = email === "admin@example.com" ? "admin" : "user";
            user = await prisma.user.create({
                data: { email, name: "New User", password: "password", role }
            })
        }

        if (credentials.password === user.password) return user;
        return null;
      },
    }),
  ],
  // NEW CONFIGURATION HERE
  pages: {
    signIn: "/auth/signin", // <--- Tells Auth.js to use our custom page
  },
  callbacks: {
    // ... keep your existing callbacks ...
    async jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    async session({ session, token }) {
      if (session?.user && token.role) {
        session.user.role = token.role
      }
      return session
    }
  }
})