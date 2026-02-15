import type { APIRoute } from 'astro';
import { jsonResponse } from './_utils';

// GET /api/auth-check - returns 200 if authenticated, 401 if not
// Middleware handles authentication - if request reaches here, user is authenticated
export const GET: APIRoute = async () => {
  return jsonResponse({ authenticated: true });
};
