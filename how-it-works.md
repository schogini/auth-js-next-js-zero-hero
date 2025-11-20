# How It Works: Google OAuth in Lab 3

This document explains how we added Google OAuth authentication to the existing Credentials-based login in `lab3-google`.

## 1. Overview

We took an existing application (`lab3`) that only had a custom Credentials provider (username/password) and added "Sign in with Google" functionality. This allows users to sign in with either their email/password OR their Google account.

## 2. Libraries Used

-   **`next-auth` (v5 beta)**: The main authentication framework.
-   **`@auth/prisma-adapter`**: A bridge that connects Auth.js to our SQLite database via Prisma. It handles saving OAuth user data automatically.
-   **`@prisma/client`**: The database client.

## 3. Key Changes & Files

### A. `auth.ts` (The Configuration)
This is the most important file. We made two key changes:
1.  **Imported `Google`**: We imported the Google provider from `next-auth/providers/google`.
2.  **Added Provider**: We added `Google({...})` to the `providers` array.

```typescript
providers: [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  }),
  Credentials({ ... }) // Existing credentials provider
]
```

### B. `.env` (Secrets)
We added two new environment variables to store our Google credentials. **These are never committed to Git.**
-   `AUTH_GOOGLE_ID`: The Public Client ID from Google Cloud Console.
-   `AUTH_GOOGLE_SECRET`: The Private Client Secret.

### C. `package.json`
We ensured `next-auth` and `@auth/prisma-adapter` were installed.

## 4. The Authentication Flow

Here is what happens when a user signs in with Google:

1.  **User Clicks Sign In**: The user visits `/api/auth/signin` (the default Auth.js sign-in page).
2.  **Selection**: They see two options: "Sign in with Google" and the "Credentials" form. They choose **Google**.
3.  **Redirect**: The app redirects them to accounts.google.com.
4.  **Consent**: The user logs in to Google and grants permission to the app.
5.  **Callback**: Google sends the user back to our app (`/api/auth/callback/google`) with a special code.
6.  **Database Magic (Prisma Adapter)**:
    -   Auth.js sees this is a Google login.
    -   It checks the database: "Do we have a user with this email?"
    -   **If No**: It creates a new `User` record and links a Google `Account` record to it.
    -   **If Yes**: It links the Google `Account` to the existing `User`.
7.  **Session**: A session is created (JWT), and the user is logged in.

## 5. Why This is Better
-   **Security**: We don't handle passwords for Google users. Google handles the security.
-   **User Experience**: One-click login is faster than typing a password.
-   **Hybrid**: We still support the old login method for existing users.
