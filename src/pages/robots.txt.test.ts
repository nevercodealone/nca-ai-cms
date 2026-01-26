import { describe, it, expect } from 'vitest';
import { generateRobotsTxt } from './robots.txt';

describe('generateRobotsTxt', () => {
  const siteUrl = 'https://semantik-html-barrierefrei.de';

  it('includes User-agent wildcard directive', () => {
    const txt = generateRobotsTxt(siteUrl);
    expect(txt).toContain('User-agent: *');
  });

  it('allows root path', () => {
    const txt = generateRobotsTxt(siteUrl);
    expect(txt).toContain('Allow: /');
  });

  it('disallows editor route', () => {
    const txt = generateRobotsTxt(siteUrl);
    expect(txt).toContain('Disallow: /editor');
  });

  it('disallows login route', () => {
    const txt = generateRobotsTxt(siteUrl);
    expect(txt).toContain('Disallow: /login');
  });

  it('disallows API routes', () => {
    const txt = generateRobotsTxt(siteUrl);
    expect(txt).toContain('Disallow: /api/');
  });

  it('includes sitemap URL with correct domain', () => {
    const txt = generateRobotsTxt(siteUrl);
    expect(txt).toContain(
      'Sitemap: https://semantik-html-barrierefrei.de/sitemap.xml'
    );
  });

  it('removes trailing slash from site URL', () => {
    const txt = generateRobotsTxt('https://example.com/');
    expect(txt).toContain('Sitemap: https://example.com/sitemap.xml');
    expect(txt).not.toContain('https://example.com//sitemap.xml');
  });

  it('does not reference nevercodealone.de', () => {
    const txt = generateRobotsTxt(siteUrl);
    expect(txt).not.toContain('nevercodealone.de');
  });
});
