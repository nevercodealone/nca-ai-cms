import { GoogleGenAI, PersonGeneration } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Slug } from '../domain/value-objects/Slug';

export interface GeneratedImage {
  url: string;
  alt: string;
  filepath: string;
  base64?: string;
}

export interface ImageGeneratorConfig {
  apiKey: string;
  model?: string;
}

export class ImageGenerator {
  private client: GoogleGenAI;
  private textClient: GoogleGenerativeAI;
  private model: string;

  constructor(config: ImageGeneratorConfig) {
    this.client = new GoogleGenAI({ apiKey: config.apiKey });
    this.textClient = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'imagen-4.0-generate-001';
  }

  async generate(topic: string, title?: string): Promise<GeneratedImage> {
    const prompt = this.buildPrompt(topic, title);
    const filename = await this.generateSeoFilename(topic);
    const filepath = `public/images/${filename}.webp`;

    try {
      const response = await this.client.models.generateImages({
        model: this.model,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '16:9',
          personGeneration: PersonGeneration.DONT_ALLOW,
        },
      });

      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('No image generated');
      }

      const imageData = response.generatedImages[0];
      if (!imageData) {
        throw new Error('No image data in response');
      }
      const base64 = imageData.image?.imageBytes;

      if (!base64) {
        throw new Error('No image data received');
      }

      return {
        url: `data:image/png;base64,${base64}`,
        alt: this.generateAlt(topic, title),
        filepath,
        base64,
      };
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error(
        `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private buildPrompt(topic: string, title?: string): string {
    const context = title || topic;

    return `Blog header image about "${context}" for a web accessibility article. Minimal Precisionism style inspired by Charles Sheeler: clean geometric shapes, sharp focus, smooth surfaces, no people, no text.`;
  }

  private generateAlt(topic: string, title?: string): string {
    if (title) {
      return `Illustration zum Thema ${title} - Barrierefreiheit im Web`;
    }
    return `Illustration zum Thema ${topic} - Barrierefreiheit im Web`;
  }

  private async generateSeoFilename(topic: string): Promise<string> {
    const model = this.textClient.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    const prompt = `Generate a single SEO-optimized filename for an image about web accessibility topic "${topic}".
Requirements:
- German and English keywords mixed
- Lowercase, words separated by hyphens
- Max 5-6 words
- No file extension
- Focus on: barrierefreiheit, accessibility, web, and the topic
- Return ONLY the filename, nothing else

Example for topic "Forms": barrierefreiheit-formulare-accessible-forms`;

    try {
      const result = await model.generateContent(prompt);
      const filename = result.response
        .text()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '');
      return filename || Slug.generate(`barrierefreiheit-${topic}`);
    } catch {
      return Slug.generate(`barrierefreiheit-${topic}-accessibility`);
    }
  }
}
