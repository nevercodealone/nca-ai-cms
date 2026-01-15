import type { APIRoute } from 'astro';
import { ImageGenerator } from '../../services/ImageGenerator';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { title } = await request.json();

    if (!title) {
      return new Response(JSON.stringify({ error: 'Title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GOOGLE_GEMINI_API_KEY not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const generator = new ImageGenerator({ apiKey });
    const image = await generator.generate(title);

    return new Response(
      JSON.stringify({
        url: image.url,
        alt: image.alt,
        filepath: image.filepath,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Image generation failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
