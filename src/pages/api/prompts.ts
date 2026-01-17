import type { APIRoute } from 'astro';
import { PromptService } from '../../services/PromptService';

const service = new PromptService();

// GET /api/prompts - Get all prompts and settings
export const GET: APIRoute = async () => {
  try {
    const [prompts, settings] = await Promise.all([
      service.getAllPrompts(),
      service.getAllSettings(),
    ]);

    return new Response(
      JSON.stringify({
        prompts,
        settings,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get prompts error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to get prompts',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// POST /api/prompts - Update a prompt or setting
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    if (data.type === 'prompt' && data.id && data.promptText !== undefined) {
      await service.updatePrompt(data.id, data.promptText);
      return new Response(
        JSON.stringify({ success: true, type: 'prompt', id: data.id }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (data.type === 'setting' && data.key && data.value !== undefined) {
      await service.updateSetting(data.key, data.value);
      return new Response(
        JSON.stringify({ success: true, type: 'setting', key: data.key }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Invalid request: missing type, id/key, or value',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Update prompt error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to update',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
