import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      // We can't easily force "admin" on GitHub login without a dashboard, 
      // so GitHub users will be "user" by default.
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        
        let user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            // LAB HACK: If email is admin@example.com, make them ADMIN
            const role = email === "admin@example.com" ? "admin" : "user";
            
            user = await prisma.user.create({
                data: { 
                  email, 
                  name: "New User", 
                  password: "password",
                  role: role // <--- Save role to DB
                }
            })
        }

        if (credentials.password === user.password) return user;
        return null;
      },
    }),
  ],
  // CALLBACKS - The Secret Sauce
  callbacks: {
    async jwt({ token, user }) {
      // "user" is only available the very first time they login.
      // We copy the role from the DB user object to the JWT token.
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // We copy the role from the JWT token to the Session object
      // so the frontend can see it.
      if (session?.user && token.role) {
        session.user.role = token.role
      }
      return session
    }
  }
})