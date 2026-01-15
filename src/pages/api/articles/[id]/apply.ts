import type { APIRoute } from 'astro';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import matter from 'gray-matter';
import {
  ArticleService,
  ArticleNotFoundError,
} from '../../../../services/ArticleService';

interface ApplyRequest {
  // For text updates
  title?: string;
  description?: string;
  content?: string;
  tags?: string[];
  // For image updates
  imageUrl?: string;
  imageAlt?: string;
}

// POST /api/articles/[id]/apply - Save regenerated content or image
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const slug = params.id;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Article ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data: ApplyRequest = await request.json();
    const service = new ArticleService();

    // Read existing article
    const existingArticle = await service.read(slug);
    if (!existingArticle) {
      throw new ArticleNotFoundError(slug);
    }

    // Handle image update if imageUrl is provided
    if (data.imageUrl) {
      const heroPath = path.join(existingArticle.folderPath, 'hero.webp');

      console.log('Saving image to:', heroPath);
      console.log('Image URL length:', data.imageUrl.length);

      // Decode base64 image data and convert to WebP
      const base64Data = data.imageUrl.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      console.log('Image buffer size:', imageBuffer.length);

      // Convert to WebP using sharp
      const webpBuffer = await sharp(imageBuffer)
        .webp({ quality: 85 })
        .toBuffer();

      console.log('WebP buffer size:', webpBuffer.length);

      await fs.writeFile(heroPath, webpBuffer);
      console.log('Image saved successfully');

      // Update imageAlt if provided
      if (data.imageAlt) {
        const indexPath = path.join(existingArticle.folderPath, 'index.md');
        const fileContent = await fs.readFile(indexPath, 'utf-8');
        const { data: frontmatter, content } = matter(fileContent);

        frontmatter.imageAlt = data.imageAlt;

        const updatedContent = matter.stringify(content, frontmatter);
        await fs.writeFile(indexPath, updatedContent);
      }
    }

    // Handle text update if content is provided
    if (data.content || data.title || data.description) {
      await service.updateContent(slug, {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.content && { content: data.content }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        articleId: existingArticle.articleId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    if (error instanceof ArticleNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('Apply changes error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Apply failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
