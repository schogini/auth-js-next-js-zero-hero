import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // The credentials object is used to generate the inputs on the login page
      credentials: {
        email: { label: "Email", type: "text", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" }
      },
      // The logic to verify the user
      authorize: async (credentials) => {
        // HARDCODED USER FOR LAB 2
        const user = { id: "1", name: "J Smith", email: "test@example.com", password: "password" }

        if (credentials?.email === user.email && credentials?.password === user.password) {
          // Any object returned will be saved in the `user` property of the JWT
          return user
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null
        }
      }
    })
  ],
})