import { describe, it, expect } from 'vitest';
import { SEOMetadata } from './SEOMetadata';

describe('SEOMetadata', () => {
  it('creates valid metadata', () => {
    const meta = new SEOMetadata('Test Title', 'Test description');
    expect(meta.title).toBe('Test Title');
    expect(meta.description).toBe('Test description');
  });

  it('throws error for title over 60 characters', () => {
    const longTitle = 'A'.repeat(61);
    expect(() => new SEOMetadata(longTitle, 'desc')).toThrow('Title must be max 60 characters');
  });

  it('throws error for description over 155 characters', () => {
    const longDesc = 'A'.repeat(156);
    expect(() => new SEOMetadata('title', longDesc)).toThrow('Description must be max 155 characters');
  });

  it('accepts exactly 60 character title', () => {
    const title = 'A'.repeat(60);
    const meta = new SEOMetadata(title, 'desc');
    expect(meta.title.length).toBe(60);
  });

  it('accepts exactly 155 character description', () => {
    const desc = 'A'.repeat(155);
    const meta = new SEOMetadata('title', desc);
    expect(meta.description.length).toBe(155);
  });

  describe('truncate', () => {
    it('truncates long title with ellipsis', () => {
      const longTitle = 'A'.repeat(70);
      const meta = SEOMetadata.truncate(longTitle, 'desc');
      expect(meta.title.length).toBe(60);
      expect(meta.title.endsWith('...')).toBe(true);
    });

    it('truncates long description with ellipsis', () => {
      const longDesc = 'A'.repeat(200);
      const meta = SEOMetadata.truncate('title', longDesc);
      expect(meta.description.length).toBe(155);
      expect(meta.description.endsWith('...')).toBe(true);
    });

    it('does not truncate short strings', () => {
      const meta = SEOMetadata.truncate('Short', 'Short desc');
      expect(meta.title).toBe('Short');
      expect(meta.description).toBe('Short desc');
    });
  });
});
