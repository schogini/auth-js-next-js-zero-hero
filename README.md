[Image of OAuth 2.0 flow diagram]

Here is the setup for **Lab 4: Adding GitHub OAuth**.

In Lab 3, you authenticated using a database-backed email/password. In Lab 4, we add "Sign in with GitHub".

**The Magic of Auth.js:**
Remember the `Account` model you added to `schema.prisma` in Lab 3? That table exists specifically to link social identities (like a GitHub ID) to your `User` record. When a user signs in with GitHub, Auth.js will automatically create a User record *and* an Account record linking them.

### Step 1: Setup the Folder

1.  Copy your `lab3` folder and rename it to `lab4`.
2.  Open the `lab4` folder.

### Step 2: Get GitHub Credentials

You cannot code this part; you must configure it on GitHub.

1.  Log in to your GitHub account.
2.  Go to **Settings** (click your profile icon top-right) -\> **Developer settings** (at the very bottom left) -\> **OAuth Apps**.
3.  Click **New OAuth App**.
4.  Fill in the form:
      * **Application Name:** `Auth.js Lab 4`
      * **Homepage URL:** `http://localhost:3000`
      * **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
      * *(Note: The callback path `/api/auth/callback/[provider]` is standard for Auth.js)*
5.  Click **Register application**.
6.  **Copy the Client ID**.
7.  Click **Generate a new client secret** and **Copy the Client Secret**.

### Step 3: Update Docker Configuration

We need to pass these secrets to our container.

**File:** `lab4/docker-compose.yml`
Update the `environment` section. Replace the placeholders with the actual strings you just copied from GitHub.

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
      - AUTH_SECRET=my_super_secret_key_123
      # Add these lines:
      - AUTH_GITHUB_ID=your_client_id_paste_here
      - AUTH_GITHUB_SECRET=your_client_secret_paste_here
```

### Step 4: Update Auth Logic

We simply add the provider to the configuration.

**File:** `lab4/auth.ts`

```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github" // <--- Import this
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // 1. GitHub Provider
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    // 2. Credentials Provider (Kept from Lab 3)
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        
        let user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            user = await prisma.user.create({
                data: { email, name: "New User", password: "password" }
            })
        }

        if (credentials.password === user.password) return user;
        return null;
      },
    }),
  ],
})
```

### Step 5: Run Lab 4

1.  **Rebuild** (Environment variables changed).
    ```bash
    docker-compose up --build
    ```
2.  Open `http://localhost:3000`.
3.  Click **Members** (or Sign In).

**What to expect:**

1.  You will now see **two** buttons on the login page:
      * "Sign in with GitHub"
      * "Sign in with Credentials"
2.  Click **Sign in with GitHub**.
3.  You will be redirected to GitHub.com to authorize the app.
4.  Once you agree, you are redirected back to your Members page.
5.  Look at the JSON output on the Members page.
      * `name`: Your actual GitHub username.
      * `email`: Your GitHub email.
      * `image`: Your GitHub avatar (automatically pulled\!).

**Database Check:**
If you check the `dev.db` (using a SQLite viewer or Prisma Studio), you will see:

1.  A new **User** row (with your GitHub image).
2.  A new **Account** row. This row contains the `provider: "github"` and your specific `providerAccountId` from GitHub. This is how Auth.js knows it's you next time.

-----

### Ready for the Advanced Labs?

You have completed the "Standard Stack" (Next.js + Prisma + SQLite + OAuth).

  * **Lab 5:** **Role-Based Access (Admin vs User).** We will modify the database schema to add roles and prevent "regular" users from seeing specific buttons.
  * **Lab 6:** **Custom Login Page.** The default page is ugly. We will build a custom Tailwind login form that looks professional.

Which one would you like to do next?