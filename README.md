Here is the setup for **Lab 2: Simple Authentication**.

In this lab, we will introduce `next-auth` (v5 beta). We will configure a "Credentials" provider which allows logging in with a username and password. For now, we will **hardcode** the user to understand the flow without worrying about a database yet.

### Step 1: Setup the Folder

1.  Copy your entire `lab1` folder and rename it to `lab2`.
2.  Open the `lab2` folder.

### Step 2: Update Configuration

We need to add the authentication library.

**File:** `lab2/package.json`
Find the `dependencies` section and add `"next-auth": "5.0.0-beta.25"` (or just "beta").

```json
  "dependencies": {
    "next": "14.1.0",
    "next-auth": "beta",  <-- ADD THIS
    "react": "^18",
    "react-dom": "^18"
  },
```

**File:** `lab2/docker-compose.yml`
We need to add an `AUTH_SECRET` environment variable. This is used to encrypt the session tokens.

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - AUTH_SECRET=my_super_secret_key_123  # <-- ADD THIS
```

-----

### Step 3: The Authentication Logic

Create a new file named `auth.ts` in the root of `lab2` (same level as `package.json`). This is the heart of Auth.js v5.

**File:** `lab2/auth.ts`

```typescript
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
```

### Step 4: The API Route

Next.js needs an API route to handle the sign-in and sign-out requests.

Create the folder path: `app/api/auth/[...nextauth]`
Create the file: `route.ts` inside that folder.

**File:** `lab2/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from "@/auth" // Refers to auth.ts we just made
export const { GET, POST } = handlers
```

### Step 5: Middleware Protection

This file acts as a gatekeeper. It runs before every request. If the user tries to access a protected route without being logged in, this will stop them.

Create `middleware.ts` in the root of `lab2`.

**File:** `lab2/middleware.ts`

```typescript
import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  // If trying to access /members and NOT logged in...
  if (req.nextUrl.pathname.startsWith('/members') && !isLoggedIn) {
    return Response.redirect(new URL('/api/auth/signin', req.nextUrl))
  }
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

-----

### Step 6: Update the UI

**1. Update the Navbar to show Sign In/Out**
We will make this a `server component` so we can check the session directly.

**File:** `lab2/app/components/Navbar.tsx`

```tsx
import Link from "next/link";
import { auth, signOut } from "@/auth"; // Import from our config

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-slate-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">Auth.js Lab 2</div>
        
        <div className="flex gap-4 items-center">
          <Link href="/" className="hover:text-blue-400">Home</Link>
          <Link href="/members" className="hover:text-blue-400">Members</Link>
          
          {session && session.user ? (
            <div className="flex gap-4 items-center border-l pl-4 border-slate-600">
              <span className="text-sm text-slate-300">Hi, {session.user.name}</span>
              {/* Server Action to Sign Out */}
              <form
                action={async () => {
                  "use server"
                  await signOut()
                }}
              >
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

**2. Update Members Page to Show User Data**
Now that we have a user, let's display their info on the protected page.

**File:** `lab2/app/members/page.tsx`

```tsx
import { auth } from "@/auth";

export default async function MembersPage() {
  const session = await auth();

  return (
    <div className="bg-white border p-8 rounded shadow-lg">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Access Granted</h1>
      <p className="mb-6 text-gray-600">
        Welcome to the private members area.
      </p>

      <div className="bg-slate-100 p-4 rounded border font-mono text-sm">
        <h3 className="font-bold text-slate-700 border-b border-slate-300 mb-2 pb-1">Current Session Data:</h3>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    </div>
  );
}
```

-----

### Step 7: Run Lab 2

Since we changed `package.json` (added `next-auth`), we **must rebuild** the Docker image.

1.  Open terminal in `lab2`.
2.  Run:
    ```bash
    docker-compose up --build
    ```
3.  Go to `http://localhost:3000`.

**How to Test:**

1.  Click **Members**. You should be instantly redirected to a login page (auto-generated by Auth.js).
2.  Try a fake password. It should fail.
3.  Login with:
      * **Email:** `test@example.com`
      * **Password:** `password`
4.  You should be redirected to the Members page and see your JSON session data.
5.  The Navbar should now say "Hi, J Smith" and show a "Sign Out" button.

**Concept Check:**
You now have a working authentication system\! However, if you restart the Docker container, you stay logged in only because the session is stored in a Cookie in your browser (JWT). We do not have a database yet, so we can't "create" new users.

Ready for **Lab 3** to add SQLite and Prisma?