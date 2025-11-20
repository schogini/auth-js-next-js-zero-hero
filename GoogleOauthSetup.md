# How to Obtain Google OAuth Credentials

To enable Google Sign-In for your application, you need to create a project in the Google Cloud Console and obtain a Client ID and Client Secret.

## Steps

1.  **Go to the Google Cloud Console**:
    Navigate to [https://console.cloud.google.com/](https://console.cloud.google.com/).

2.  **Create a New Project**:
    - Click on the project dropdown in the top bar.
    - Click **"New Project"**.
    - Enter a project name (e.g., "Auth JS Lab") and click **"Create"**.
    - Select the newly created project.

3.  **Configure OAuth Consent Screen**:
    - In the left sidebar, go to **"APIs & Services"** > **"OAuth consent screen"**.
    - Select **"External"** (for testing purposes) and click **"Create"**.
    - Fill in the required fields:
        - **App Information**: App name, User support email.
        - **Developer Contact Information**: Email address.
    - Click **"Save and Continue"**.
    - You can skip "Scopes" and "Test Users" for now by clicking **"Save and Continue"**.
    - Click **"Back to Dashboard"**.

4.  **Create Credentials**:
    - In the left sidebar, click **"Credentials"**.
    - Click **"+ CREATE CREDENTIALS"** at the top and select **"OAuth client ID"**.
    - **Application type**: Select **"Web application"**.
    - **Name**: Enter a name (e.g., "Next.js App").
    - **Authorized JavaScript origins**:
        - Add `http://localhost:3000`
    - **Authorized redirect URIs**:
        - Add `http://localhost:3000/api/auth/callback/google`
    - Click **"Create"**.

5.  **Copy Credentials**:
    - A modal will appear with your **Client ID** and **Client Secret**.
    - Copy these values.

6.  **Update `.env` File**:
    - Open your `.env` file in the `lab6g` directory.
    - Paste the values:
      ```env
      AUTH_GOOGLE_ID=your_client_id_here
      AUTH_GOOGLE_SECRET=your_client_secret_here
      ```
    - **Restart your application** (if running) to apply the changes.
