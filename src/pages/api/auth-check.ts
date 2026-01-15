import type { APIRoute } from 'astro';

// GET /api/auth-check - returns 200 if authenticated, 401 if not
// Middleware handles authentication - if request reaches here, user is authenticated
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ authenticated: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
