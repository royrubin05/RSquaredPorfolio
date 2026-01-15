---
description: How to manage Staging and Production deployments on Vercel
---

# Staging & Production Workflow

This workflow describes the optimal way to manage code changes using GitHub branches and Vercel's automatic preview deployments.

## 1. Branching Strategy

We use a lightweight **Feature Branch** workflow.

*   `main`: **Production**. This is the source of truth. Does not accept direct commits, only Pull Requests (PRs).
*   `feature/*`: **Staging/Preview**. Create a new branch for every task (e.g., `feature/safe-logic`, `fix/moic-calc`).

## 2. Vercel "Preview" Deployments

Vercel is pre-configured to build every branch automatically.

1.  **Create Branch**:
    ```bash
    git checkout -b feature/new-amazing-feature
    ```
2.  **Push Code**:
    ```bash
    git push origin feature/new-amazing-feature
    ```
3.  **Get URL**:
    *   Go to the Vercel Dashboard -> Deployments.
    *   Or check the GitHub Pull Request comments.
    *   You will see a URL like: `vc-portfolio-os-git-feature-new-amazing-feature.vercel.app`

This URL is your **Staging Environment**. It is an exact replica of production code, but running on a temporary URL.

## 3. The Dangerous Part: Database Data ⚠️

**CRITICAL**: By default, your Staging (Preview) environments connect to the **SAME DATABASE** as Production.

*   **Risk**: If you delete a company or round in Staging, it is deleted in Production.
*   **Recommendation**:
    *   **Tier 1 (Current)**: Be careful. Treat Staging as "Testing UI on Live Data". Do not run destructive actions (Delete/Drop) unless testing.
    *   **Tier 2 (Safe)**: Create a second Supabase Project (Staging).
        *   In Vercel -> Settings -> Environment Variables.
        *   Add `SUPABASE_URL` and `SUPABASE_KEY`.
        *   Uncheck "Production". Check "Preview".
        *   This routes all staging builds to the test database.

## 4. Merging to Production

Once you verify the feature on the Preview URL:

1.  Open a Pull Request (PR) on GitHub.
2.  Click **Merge**.
## 5. Database "Deployment" (Migrating Staging to Prod)

When you move code to Production, you often need to update the Production Database structure (Schema) to match Staging.

### A. Deploying Schema Changes (The Structure)
We use **SQL Migration Files** to keep databases in sync.

1.  **Locate Migrations**: Check `src/lib/supabase/migrations/`.
    *   Example: `20260110_add_share_price.sql`
2.  **Run on Staging**: Run the SQL in the Staging Supabase SQL Editor to test.
3.  **Run on Production**: Once the code is merged to `main`, copy the same SQL content and run it in the **Production Supabase SQL Editor**.
    *   *Note: In the future, this can be automated with Supabase CLI, but manual execution is safer for now.*

### B. "Deploying" Data (The Content)
**Warning**: You generally do **NOT** overwrite Production data with Staging data. Production data is sacred.

*   **Scenario: "I tested a Deal in Staging and want it in Prod"**
    *   **Action**: Re-enter the deal manually in Production. This ensures you don't accidentally delete other live data or break ID references.
*   **Scenario: "I want to overwrite Prod with a Staging backup"**
    *   **Action**: Use the "Backup & Restore" feature (CSV Export), but be extremely cautious. It is usually improved to treat Staging as a "Sandpit" that gets wiped, not a source of truth.
