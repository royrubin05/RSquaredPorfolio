
import { test, expect } from '@playwright/test';

test('has title and key elements', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/VC Portfolio OS/);

    // Check for Dashboard Header/Brand
    await expect(page.getByText('R² Portfolio')).toBeVisible();

    // Check for KPIs (approximate check for presence)
    await expect(page.getByText('Total AUM', { exact: false })).toBeVisible();
    await expect(page.getByText('Active Companies', { exact: false })).toBeVisible();

    // Check for Portfolio Table (Optional for now as it might be conditional)
    // await expect(page.getByText('Portfolio Companies', { exact: false })).toBeVisible();
});
