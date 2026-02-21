import { describe, it, expect } from 'vitest';
import { generateSitemapXml } from './sitemap.xml';
import type { ArticleData } from '../services/ArticleService';

describe('generateSitemapXml', () => {
  const siteUrl = 'https://example.com';

  const createArticle = (
    overrides: Partial<ArticleData> = {}
  ): ArticleData => ({
    articleId: '2026/01/test-article',
    title: 'Test Article',
    description: 'A test article',
    date: new Date('2026-01-15'),
    tags: ['test'],
    content: 'Test content',
    folderPath: '/app/nca-ai-cms-content/2026/01/test-article',
    ...overrides,
  });

  it('generates valid XML with correct declaration and namespace', () => {
    const xml = generateSitemapXml(siteUrl, []);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain(
      'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
    );
  });

  it('includes static public pages', () => {
    const xml = generateSitemapXml(siteUrl, []);
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml).toContain('<loc>https://example.com/impressum</loc>');
    expect(xml).toContain('<loc>https://example.com/ueber-ai-cms</loc>');
  });

  it('excludes auth-gated and API routes', () => {
    const xml = generateSitemapXml(siteUrl, []);
    expect(xml).not.toContain('/editor');
    expect(xml).not.toContain('/login');
    expect(xml).not.toContain('/api/');
  });

  it('includes articles with correct URLs', () => {
    const articles = [createArticle()];
    const xml = generateSitemapXml(siteUrl, articles);
    expect(xml).toContain(
      '<loc>https://example.com/articles/2026/01/test-article</loc>'
    );
  });

  it('includes lastmod for articles using date field', () => {
    const articles = [
      createArticle({ date: new Date('2026-03-20T10:30:00Z') }),
    ];
    const xml = generateSitemapXml(siteUrl, articles);
    expect(xml).toContain('<lastmod>2026-03-20</lastmod>');
  });

  it('formats lastmod as YYYY-MM-DD date only', () => {
    const articles = [
      createArticle({ date: new Date('2026-06-15T23:59:59Z') }),
    ];
    const xml = generateSitemapXml(siteUrl, articles);
    expect(xml).toContain('<lastmod>2026-06-15</lastmod>');
    expect(xml).not.toContain('T23:59:59');
  });

  it('handles multiple articles', () => {
    const articles = [
      createArticle({ articleId: '2026/01/first-article' }),
      createArticle({ articleId: '2026/02/second-article' }),
      createArticle({ articleId: '2025/12/third-article' }),
    ];
    const xml = generateSitemapXml(siteUrl, articles);
    expect(xml).toContain(
      '<loc>https://example.com/articles/2026/01/first-article</loc>'
    );
    expect(xml).toContain(
      '<loc>https://example.com/articles/2026/02/second-article</loc>'
    );
    expect(xml).toContain(
      '<loc>https://example.com/articles/2025/12/third-article</loc>'
    );
  });

  it('handles empty article list without errors', () => {
    const xml = generateSitemapXml(siteUrl, []);
    expect(xml).toContain('<urlset');
    expect(xml).toContain('</urlset>');
    expect(xml).not.toContain('/articles/');
  });

  it('does not include changefreq or priority (Google ignores them)', () => {
    const articles = [createArticle()];
    const xml = generateSitemapXml(siteUrl, articles);
    expect(xml).not.toContain('<changefreq>');
    expect(xml).not.toContain('<priority>');
  });

  it('escapes XML special characters in URLs', () => {
    const articles = [
      createArticle({ articleId: '2026/01/html-&-css-basics' }),
    ];
    const xml = generateSitemapXml(siteUrl, articles);
    expect(xml).toContain('html-&amp;-css-basics');
    expect(xml).not.toContain('html-&-css-basics</loc>');
  });

  it('removes trailing slash from site URL if present', () => {
    const xml = generateSitemapXml('https://example.com/', []);
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml).not.toContain('<loc>https://example.com//');
  });
});
