import type { APIRoute } from 'astro';
import { Article } from '../../domain/entities/Article';
import { FileWriter } from '../../services/FileWriter';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    const article = new Article({
      title: data.title,
      description: data.description,
      content: data.content,
      date: new Date(data.date || Date.now()),
      tags: data.tags || [],
      source: data.source,
      image: data.image,
      imageAlt: data.imageAlt,
    });

    const writer = new FileWriter();
    const result = await writer.write(article);

    return new Response(
      JSON.stringify({
        success: true,
        filepath: result.filepath,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Save error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Save failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
