import { test, expect } from '@playwright/test';
import { checkAccessibility } from './helpers/axe-helper';

test.describe('Accessibility audit', () => {
  test('Homepage has no a11y violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await checkAccessibility(page);
  });

  test('Login page has no a11y violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await checkAccessibility(page);
  });

  test('Über AI CMS page has no a11y violations', async ({ page }) => {
    await page.goto('/ueber-ai-cms');
    await page.waitForLoadState('domcontentloaded');
    await checkAccessibility(page);
  });

  test('Impressum page has no a11y violations', async ({ page }) => {
    await page.goto('/impressum');
    await page.waitForLoadState('domcontentloaded');
    await checkAccessibility(page);
  });

  test('Article detail page has no a11y violations', async ({ page }) => {
    await page.goto('/');
    const articleLink = page.locator('a[href^="/articles/"]').first();
    const href = await articleLink.getAttribute('href');
    expect(href).toBeTruthy();
    await page.goto(href!);
    await page.waitForLoadState('domcontentloaded');
    await checkAccessibility(page);
  });
});
