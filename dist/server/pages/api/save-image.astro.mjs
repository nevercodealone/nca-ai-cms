import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const { url, filepath } = await request.json();
    if (!url || !filepath) {
      return new Response(
        JSON.stringify({ error: "URL and filepath are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const base64Match = url.match(/^data:image\/\w+;base64,(.+)$/);
    if (!base64Match) {
      return new Response(JSON.stringify({ error: "Invalid image data URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const base64Data = base64Match[1];
    const imageBuffer = Buffer.from(base64Data, "base64");
    const fullPath = path.resolve(process.cwd(), filepath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    const webpBuffer = await sharp(imageBuffer).webp({ quality: 85, effort: 6 }).toBuffer();
    await fs.writeFile(fullPath, webpBuffer);
    return new Response(
      JSON.stringify({
        success: true,
        filepath
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Image save error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Image save failed"
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
