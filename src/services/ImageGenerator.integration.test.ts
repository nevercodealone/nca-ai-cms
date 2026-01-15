import { describe, it, expect, beforeAll } from 'vitest';
import { ImageGenerator } from './ImageGenerator';

/**
 * Integration tests for ImageGenerator
 * These tests make real API calls to Google AI services.
 *
 * Run with: npm test -- --run ImageGenerator.integration
 *
 * Requires GOOGLE_GEMINI_API_KEY environment variable
 */

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

describe.skipIf(!apiKey)('ImageGenerator Integration', () => {
  let generator: ImageGenerator;

  beforeAll(() => {
    generator = new ImageGenerator({ apiKey: apiKey! });
  });

  describe('SEO filename generation (real API)', () => {
    it('generates SEO filename for Forms topic', async () => {
      const result = await generator.generate('Forms');

      expect(result.filepath).toMatch(/^public\/images\/.+\.png$/);
      expect(result.filepath.toLowerCase()).toMatch(
        /barrierefreiheit|form|accessibility/
      );
      console.log('Generated filepath:', result.filepath);
    }, 30000);

    it('generates SEO filename for Images topic', async () => {
      const result = await generator.generate('Images');

      expect(result.filepath).toMatch(/^public\/images\/.+\.png$/);
      console.log('Generated filepath:', result.filepath);
    }, 30000);

    it('generates SEO filename for Keyboard and Focus topic', async () => {
      const result = await generator.generate('Keyboard and Focus');

      expect(result.filepath).toMatch(/^public\/images\/.+\.png$/);
      console.log('Generated filepath:', result.filepath);
    }, 30000);
  });

  describe('Image generation (real API)', () => {
    it('generates image for topic', async () => {
      const result = await generator.generate('Contrast');

      expect(result.url).toMatch(/^data:image\/png;base64,.+/);
      expect(result.alt).toContain('Barrierefreiheit');
      expect(result.filepath).toMatch(/\.png$/);

      console.log('Generated image:');
      console.log('  - Alt:', result.alt);
      console.log('  - Filepath:', result.filepath);
      console.log('  - URL length:', result.url.length);
    }, 60000);

    it('generates image with title context', async () => {
      const result = await generator.generate(
        'Barrierefreie Webformulare gestalten'
      );

      expect(result.url).toMatch(/^data:image\/png;base64,.+/);
      expect(result.alt).toContain('Barrierefreie Webformulare gestalten');

      console.log('Generated with title:');
      console.log('  - Alt:', result.alt);
      console.log('  - Filepath:', result.filepath);
    }, 60000);
  });

  describe('Alt text generation', () => {
    it('generates German alt text', async () => {
      const result = await generator.generate('Tables');

      expect(result.alt).toMatch(/Illustration|Thema|Barrierefreiheit/);
      console.log('Alt text:', result.alt);
    }, 30000);
  });

  describe('Error handling', () => {
    it('handles invalid API key gracefully', async () => {
      const badGenerator = new ImageGenerator({ apiKey: 'invalid-key' });

      await expect(badGenerator.generate('Test')).rejects.toThrow();
    }, 30000);
  });
});

describe.skipIf(!apiKey)('SEO Filename Quality', () => {
  let generator: ImageGenerator;

  beforeAll(() => {
    generator = new ImageGenerator({ apiKey: apiKey! });
  });

  it('generates unique filenames for different topics', async () => {
    const topics = ['Forms', 'Images', 'Tables'];
    const filenames: string[] = [];

    for (const topic of topics) {
      const result = await generator.generate(topic);
      filenames.push(result.filepath);
    }

    // All filenames should be unique
    const uniqueFilenames = new Set(filenames);
    expect(uniqueFilenames.size).toBe(topics.length);

    console.log('Generated unique filenames:');
    filenames.forEach((f, i) => console.log(`  ${topics[i]}: ${f}`));
  }, 90000);
});
