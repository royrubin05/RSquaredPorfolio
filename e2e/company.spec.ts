
import { test, expect } from '@playwright/test';

test('navigate to company details', async ({ page }) => {
    await page.goto('/companies');

    // Check list loaded
    await expect(page.getByRole('heading', { name: 'Portfolio Companies' })).toBeVisible();

    // Click on first company (assuming data seeded)
    // We'll look for a link to a company. If none, we can't test functionality.
    // We'll assume at least one company from seed.
    const firstCompanyRow = page.locator('tbody tr').first();
    await expect(firstCompanyRow).toBeVisible();

    await firstCompanyRow.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/companies\/.+/);

    // Check for detail elements - Strict Mode
    await expect(page.getByText('Holdings by Fund')).toBeVisible();
});
