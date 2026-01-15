import { d as defineMiddleware, s as sequence } from './chunks/index_DR_SzSbF.mjs';
import { g as getEnvVariable } from './chunks/envUtils_iwYjdmOK.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_C3xpdfNH.mjs';
import 'piccolore';
import './chunks/astro/server_CT8QpgxF.mjs';
import 'clsx';

const PROTECTED_PATHS = [
  "/editor",
  "/api/generate-content",
  "/api/generate-image",
  "/api/save",
  "/api/auth-check",
  "/api/articles"
];
const PUBLIC_API = ["/api/login", "/api/logout"];
const onRequest$1 = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) {
    return next();
  }
  const needsAuth = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!needsAuth) {
    return next();
  }
  const authCookie = context.cookies.get("editor-auth");
  if (!authCookie?.value) {
    if (pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return context.redirect("/login");
  }
  const expectedToken = Buffer.from(
    `${getEnvVariable("EDITOR_ADMIN")}:${getEnvVariable("EDITOR_PASSWORD")}`
  ).toString("base64");
  if (authCookie.value !== expectedToken) {
    context.cookies.delete("editor-auth");
    if (pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return context.redirect("/login");
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
