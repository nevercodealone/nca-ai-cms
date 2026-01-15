import { defineMiddleware } from 'astro:middleware';

const PROTECTED_PATHS = ['/editor', '/api/generate', '/api/save'];
const PUBLIC_API = ['/api/login', '/api/logout'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Allow public API routes
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) {
    return next();
  }

  // Check if path needs protection
  const needsAuth = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!needsAuth) {
    return next();
  }

  // Check auth cookie
  const authCookie = context.cookies.get('editor-auth');
  if (!authCookie?.value) {
    // API routes return 401, pages redirect to login
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/login');
  }

  // Validate cookie value
  const expectedToken = Buffer.from(
    `${process.env.EDITOR_ADMIN}:${process.env.EDITOR_PASSWORD}`
  ).toString('base64');

  if (authCookie.value !== expectedToken) {
    context.cookies.delete('editor-auth');
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/login');
  }

  return next();
});
