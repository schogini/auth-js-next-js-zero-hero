This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




# NEW DOCKERIZED

Understood. Since we will not use `npx` to auto-generate the project, you will need to manually create the configuration files that the generator usually handles for you.

Here is the complete manual setup for **Lab 1**.

Create a folder named `lab1`. Inside that folder, create the files as listed below.

### 1\. Configuration Files (The Root)

These files define the project dependencies and settings.

**File:** `lab1/package.json`

```json
{
  "name": "lab1",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.1.0",
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
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

**File:** `lab1/tsconfig.json`

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**File:** `lab1/next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

**File:** `lab1/tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

**File:** `lab1/postcss.config.js`

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

-----

### 2\. Docker Setup (The Infrastructure)

**File:** `lab1/Dockerfile`

```dockerfile
FROM node:20-alpine
WORKDIR /app
# Copy package files
COPY package*.json ./
# Install dependencies inside the container
RUN npm install
# Copy the rest of the files
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

**File:** `lab1/docker-compose.yml`

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
```

-----

### 3\. Application Code (The UI)

Create a folder named `app` inside `lab1`. Then create the files below inside it.

**File:** `lab1/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**File:** `lab1/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Lab 1",
  description: "Auth.js Lab 1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container mx-auto p-8">{children}</main>
      </body>
    </html>
  );
}
```

**File:** `lab1/app/page.tsx` (The Public Home Page)

```tsx
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h1 className="text-4xl font-bold">Welcome to Lab 1</h1>
      <p className="text-xl text-gray-600">Public Landing Page</p>
      <div className="p-4 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded">
        Status: <strong>No Authentication</strong>
      </div>
    </div>
  );
}
```

**File:** `lab1/app/components/Navbar.tsx`
(Create the `components` folder inside `app` first)

```tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">Auth.js Labs</div>
        <div className="space-x-4">
          <Link href="/" className="hover:text-blue-400">Home</Link>
          <Link href="/about" className="hover:text-blue-400">About</Link>
          <Link href="/members" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
            Members
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

**File:** `lab1/app/about/page.tsx`
(Create the `about` folder inside `app` first)

```tsx
export default function AboutPage() {
  return <h1 className="text-2xl font-bold">Public About Page</h1>;
}
```

**File:** `lab1/app/members/page.tsx`
(Create the `members` folder inside `app` first)

```tsx
export default function MembersPage() {
  return (
    <div className="border p-8 rounded bg-gray-50">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Members Area</h1>
      <p>If you see this, you are seeing protected content (currently insecure!).</p>
    </div>
  );
}
```

-----

### How to Run

1.  Open your terminal in the `lab1` folder.
2.  Run `docker compose up`.
3.  Wait for the initial `npm install` to finish inside the container.
4.  Visit `http://localhost:3000`.

**Validation:**
You should see the UI, and you should be able to click "Members" and see the content without logging in.

Shall we move to **Lab 2** to add the actual Authentication logic?