import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { url, folderPath } = await request.json();

    if (!url || !folderPath) {
      return new Response(
        JSON.stringify({ error: 'URL and folderPath are required' }),
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

    // Save hero.webp in the article folder
    const filepath = path.join(folderPath, 'hero.webp');
    const fullPath = path.resolve(process.cwd(), filepath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // Convert to WebP with high quality compression
    const webpBuffer = await sharp(imageBuffer)
      .webp({ quality: 85, effort: 6 })
      .toBuffer();

    // Write optimized WebP file
    await fs.writeFile(fullPath, webpBuffer);

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
