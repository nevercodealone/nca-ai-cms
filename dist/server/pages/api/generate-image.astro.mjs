import { GoogleGenAI, PersonGeneration } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { S as Slug } from '../../chunks/Slug_BsqCPyNW.mjs';
export { renderers } from '../../renderers.mjs';

class ImageGenerator {
  client;
  textClient;
  model;
  constructor(config) {
    this.client = new GoogleGenAI({ apiKey: config.apiKey });
    this.textClient = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || "imagen-4.0-generate-001";
  }
  async generate(title) {
    const prompt = this.buildPrompt(title);
    const filename = await this.generateSeoFilename(title);
    const filepath = `public/images/${filename}.webp`;
    try {
      const response = await this.client.models.generateImages({
        model: this.model,
        prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: "16:9",
          personGeneration: PersonGeneration.DONT_ALLOW
        }
      });
      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("No image generated");
      }
      const imageData = response.generatedImages[0];
      if (!imageData) {
        throw new Error("No image data in response");
      }
      const base64 = imageData.image?.imageBytes;
      if (!base64) {
        throw new Error("No image data received");
      }
      return {
        url: `data:image/png;base64,${base64}`,
        alt: this.generateAlt(title),
        filepath,
        base64
      };
    } catch (error) {
      console.error("Image generation error:", error);
      throw new Error(
        `Image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  buildPrompt(title) {
    return `Blog header image about "${title}" for a web accessibility article. Minimal Precisionism style inspired by Charles Sheeler: clean geometric shapes, sharp focus, smooth surfaces, no people, no text.`;
  }
  generateAlt(title) {
    return `Illustration zum Thema ${title} - Barrierefreiheit im Web`;
  }
  async generateSeoFilename(title) {
    const model = this.textClient.getGenerativeModel({
      model: "gemini-2.0-flash"
    });
    const prompt = `Generate a single SEO-optimized filename for an image about web accessibility article titled "${title}".
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
      const filename = result.response.text().trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
      return filename || Slug.generate(`barrierefreiheit-${topic}`);
    } catch {
      return Slug.generate(`barrierefreiheit-${topic}-accessibility`);
    }
  }
}

const POST = async ({ request }) => {
  try {
    const { title } = await request.json();
    if (!title) {
      return new Response(JSON.stringify({ error: "Title is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const apiKey = "AIzaSyAYdGG2Ym73LOnmnrRrBquBN5u47-OteEU";
    if (!apiKey) ;
    const generator = new ImageGenerator({ apiKey });
    const image = await generator.generate(title);
    return new Response(
      JSON.stringify({
        url: image.url,
        alt: image.alt,
        filepath: image.filepath
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Image generation failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
