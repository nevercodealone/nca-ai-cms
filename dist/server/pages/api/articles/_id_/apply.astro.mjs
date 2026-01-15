import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import matter from 'gray-matter';
import { A as ArticleService, a as ArticleNotFoundError } from '../../../../chunks/ArticleService_bEWOXh-P.mjs';
export { renderers } from '../../../../renderers.mjs';

const POST = async ({ params, request }) => {
  try {
    const slug = params.id;
    if (!slug) {
      return new Response(JSON.stringify({ error: "Article ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const data = await request.json();
    const service = new ArticleService();
    const existingArticle = await service.read(slug);
    if (!existingArticle) {
      throw new ArticleNotFoundError(slug);
    }
    if (data.imageUrl) {
      const heroPath = path.join(existingArticle.folderPath, "hero.webp");
      console.log("Saving image to:", heroPath);
      console.log("Image URL length:", data.imageUrl.length);
      const base64Data = data.imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");
      console.log("Image buffer size:", imageBuffer.length);
      const webpBuffer = await sharp(imageBuffer).webp({ quality: 85 }).toBuffer();
      console.log("WebP buffer size:", webpBuffer.length);
      await fs.writeFile(heroPath, webpBuffer);
      console.log("Image saved successfully");
      if (data.imageAlt) {
        const indexPath = path.join(existingArticle.folderPath, "index.md");
        const fileContent = await fs.readFile(indexPath, "utf-8");
        const { data: frontmatter, content } = matter(fileContent);
        frontmatter.imageAlt = data.imageAlt;
        const updatedContent = matter.stringify(content, frontmatter);
        await fs.writeFile(indexPath, updatedContent);
      }
    }
    if (data.content || data.title || data.description) {
      await service.updateContent(slug, {
        ...data.title && { title: data.title },
        ...data.description && { description: data.description },
        ...data.content && { content: data.content }
      });
    }
    return new Response(
      JSON.stringify({
        success: true,
        articleId: existingArticle.articleId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    if (error instanceof ArticleNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.error("Apply changes error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Apply failed"
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
