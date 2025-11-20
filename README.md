Here is the setup for **Lab 3: Database Persistence (SQLite & Prisma)**.

In Lab 2, the user "J Smith" disappeared every time you changed the code or restarted the server. In Lab 3, we will use **Prisma** (an ORM) and **SQLite** (a file-based database) to store our users permanently.

**Important Concept:**
By default, when using the **Credentials** provider (Email/Password), Auth.js forces the session to be a **JWT** (cookie-based). However, we will use the database to **store and retrieve the user profile**.

### Step 1: Setup the Folder

1.  Copy your `lab2` folder and rename it to `lab3`.
2.  Open the `lab3` folder.

### Step 2: Install Dependencies

We need to add Prisma and the adapter to `package.json`.

**File:** `lab3/package.json`
Update your dependencies and scripts exactly like this. Note the new `dev` script which ensures the database is created when Docker starts.

```json
{
  "name": "lab3",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "prisma db push && next dev", 
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@auth/prisma-adapter": "^1.4.0",
    "@prisma/client": "^5.10.0",
    "next": "14.1.0",
    "next-auth": "beta",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.1.0",
    "postcss": "^8",
    "prisma": "^5.10.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

### Step 3: The Database Schema

We need to define what our tables look like. Create a folder named `prisma` in the root, and a file named `schema.prisma` inside it.

**File:** `lab3/prisma/schema.prisma`

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

// The User model
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  password      String?   // Added for Credentials login
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

// Required for Auth.js (Social Logins, etc.)
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

### Step 4: The Prisma Client Instance

We need a helper file to connect to the DB efficiently without creating too many connections during development.

Create file: `lab3/lib/prisma.ts` (Create the `lib` folder first)

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

### Step 5: Update Auth Logic (`auth.ts`)

Now we connect Auth.js to the database. We will also add a small logic hack to **auto-create** a user if one doesn't exist, so you don't have to write a seed script manually.

**File:** `lab3/auth.ts`

```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // Required when using Credentials with an Adapter
  providers: [
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
```

### Step 6: Docker Configuration Update

We need to ensure `prisma` commands can run inside the container.

**File:** `lab3/Dockerfile`
We add `npx prisma generate` to the build process so the TypeScript client is created.

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000

# Note: The CMD is now handled by "npm run dev" in package.json
# which runs "prisma db push" first.
CMD ["npm", "run", "dev"]
```

*(The `docker-compose.yml` from Lab 2 works fine as is, because it maps the volume. The SQLite file `dev.db` will appear in your `lab3/prisma` folder on your host machine.)*

-----

### Step 7: Run Lab 3

1.  **Rebuild is mandatory** because we added dependencies and changed the Dockerfile.
2.  Open terminal in `lab3`.
3.  Run:
    ```bash
    docker-compose down
    docker-compose up --build
    ```

**What to expect:**

1.  Watch the terminal logs. You will see `Prisma schema loaded from prisma/schema.prisma` and `The database is now in sync with your schema`.
2.  Open `http://localhost:3000`.
3.  Go to **Members**. You will be redirected to Sign In.
4.  **Enter ANY email** (e.g., `admin@example.com`) and the password `password`.
5.  **Magic:** Because of our logic in `auth.ts`, since this user didn't exist, the code created it in SQLite immediately and logged you in.
6.  If you look in your `lab3/prisma` folder, you will see a `dev.db` file. If you restart Docker, that file remains, and your user remains.

**Validation:**
Once logged in, the Members page should show your JSON session. The `sub` (subject) ID in the JSON will now be a complex string (like `clt...`) which is the CUID generated by the Database, proving it came from SQLite\!

Ready for **Lab 4** to add GitHub OAuth?