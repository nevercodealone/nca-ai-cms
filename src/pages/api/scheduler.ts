import type { APIRoute } from 'astro';
import { SchedulerService } from '../../services/SchedulerService';
import { AstroSchedulerDBAdapter } from '../../services/SchedulerDBAdapter';

function getService(): SchedulerService {
  return new SchedulerService(new AstroSchedulerDBAdapter());
}

export const GET: APIRoute = async () => {
  try {
    const service = getService();
    const posts = await service.list();
    return new Response(JSON.stringify({ posts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Scheduler list error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to list posts',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    if (!data.input || !data.scheduledDate) {
      return new Response(
        JSON.stringify({ error: 'input and scheduledDate are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const service = getService();
    const post = await service.create({
      input: data.input,
      scheduledDate: new Date(data.scheduledDate),
    });

    return new Response(JSON.stringify({ post }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Scheduler create error:', error);
    const status =
      error instanceof Error && error.message.includes('already scheduled')
        ? 409
        : 500;
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to create post',
      }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
