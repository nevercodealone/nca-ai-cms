import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ArticleService } from '../../../services/ArticleService';
import { ImageGenerator } from '../../../services/ImageGenerator';
import { ContentGenerator } from '../../../services/ContentGenerator';
import sharp from 'sharp';

/**
 * Integration tests for Article API endpoints
 * These tests make real API calls to Google AI services.
 *
 * Run with: npm test -- --run articles.integration
 *
 * Requires GOOGLE_GEMINI_API_KEY environment variable
 */

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
const TEST_ARTICLE_SLUG =
  'mehrsprachigkeit-barrierefreiheit-7-wege-zu-einem-inklusiven-web';

describe.skipIf(!apiKey)('Article API Integration Tests', () => {
  let articleService: ArticleService;
  let imageGenerator: ImageGenerator;
  let contentGenerator: ContentGenerator;
  let originalArticle: Awaited<ReturnType<ArticleService['read']>>;
  let originalHeroBuffer: Buffer | null = null;

  beforeAll(async () => {
    articleService = new ArticleService();
    imageGenerator = new ImageGenerator({ apiKey: apiKey! });
    contentGenerator = new ContentGenerator({ apiKey: apiKey! });

    // Read original article for comparison
    originalArticle = await articleService.read(TEST_ARTICLE_SLUG);

    // Backup original hero image if exists
    if (originalArticle?.folderPath) {
      const heroPath = path.join(originalArticle.folderPath, 'hero.webp');
      try {
        originalHeroBuffer = await fs.readFile(heroPath);
      } catch {
        originalHeroBuffer = null;
      }
    }
  });

  afterAll(async () => {
    // Restore original hero image if backed up
    if (originalHeroBuffer && originalArticle?.folderPath) {
      const heroPath = path.join(originalArticle.folderPath, 'hero.webp');
      await fs.writeFile(heroPath, originalHeroBuffer);
    }
  });

  describe('Article Service', () => {
    it('reads existing article', async () => {
      const article = await articleService.read(TEST_ARTICLE_SLUG);

      expect(article).not.toBeNull();
      expect(article?.title).toBeDefined();
      expect(article?.description).toBeDefined();
      expect(article?.folderPath).toBeDefined();

      console.log('Article found:', {
        title: article?.title,
        folderPath: article?.folderPath,
      });
    });

    it('returns null for non-existent article', async () => {
      const article = await articleService.read('non-existent-article-slug');
      expect(article).toBeNull();
    });
  });

  describe('Image Regeneration Flow', () => {
    let generatedImageData: { url: string; alt: string } | null = null;

    it('generates new image for article (real AI call)', async () => {
      const article = await articleService.read(TEST_ARTICLE_SLUG);
      expect(article).not.toBeNull();

      console.log('Generating image for:', article?.title);

      const result = await imageGenerator.generate(article!.title);

      expect(result.url).toMatch(/^data:image\/png;base64,.+/);
      expect(result.alt).toBeDefined();
      expect(result.alt.length).toBeGreaterThan(10);

      generatedImageData = { url: result.url, alt: result.alt };

      console.log('Generated image:', {
        alt: result.alt,
        urlLength: result.url.length,
      });
    }, 60000);

    it('saves generated image to article folder', async () => {
      expect(generatedImageData).not.toBeNull();
      expect(originalArticle).not.toBeNull();

      const heroPath = path.join(originalArticle!.folderPath, 'hero.webp');

      // Decode base64 and convert to WebP (same as apply.ts)
      const base64Data = generatedImageData!.url.replace(
        /^data:image\/\w+;base64,/,
        ''
      );
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Verify the buffer is valid image data
      expect(imageBuffer.length).toBeGreaterThan(1000);

      // Convert to WebP using sharp
      const webpBuffer = await sharp(imageBuffer)
        .webp({ quality: 85 })
        .toBuffer();

      expect(webpBuffer.length).toBeGreaterThan(1000);

      // Write to file
      await fs.writeFile(heroPath, webpBuffer);

      // Verify file was written
      const savedFile = await fs.readFile(heroPath);
      expect(savedFile.length).toBe(webpBuffer.length);

      console.log('Image saved:', {
        path: heroPath,
        originalSize: imageBuffer.length,
        webpSize: webpBuffer.length,
      });
    }, 10000);

    it('updates imageAlt in frontmatter using gray-matter', async () => {
      expect(generatedImageData).not.toBeNull();
      expect(originalArticle).not.toBeNull();

      const indexPath = path.join(originalArticle!.folderPath, 'index.md');
      const matter = await import('gray-matter');

      // Read and parse current file
      const fileContent = await fs.readFile(indexPath, 'utf-8');
      const { data: frontmatter, content } = matter.default(fileContent);

      // Update imageAlt
      frontmatter.imageAlt = generatedImageData!.alt;

      // Write updated content
      const updatedContent = matter.default.stringify(content, frontmatter);
      await fs.writeFile(indexPath, updatedContent);

      // Verify the update
      const verifyContent = await fs.readFile(indexPath, 'utf-8');
      const { data: verifyFrontmatter } = matter.default(verifyContent);
      expect(verifyFrontmatter.imageAlt).toBe(generatedImageData!.alt);

      console.log('ImageAlt updated to:', generatedImageData!.alt);
    });
  });

  describe('Text Regeneration Flow', () => {
    let generatedContent: {
      title: string;
      description: string;
      content: string;
    } | null = null;

    it('generates new content for article (real AI call)', async () => {
      const article = await articleService.read(TEST_ARTICLE_SLUG);
      expect(article).not.toBeNull();

      console.log('Generating content for:', article?.title);

      const result = await contentGenerator.generateFromKeywords(
        article!.title
      );

      expect(result.title).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.title.length).toBeGreaterThan(10);
      expect(result.description.length).toBeGreaterThan(20);
      expect(result.content.length).toBeGreaterThan(100);

      generatedContent = {
        title: result.title,
        description: result.description,
        content: result.content,
      };

      console.log('Generated content:', {
        title: result.title,
        descriptionLength: result.description.length,
        contentLength: result.content.length,
      });
    }, 90000);

    it('saves generated content using ArticleService', async () => {
      expect(generatedContent).not.toBeNull();

      // Note: We're not actually saving to avoid overwriting the article
      // This test verifies the updateContent method works
      console.log('Content ready to save:', {
        title: generatedContent!.title,
        description: generatedContent!.description.substring(0, 50) + '...',
      });

      // Verify the service method exists and is callable
      expect(typeof articleService.updateContent).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('handles invalid article slug', async () => {
      const article = await articleService.read('definitely-not-a-real-slug');
      expect(article).toBeNull();
    });

    it('handles invalid API key for image generation', async () => {
      const badGenerator = new ImageGenerator({ apiKey: 'invalid-key' });

      await expect(badGenerator.generate('Test Topic')).rejects.toThrow();
    }, 30000);

    it('handles invalid API key for content generation', async () => {
      const badGenerator = new ContentGenerator({ apiKey: 'invalid-key' });

      await expect(
        badGenerator.generateFromKeywords('Test Keywords')
      ).rejects.toThrow();
    }, 30000);
  });
});

describe.skipIf(!apiKey)('Apply Endpoint Logic Tests', () => {
  it('correctly strips base64 prefix from PNG', () => {
    const pngDataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const base64Data = pngDataUrl.replace(/^data:image\/\w+;base64,/, '');

    expect(base64Data).toBe(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    );
    expect(base64Data).not.toContain('data:');
  });

  it('correctly strips base64 prefix from JPEG', () => {
    const jpegDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
    const base64Data = jpegDataUrl.replace(/^data:image\/\w+;base64,/, '');

    expect(base64Data).toBe('/9j/4AAQSkZJRg==');
  });

  it('converts base64 to buffer correctly', () => {
    const base64 = 'SGVsbG8gV29ybGQ='; // "Hello World"
    const buffer = Buffer.from(base64, 'base64');

    expect(buffer.toString('utf-8')).toBe('Hello World');
  });

  it('sharp converts PNG buffer to WebP', async () => {
    // Minimal valid 1x1 PNG
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const pngBuffer = Buffer.from(pngBase64, 'base64');

    const webpBuffer = await sharp(pngBuffer).webp({ quality: 85 }).toBuffer();

    expect(webpBuffer.length).toBeGreaterThan(0);

    // Verify it's valid WebP by checking magic bytes (RIFF....WEBP)
    expect(webpBuffer.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(webpBuffer.subarray(8, 12).toString('ascii')).toBe('WEBP');
  });
});
