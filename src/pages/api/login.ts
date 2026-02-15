import type { APIRoute } from 'astro';
import { getEnvVariable } from '../../utils/envUtils';
import { jsonResponse, jsonError } from './_utils';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { username, password } = await request.json();

    const validUser = getEnvVariable('EDITOR_ADMIN');
    const validPass = getEnvVariable('EDITOR_PASSWORD');

    if (username !== validUser || password !== validPass) {
      return jsonError('Invalid credentials', 401);
    }

    // Create auth token
    const token = Buffer.from(`${username}:${password}`).toString('base64');

    // Set httpOnly cookie
    cookies.set('editor-auth', token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return jsonError(error, 400);
  }
};
