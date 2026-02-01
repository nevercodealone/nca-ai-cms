import type { APIRoute } from 'astro';
import { SchedulerService } from '../../../services/SchedulerService';
import { AstroSchedulerDBAdapter } from '../../../services/SchedulerDBAdapter';
import { Article } from '../../../domain/entities/Article';
import { FileWriter } from '../../../services/FileWriter';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

function getService(): SchedulerService {
  return new SchedulerService(new AstroSchedulerDBAdapter());
}

async function publishPost(
  service: SchedulerService,
  postId: string
): Promise<{ id: string; publishedPath: string }> {
  const post = await service.getById(postId);

  if (!post.canPublish()) {
    throw new Error(`Cannot publish: post is in status "${post.status}"`);
  }

  if (!post.generatedTitle || !post.generatedContent) {
    throw new Error('Cannot publish: missing generated content');
  }

  // Create article with the scheduled date (not today)
  const articleProps = {
    title: post.generatedTitle,
    description: post.generatedDescription || '',
    content: post.generatedContent,
    date: post.scheduledDate,
    tags: post.parsedTags,
    image: './hero.webp',
    ...(post.generatedImageAlt ? { imageAlt: post.generatedImageAlt } : {}),
  };
  const article = new Article(articleProps);

  // Write article to filesystem
  const writer = new FileWriter();
  await writer.write(article);

  // Write image if available
  if (post.generatedImageData) {
    const imagePath = path.join(process.cwd(), article.folderPath, 'hero.webp');
    const imageBuffer = Buffer.from(post.generatedImageData, 'base64');
    const webpBuffer = await sharp(imageBuffer)
      .webp({ quality: 85, effort: 6 })
      .toBuffer();
    await fs.mkdir(path.dirname(imagePath), { recursive: true });
    await fs.writeFile(imagePath, webpBuffer);
  }

  // Mark as published in DB
  await service.markPublished(post.id, article.folderPath);

  return { id: post.id, publishedPath: article.folderPath };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const service = getService();

    // Auto-publish all due posts
    if (data.mode === 'auto') {
      const duePosts = await service.getDuePosts();
      const results: { id: string; publishedPath: string }[] = [];

      for (const post of duePosts) {
        try {
          const result = await publishPost(service, post.id);
          results.push(result);
        } catch (error) {
          console.error(`Failed to auto-publish ${post.id}:`, error);
        }
      }

      return new Response(JSON.stringify({ published: results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Publish single post
    if (!data.id) {
      return new Response(
        JSON.stringify({ error: 'id or mode:"auto" is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await publishPost(service, data.id);

    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Scheduler publish error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Publish failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
