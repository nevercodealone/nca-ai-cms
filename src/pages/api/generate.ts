import type { APIRoute } from 'astro';
import { ContentGenerator } from '../../services/ContentGenerator';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { url, keywords } = await request.json();

    if (!url && !keywords) {
      return new Response(JSON.stringify({ error: 'URL or keywords required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
    const article = url
      ? await generator.generateFromUrl(url)
      : await generator.generateFromKeywords(keywords);

    return new Response(
      JSON.stringify({
        title: article.title,
        description: article.description,
        content: article.content,
        filepath: article.filepath,
        tags: article.tags,
        source: article.source,
        date: article.date.toISOString(),
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
