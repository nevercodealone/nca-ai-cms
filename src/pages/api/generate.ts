import type { APIRoute } from 'astro';
import { ContentGenerator } from '../../services/ContentGenerator';

const DEFAULT_URL =
  'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { url, topic } = await request.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sourceUrl = url || DEFAULT_URL;

    const apiKey = import.meta.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GOOGLE_GEMINI_API_KEY not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const generator = new ContentGenerator({ apiKey });
    const article = await generator.generate(sourceUrl, topic);

    return new Response(
      JSON.stringify({
        title: article.seoMetadata.title,
        description: article.seoMetadata.description,
        content: article.content,
        filepath: article.filepath,
        tags: article.tags,
        source: article.source,
        date: article.date.toISOString().split('T')[0],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Generation error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Generation failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
