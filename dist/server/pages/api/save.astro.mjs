import { A as Article } from '../../chunks/Article_dOm2z5B6.mjs';
import * as fs from 'fs/promises';
import * as path from 'path';
export { renderers } from '../../renderers.mjs';

class FileWriter {
  basePath;
  constructor(basePath = process.cwd()) {
    this.basePath = basePath;
  }
  async write(article) {
    const filepath = path.join(this.basePath, article.filepath);
    const dir = path.dirname(filepath);
    await fs.mkdir(dir, { recursive: true });
    const exists = await this.fileExists(filepath);
    if (exists) {
      const newPath = await this.getUniqueFilepath(filepath);
      await fs.writeFile(newPath, article.toMarkdown(), "utf-8");
      return { filepath: newPath, created: true };
    }
    await fs.writeFile(filepath, article.toMarkdown(), "utf-8");
    return { filepath, created: true };
  }
  async fileExists(filepath) {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }
  async getUniqueFilepath(filepath) {
    const ext = path.extname(filepath);
    const base = filepath.slice(0, -ext.length);
    let counter = 2;
    let newPath = `${base}-${counter}${ext}`;
    while (await this.fileExists(newPath)) {
      counter++;
      newPath = `${base}-${counter}${ext}`;
    }
    return newPath;
  }
}

const POST = async ({ request }) => {
  try {
    const data = await request.json();
    const article = new Article({
      title: data.title,
      description: data.description,
      content: data.content,
      date: new Date(data.date || Date.now()),
      tags: data.tags || [],
      image: data.image,
      imageAlt: data.imageAlt
    });
    const writer = new FileWriter();
    const result = await writer.write(article);
    return new Response(
      JSON.stringify({
        success: true,
        filepath: result.filepath
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Save error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Save failed"
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
