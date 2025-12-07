import { describe, it, expect } from 'vitest';
import { Article } from './Article';

describe('Article', () => {
  const defaultProps = {
    title: 'HTML Accessibility Grundlagen',
    description: 'Lernen Sie die Grundlagen der HTML-Barrierefreiheit',
    content: '# HTML Accessibility\n\nContent here...',
    date: new Date('2025-12-07'),
    tags: ['accessibility', 'html'],
    source:
      'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML',
  };

  it('creates article with valid props', () => {
    const article = new Article(defaultProps);
    expect(article.title).toBe('HTML Accessibility Grundlagen');
    expect(article.tags).toEqual(['accessibility', 'html']);
  });

  it('generates SEO-compliant slug from title', () => {
    const article = new Article(defaultProps);
    expect(article.slug.toString()).toBe('html-accessibility-grundlagen');
  });

  it('generates correct filename', () => {
    const article = new Article(defaultProps);
    expect(article.filename).toBe('html-accessibility-grundlagen.md');
  });

  it('generates correct filepath with year and month', () => {
    const article = new Article(defaultProps);
    expect(article.filepath).toBe(
      'src/content/articles/2025/12/html-accessibility-grundlagen.md'
    );
  });

  it('extracts year from date', () => {
    const article = new Article(defaultProps);
    expect(article.year).toBe(2025);
  });

  it('extracts zero-padded month from date', () => {
    const article = new Article({
      ...defaultProps,
      date: new Date('2025-01-15'),
    });
    expect(article.month).toBe('01');
  });

  it('generates valid frontmatter object', () => {
    const article = new Article(defaultProps);
    const frontmatter = article.toFrontmatter();

    expect(frontmatter.title).toBe('HTML Accessibility Grundlagen');
    expect(frontmatter.description).toBe(
      'Lernen Sie die Grundlagen der HTML-Barrierefreiheit'
    );
    expect(frontmatter.date).toBe('2025-12-07');
    expect(frontmatter.tags).toEqual(['accessibility', 'html']);
    expect(frontmatter.source).toBe(
      'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML'
    );
  });

  it('generates complete markdown with frontmatter', () => {
    const article = new Article(defaultProps);
    const markdown = article.toMarkdown();

    expect(markdown).toContain('---');
    expect(markdown).toContain('title: "HTML Accessibility Grundlagen"');
    expect(markdown).toContain('# HTML Accessibility');
  });

  it('prepends full title as H1 to content when title exceeds 60 chars', () => {
    const longTitle = 'A'.repeat(67);
    const article = new Article({
      ...defaultProps,
      title: longTitle,
    });

    expect(article.seoMetadata.title.length).toBe(60);
    expect(article.seoMetadata.title.endsWith('...')).toBe(true);
    expect(article.content.startsWith(`# ${longTitle}\n\n`)).toBe(true);
  });

  it('includes optional image fields', () => {
    const article = new Article({
      ...defaultProps,
      image: '/images/accessibility.webp',
      imageAlt: 'Accessibility illustration',
    });

    const frontmatter = article.toFrontmatter();
    expect(frontmatter.image).toBe('/images/accessibility.webp');
    expect(frontmatter.imageAlt).toBe('Accessibility illustration');
  });
});
