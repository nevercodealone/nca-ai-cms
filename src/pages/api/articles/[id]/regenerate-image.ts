import type { APIRoute } from 'astro';
import {
  ArticleService,
  ArticleNotFoundError,
} from '../../../../services/ArticleService';
import { ImageGenerator } from '../../../../services/ImageGenerator';
import { getEnvVariable } from '../../../../utils/envUtils';

// POST /api/articles/[id]/regenerate-image - Generate new image for article
// Returns preview of new image URL WITHOUT saving
export const POST: APIRoute = async ({ params }) => {
  try {
    const slug = params.id;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Article ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Read existing article to get title for image generation
    const service = new ArticleService();
    const existingArticle = await service.read(slug);

    if (!existingArticle) {
      throw new ArticleNotFoundError(slug);
    }

    // Generate new image using article title
    const apiKey = getEnvVariable('GOOGLE_GEMINI_API_KEY');
    const generator = new ImageGenerator({ apiKey });
    const image = await generator.generate(existingArticle.title);

    return new Response(
      JSON.stringify({
        url: image.url,
        alt: image.alt,
        // Include article info for reference
        articleId: existingArticle.articleId,
        articleTitle: existingArticle.title,
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

    console.error('Regenerate image error:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Image regeneration failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
