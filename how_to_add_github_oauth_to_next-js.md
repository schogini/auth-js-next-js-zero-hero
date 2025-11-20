# How to Add GitHub OAuth to a Next.js Application

This guide explains how to add GitHub OAuth authentication to a basic Next.js application (like `lab1`) to create a secured application (like `lab6`).

## Prerequisites

- A Next.js application (e.g., created with `npx create-next-app@latest`).
- A GitHub Account to create an OAuth App.

## Step 1: Install Dependencies

Install the necessary packages for authentication and database management.

```bash
npm install next-auth@beta @auth/prisma-adapter @prisma/client
npm install prisma --save-dev
```

## Step 2: Configure the Database (Prisma)

1.  **Initialize Prisma**:
    ```bash
    npx prisma init
    ```

2.  **Update `prisma/schema.prisma`**:
    Add the necessary models for Auth.js (User, Account, Session, VerificationToken).

    ```prisma
    datasource db {
      provider = "sqlite"
      url      = "file:./dev.db"
    }

    generator client {
      provider = "prisma-client-js"
    }

    model User {
      id            String    @id @default(cuid())
      name          String?
      email         String?   @unique
      emailVerified DateTime?
      image         String?
      accounts      Account[]
      sessions      Session[]
    }

    model Account {
      id                 String  @id @default(cuid())
      userId             String
      type               String
      provider           String
      providerAccountId  String
      refresh_token      String?
      access_token       String?
      expires_at         Int?
      token_type         String?
      scope              String?
      id_token           String?
      session_state      String?

      user User @relation(fields: [userId], references: [id], onDelete: Cascade)

      @@unique([provider, providerAccountId])
    }

    model Session {
      id           String   @id @default(cuid())
      sessionToken String   @unique
      userId       String
      expires      DateTime
      user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    }

    model VerificationToken {
      identifier String
      token      String   @unique
      expires    DateTime

      @@unique([identifier, token])
    }
    ```

3.  **Generate Prisma Client**:
    ```bash
    npx prisma generate
    ```

## Step 3: Configure Auth.js (`auth.ts`)

Create a file named `auth.ts` in your root directory (or `src` if using it).

```typescript
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma" // Ensure you have a prisma client instance exported from here

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
})
```

## Step 4: Create API Route

Create `app/api/auth/[...nextauth]/route.ts` to handle authentication requests.

```typescript
import { handlers } from "@/auth" // Import from your auth.ts
export const { GET, POST } = handlers
```

## Step 5: Add Middleware (`middleware.ts`)

Create `middleware.ts` in your root directory to protect routes.

```typescript
import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  // Protect specific routes
  if (req.nextUrl.pathname.startsWith('/protected') && !isLoggedIn) {
    return Response.redirect(new URL('/api/auth/signin', req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

## Step 6: Environment Variables (`.env`)

Create or update your `.env` file with the following keys:

```env
AUTH_SECRET="your_generated_secret" # Run `npx auth secret` to generate
AUTH_GITHUB_ID="your_github_client_id"
AUTH_GITHUB_SECRET="your_github_client_secret"
```

## Step 7: Implement Sign-In (Optional Custom Page)

You can use the default sign-in page provided by Auth.js, or create a custom one.

To use a custom page:
1.  Update `auth.ts` to include `pages: { signIn: '/auth/signin' }`.
2.  Create `app/auth/signin/page.tsx`.
3.  Use Server Actions to handle the sign-in process.

**Example Server Action (`lib/actions.ts`):**
```typescript
"use server"
import { signIn } from "@/auth"

export async function authenticateGithub() {
  await signIn("github")
}
```

**Example Button in Component:**
```tsx
import { authenticateGithub } from "@/lib/actions"

export function GitHubSignInButton() {
  return (
    <form action={authenticateGithub}>
      <button type="submit">Sign in with GitHub</button>
    </form>
  )
}
```
