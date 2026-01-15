import type { APIRoute } from 'astro';
import {
  ArticleService,
  ArticleNotFoundError,
} from '../../../services/ArticleService';

// DELETE /api/articles/[id] - Delete an article by slug
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const slug = params.id;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Article ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const service = new ArticleService();
    await service.delete(slug);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof ArticleNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('Delete error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Delete failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// GET /api/articles/[id] - Get article details
export const GET: APIRoute = async ({ params }) => {
  try {
    const slug = params.id;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Article ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const service = new ArticleService();
    const article = await service.read(slug);

    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(article), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Read error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Read failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
