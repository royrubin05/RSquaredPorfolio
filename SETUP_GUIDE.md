# Supabase Setup Guide

## 1. Create Supabase Project
1.  Go to [supabase.com](https://supabase.com) and create a new project.
2.  Once created, go to **Project Settings > API**.

## 2. Set Environment Variables
Create a file named `.env.local` in the root of your project (`/vc-portfolio-os`) and add the following keys from your Supabase dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Drive Integration
GOOGLE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

> **Note:** `SUPABASE_SERVICE_ROLE_KEY` is only needed for the seeding script. For security, never expose it to the client side.

## 2.5. Google Cloud Setup (Drive API)
1.  Go to **Google Cloud Console** and create a project.
2.  Enable the **Google Drive API**.
3.  Go to **Credentials** -> **Create Credentials** -> **Service Account**.
4.  Grant the Service Account "Editor" access (optional, usually not needed if sharing folders directly).
5.  **Keys**: Create a new Key (JSON) and download it.
6.  **Important**: Create a folder in your personal Google Drive (e.g., "VC Portfolio Docs") and **Share** it with the `client_email` from your Service Account. This gives the bot access to write there.


## 3. Run Database Migration
1.  Go to the **SQL Editor** in your Supabase Dashboard.
2.  Open the file `src/lib/supabase/schema.sql` in your local editor.
3.  Copy the entire content and paste it into the Supabase SQL Editor.
4.  Click **Run**.

## 4. Seed Data (Optional but Recommended)
To populate the database with the initial funds and investors from our mock data:

1.  Ensure you have `ts-node` installed or run with `npx`:
    ```bash
    npx ts-node src/lib/supabase/seed.ts
    ```
2.  Check your Supabase Table Editor to verify the data.

## 5. Restart Application
Restart your Next.js server to pick up the new environment variables:
```bash
npm run dev
```
