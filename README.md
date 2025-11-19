[Image of Role Based Access Control Model]

Here is the setup for **Lab 5: Role-Based Access Control (RBAC)**.

In previous labs, a user was either "logged in" or "not logged in." In the real world, you have **Users**, **Admins**, **Editors**, etc.

**The Challenge:**

1.  **Database:** We need to store the role (e.g., "admin" or "user").
2.  **Session:** By default, the session cookie **only** contains name, email, and image. It does not know about your database roles. We must "inject" the role into the session.
3.  **TypeScript:** Next.js is strict. If you try to type `session.user.role`, it will yell at you because that property doesn't exist on the default type definition.

### Step 1: Setup the Folder

1.  Copy your `lab4` folder and rename it to `lab5`.
2.  Open the `lab5` folder.

### Step 2: Update the Database Schema

We need to add a `role` column to our User table.

**File:** `lab5/prisma/schema.prisma`
Update the `User` model to include the role field. We set the default to "user" so new sign-ups don't accidentally become admins.

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  password      String?
  role          String    @default("user")  // <--- ADD THIS
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}
// ... rest of file remains the same
```

### Step 3: TypeScript Definition (Crucial)

This is the most common stumbling block in Auth.js. We need to tell TypeScript that our Session user now has a `role`.

Create a folder `types` in the root, and a file `next-auth.d.ts`.

**File:** `lab5/types/next-auth.d.ts`

```typescript
import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}
```

### Step 4: Update Auth Logic

We need to do two things here:

1.  **Logic:** When creating a new user in our "Credentials Mock Logic", assign the "admin" role if the email is `admin@example.com`.
2.  **Callbacks:** Pass the role from the Database -\> Token -\> Session.

**File:** `lab5/auth.ts`

```typescript
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
```

### Step 5: Create the Admin Dashboard

Let's create a page that **only** admins can see.

**File:** `lab5/app/admin/page.tsx`
(Create `admin` folder inside `app`)

```tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth();

  // 1. Check if logged in
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // 2. Check for Role
  if (session.user.role !== "admin") {
    return (
      <div className="p-8 bg-red-50 text-red-800 border border-red-200 rounded">
        <h1 className="text-3xl font-bold">403 Forbidden</h1>
        <p>You are logged in as a <strong>{session.user.role}</strong>.</p>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-purple-50 border border-purple-200 rounded">
      <h1 className="text-3xl font-bold text-purple-900 mb-4">Admin Dashboard</h1>
      <p className="text-lg">Welcome, Master Administrator.</p>
      <div className="mt-4 p-4 bg-white rounded shadow">
        <p>Only users with <code>role: 'admin'</code> can see this.</p>
      </div>
    </div>
  );
}
```

### Step 6: Update Navbar

We want to show a link to the Admin Dashboard, but **only** if the user is actually an admin.

**File:** `lab5/app/components/Navbar.tsx`

```tsx
import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-slate-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">Auth.js Lab 5</div>
        
        <div className="flex gap-4 items-center">
          <Link href="/" className="hover:text-blue-400">Home</Link>
          <Link href="/members" className="hover:text-blue-400">Members</Link>
          
          {/* CONDITIONAL RENDERING FOR ADMIN */}
          {session?.user?.role === 'admin' && (
            <Link href="/admin" className="text-purple-400 hover:text-purple-300 font-bold">
              Admin Panel
            </Link>
          )}
          
          {session && session.user ? (
            <div className="flex gap-4 items-center border-l pl-4 border-slate-600">
              <div className="flex flex-col text-right">
                 <span className="text-sm text-slate-300">{session.user.name}</span>
                 {/* Show Badge */}
                 <span className="text-[10px] uppercase bg-slate-700 px-1 rounded text-center">
                    {session.user.role}
                 </span>
              </div>
              <form action={async () => { "use server"; await signOut() }}>
                <button type="submit" className="bg-red-600 text-sm px-3 py-1 rounded hover:bg-red-700">
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <Link href="/api/auth/signin" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
```

### Step 7: Run Lab 5

1.  **Rebuild:** (We changed Schema and Dockerfile needs to run `prisma generate` again).
    ```bash
    docker-compose down
    docker-compose up --build
    ```
2.  Open `http://localhost:3000`.

**Testing the Role Logic:**

1.  **Test as Regular User:**

      * Sign in with GitHub **OR** use a random email (e.g., `joe@test.com` / `password`).
      * Look at the Navbar. You will **NOT** see "Admin Panel".
      * Manually type `http://localhost:3000/admin` in the URL bar.
      * You should see the big red "403 Forbidden" message.

2.  **Test as Admin:**

      * Sign Out.
      * Sign In with Credentials.
      * **Email:** `admin@example.com`
      * **Password:** `password`
      * *Note: Our logic in `auth.ts` detects this specific email and writes `role: 'admin'` to the database.*
      * Look at the Navbar. You **SHOULD** see "Admin Panel" in purple text.
      * Click it. You should see the "Welcome, Master Administrator" dashboard.

-----

**Concept Check:**
You now have a system where the Database holds the truth, the JWT carries the truth to the browser, and the Session provides that truth to your React components.

Ready for **Lab 6** where we finally get rid of that ugly default white login page and build our own?