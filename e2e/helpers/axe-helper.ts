import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

export async function checkAccessibility(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  if (results.violations.length > 0) {
    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => ({
        html: n.html.slice(0, 200),
        target: n.target,
        failureSummary: n.failureSummary,
      })),
    }));
    console.log('Accessibility violations:', JSON.stringify(summary, null, 2));
  }

  expect(results.violations).toEqual([]);
}
