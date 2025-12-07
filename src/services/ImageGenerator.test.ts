import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGenerator } from './ImageGenerator';

// Mock the Google AI clients with proper class implementations
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      models = {
        generateImages: vi.fn().mockResolvedValue({
          generatedImages: [
            {
              image: {
                imageBytes: 'dGVzdC1pbWFnZS1kYXRh',
              },
            },
          ],
        }),
      };
    },
    PersonGeneration: {
      DONT_ALLOW: 'DONT_ALLOW',
      ALLOW_ADULT: 'ALLOW_ADULT',
      ALLOW_ALL: 'ALLOW_ALL',
    },
  };
});

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class MockGoogleGenerativeAI {
      getGenerativeModel() {
        return {
          generateContent: vi.fn().mockResolvedValue({
            response: {
              text: () => 'barrierefreiheit-formulare-accessible-web-forms',
            },
          }),
        };
      }
    },
  };
});

describe('ImageGenerator', () => {
  let generator: ImageGenerator;

  beforeEach(() => {
    vi.clearAllMocks();
    generator = new ImageGenerator({ apiKey: 'test-api-key' });
  });

  describe('constructor', () => {
    it('creates instance with default model', () => {
      expect(generator).toBeInstanceOf(ImageGenerator);
    });

    it('accepts custom model', () => {
      const customGenerator = new ImageGenerator({
        apiKey: 'test-key',
        model: 'imagen-4.0-ultra-generate-001',
      });
      expect(customGenerator).toBeInstanceOf(ImageGenerator);
    });
  });

  describe('generate', () => {
    it('generates image with topic only', async () => {
      const result = await generator.generate('Forms');

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('alt');
      expect(result).toHaveProperty('filepath');
      expect(result.url).toContain('data:image/png;base64,');
      expect(result.alt).toContain('Barrierefreiheit');
    });

    it('generates image with topic and title', async () => {
      const result = await generator.generate(
        'Forms',
        'Barrierefreie Formulare'
      );

      expect(result.alt).toContain('Barrierefreie Formulare');
    });

    it('returns filepath with .png extension', async () => {
      const result = await generator.generate('Images');

      expect(result.filepath).toMatch(/\.png$/);
      expect(result.filepath).toMatch(/^public\/images\//);
    });

    it('generates SEO-friendly filename via AI', async () => {
      const result = await generator.generate('Forms');

      expect(result.filepath).toContain('barrierefreiheit');
    });
  });

  describe('alt text generation', () => {
    it('includes topic in alt text', async () => {
      const result = await generator.generate('Keyboard and Focus');

      expect(result.alt).toContain('Keyboard and Focus');
    });

    it('prefers title over topic in alt text when provided', async () => {
      const result = await generator.generate(
        'Forms',
        'Formulare richtig gestalten'
      );

      expect(result.alt).toContain('Formulare richtig gestalten');
    });
  });
});

describe('ImageGenerator prompt building', () => {
  it('creates prompt with accessibility context', async () => {
    const generator = new ImageGenerator({ apiKey: 'test-key' });
    const result = await generator.generate('CAPTCHA');

    expect(result.url).toBeDefined();
  });
});
