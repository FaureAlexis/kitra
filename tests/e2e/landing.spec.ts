import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/landing');
    
    // Check page title
    await expect(page).toHaveTitle(/Kitra/);
    
    // Check hero section
    await expect(page.getByRole('heading', { name: /Create the Future of Football Kits/i })).toBeVisible();
    
    // Check CTA buttons
    await expect(page.getByRole('link', { name: /Get Started/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /View Gallery/i })).toBeVisible();
    
    // Check features section
    await expect(page.getByText(/How Kitra Works/i)).toBeVisible();
    await expect(page.getByText(/Design with AI/i)).toBeVisible();
    await expect(page.getByText(/Community Votes/i)).toBeVisible();
    await expect(page.getByText(/Mint NFTs/i)).toBeVisible();
    
    // Check footer
    await expect(page.getByText(/© 2024 Kitra/i)).toBeVisible();
  });

  test('should navigate to signin page', async ({ page }) => {
    await page.goto('/landing');
    
    // Click on "Get Started" button
    await page.getByRole('link', { name: /Get Started/i }).first().click();
    
    // Should navigate to signin page
    await expect(page).toHaveURL(/signin/);
    await expect(page.getByText(/Connect to Kitra/i)).toBeVisible();
  });

  test('should navigate to gallery page', async ({ page }) => {
    await page.goto('/landing');
    
    // Click on "View Gallery" button
    await page.getByRole('link', { name: /View Gallery/i }).first().click();
    
    // Should navigate to gallery page
    await expect(page).toHaveURL(/gallery/);
    await expect(page.getByText(/Design Gallery/i)).toBeVisible();
  });
}); 