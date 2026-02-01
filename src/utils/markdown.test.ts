import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('converts markdown headings to HTML', async () => {
    const result = await renderMarkdown('# Hello World');
    expect(result).toContain('<h1>');
    expect(result).toContain('Hello World');
  });

  it('converts markdown paragraphs to HTML', async () => {
    const result = await renderMarkdown('This is a paragraph.');
    expect(result).toContain('<p>');
  });

  it('converts markdown links to HTML', async () => {
    const result = await renderMarkdown('[Link](https://example.com)');
    expect(result).toContain('href="https://example.com"');
  });

  it('converts markdown code blocks to HTML', async () => {
    const result = await renderMarkdown('```html\n<div>test</div>\n```');
    expect(result).toContain('<pre>');
    expect(result).toContain('<code');
  });

  it('strips script tags injected in markdown', async () => {
    const result = await renderMarkdown(
      'Hello <script>alert("xss")</script> world'
    );
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
  });

  it('strips event handlers injected in markdown', async () => {
    const result = await renderMarkdown(
      'Click <a href="#" onclick="alert(1)">here</a>'
    );
    expect(result).not.toContain('onclick');
  });

  it('handles empty string', async () => {
    const result = await renderMarkdown('');
    expect(result).toBe('');
  });

  it('preserves blockquotes', async () => {
    const result = await renderMarkdown('> This is a quote');
    expect(result).toContain('<blockquote>');
  });

  it('preserves images with alt text', async () => {
    const result = await renderMarkdown(
      '![Alt text](https://example.com/img.webp)'
    );
    expect(result).toContain('<img');
    expect(result).toContain('alt="Alt text"');
  });
});
