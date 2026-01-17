import type { APIRoute } from 'astro';
import {
  ArticleService,
  ArticleNotFoundError,
} from '../../../../services/ArticleService';
import { ContentGenerator } from '../../../../services/ContentGenerator';
import { PromptService } from '../../../../services/PromptService';
import { getEnvVariable } from '../../../../utils/envUtils';

// POST /api/articles/[id]/regenerate-text - Generate new content for article
// Returns preview of new content WITHOUT saving
export const POST: APIRoute = async ({ params }) => {
  try {
    const slug = params.id;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Article ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Read existing article to get title for regeneration
    const service = new ArticleService();
    const existingArticle = await service.read(slug);

    if (!existingArticle) {
      throw new ArticleNotFoundError(slug);
    }

    // Generate new content using existing title as keywords
    const apiKey = getEnvVariable('GOOGLE_GEMINI_API_KEY');
    const promptService = new PromptService();
    const generator = new ContentGenerator({ apiKey, promptService });

    // Use the existing title as keywords for regeneration
    const newArticle = await generator.generateFromKeywords(
      existingArticle.title
    );

    return new Response(
      JSON.stringify({
        title: newArticle.title,
        description: newArticle.description,
        content: newArticle.content,
        tags: newArticle.tags,
        // Include original article info for reference
        originalTitle: existingArticle.title,
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

    console.error('Regenerate text error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Regeneration failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
