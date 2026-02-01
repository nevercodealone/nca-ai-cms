import type { APIRoute } from 'astro';
import { SchedulerService } from '../../../services/SchedulerService';
import { AstroSchedulerDBAdapter } from '../../../services/SchedulerDBAdapter';

function getService(): SchedulerService {
  return new SchedulerService(new AstroSchedulerDBAdapter());
}

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const service = getService();
    await service.delete(id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Scheduler delete error:', error);
    const status =
      error instanceof Error && error.message.includes('not found')
        ? 404
        : error instanceof Error && error.message.includes('Cannot delete')
          ? 403
          : 500;
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to delete post',
      }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
