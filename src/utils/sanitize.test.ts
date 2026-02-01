import { describe, it, expect } from 'vitest';
import { sanitizeMarkdownHtml, escapeJsonLd, escapeHtml } from './sanitize';

describe('sanitizeMarkdownHtml', () => {
  it('allows standard block elements', () => {
    const html = '<h1>Title</h1><p>Paragraph</p><blockquote>Quote</blockquote>';
    expect(sanitizeMarkdownHtml(html)).toBe(html);
  });

  it('allows lists', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    expect(sanitizeMarkdownHtml(html)).toBe(html);
  });

  it('allows tables', () => {
    const html =
      '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>';
    expect(sanitizeMarkdownHtml(html)).toBe(html);
  });

  it('allows code blocks with language class', () => {
    const html = '<pre><code class="language-html">&lt;div&gt;</code></pre>';
    expect(sanitizeMarkdownHtml(html)).toBe(html);
  });

  it('allows images with safe attributes', () => {
    const html =
      '<img src="https://example.com/img.webp" alt="Photo" loading="lazy" />';
    const result = sanitizeMarkdownHtml(html);
    expect(result).toContain('src="https://example.com/img.webp"');
    expect(result).toContain('alt="Photo"');
  });

  it('allows safe links', () => {
    const html = '<a href="https://example.com" title="Example">Link</a>';
    const result = sanitizeMarkdownHtml(html);
    expect(result).toContain('href="https://example.com"');
  });

  it('strips script tags', () => {
    const html = '<p>Safe</p><script>alert("xss")</script>';
    expect(sanitizeMarkdownHtml(html)).toBe('<p>Safe</p>');
  });

  it('strips iframe tags', () => {
    const html = '<p>Safe</p><iframe src="https://evil.com"></iframe>';
    expect(sanitizeMarkdownHtml(html)).toBe('<p>Safe</p>');
  });

  it('strips event handlers from allowed elements', () => {
    const html = '<p onclick="alert(1)">Text</p>';
    expect(sanitizeMarkdownHtml(html)).toBe('<p>Text</p>');
  });

  it('strips onerror from img tags', () => {
    const html = '<img src="x" onerror="alert(1)" />';
    const result = sanitizeMarkdownHtml(html);
    expect(result).not.toContain('onerror');
  });

  it('strips javascript: URLs from links', () => {
    const html = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitizeMarkdownHtml(html);
    expect(result).not.toContain('javascript:');
  });

  it('strips style attributes', () => {
    const html = '<p style="background:url(evil)">Text</p>';
    expect(sanitizeMarkdownHtml(html)).toBe('<p>Text</p>');
  });

  it('strips form elements', () => {
    const html = '<form action="/steal"><input type="text" /></form>';
    expect(sanitizeMarkdownHtml(html)).toBe('');
  });

  it('strips object and embed tags', () => {
    const html = '<object data="evil.swf"></object><embed src="evil.swf" />';
    expect(sanitizeMarkdownHtml(html)).toBe('');
  });

  it('handles empty string', () => {
    expect(sanitizeMarkdownHtml('')).toBe('');
  });

  it('handles string with no HTML', () => {
    expect(sanitizeMarkdownHtml('plain text')).toBe('plain text');
  });
});

describe('escapeJsonLd', () => {
  it('escapes </script> in JSON-LD strings', () => {
    const json = '{"name":"Test</script><script>alert(1)"}';
    const result = escapeJsonLd(json);
    expect(result).not.toContain('</script>');
    expect(result).toContain('<\\/script');
  });

  it('escapes <!-- HTML comments', () => {
    const json = '{"name":"Test<!--comment-->"}';
    const result = escapeJsonLd(json);
    expect(result).not.toContain('<!--');
  });

  it('handles case-insensitive </SCRIPT>', () => {
    const json = '{"name":"</SCRIPT>"}';
    const result = escapeJsonLd(json);
    expect(result).not.toContain('</SCRIPT>');
  });

  it('preserves valid JSON without dangerous sequences', () => {
    const obj = { name: 'Test', url: 'https://example.com' };
    const json = JSON.stringify(obj);
    const escaped = escapeJsonLd(json);
    expect(escaped).toBe(json);
  });
});

describe('escapeHtml', () => {
  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#039;s');
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('handles string with no special characters', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});
