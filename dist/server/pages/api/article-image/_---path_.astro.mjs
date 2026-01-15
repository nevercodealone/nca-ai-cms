import * as fs from 'fs/promises';
import * as path from 'path';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ params }) => {
  const imagePath = params.path;
  if (!imagePath) {
    return new Response("Not found", { status: 404 });
  }
  const allowedExtensions = [".webp", ".png", ".jpg", ".jpeg"];
  const ext = path.extname(imagePath).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return new Response("Invalid file type", { status: 400 });
  }
  const normalizedPath = path.normalize(imagePath);
  if (normalizedPath.includes("..")) {
    return new Response("Invalid path", { status: 400 });
  }
  const fullPath = path.join(
    process.cwd(),
    "src/content/articles",
    normalizedPath
  );
  try {
    const imageBuffer = await fs.readFile(fullPath);
    const contentType = ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : "image/jpeg";
    const stats = await fs.stat(fullPath);
    const etag = `"${stats.mtimeMs.toString(36)}"`;
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=0, must-revalidate",
        ETag: etag
      }
    });
  } catch {
    return new Response("Image not found", { status: 404 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
