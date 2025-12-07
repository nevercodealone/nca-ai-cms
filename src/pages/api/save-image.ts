import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { url, filepath } = await request.json();

    if (!url || !filepath) {
      return new Response(
        JSON.stringify({ error: 'URL and filepath are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract base64 data from data URL
    const base64Match = url.match(/^data:image\/\w+;base64,(.+)$/);
    if (!base64Match) {
      return new Response(JSON.stringify({ error: 'Invalid image data URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const base64Data = base64Match[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Ensure directory exists
    const fullPath = path.resolve(process.cwd(), filepath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // Write image file
    await fs.writeFile(fullPath, imageBuffer);

    return new Response(
      JSON.stringify({
        success: true,
        filepath: filepath,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Image save error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Image save failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
