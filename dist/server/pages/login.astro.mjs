import { c as createComponent, a as createAstro, r as renderComponent, e as renderScript, b as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CZVe1TcZ.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_2B8qVfVW.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const authCookie = Astro2.cookies.get("editor-auth");
  if (authCookie?.value) {
    const expectedToken = Buffer.from(
      `${"admin"}:${"admin"}`
    ).toString("base64");
    if (authCookie.value === expectedToken) {
      return Astro2.redirect("/editor");
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Login", "data-astro-cid-sgpqyurt": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="login-page" data-astro-cid-sgpqyurt> <div class="login-container" data-astro-cid-sgpqyurt> <!-- Decorative element --> <div class="login-decoration" aria-hidden="true" data-astro-cid-sgpqyurt></div> <div class="login-card animate-fadeInScale" data-astro-cid-sgpqyurt> <header class="login-header" data-astro-cid-sgpqyurt> <div class="login-logo" data-astro-cid-sgpqyurt> <span class="logo-mark" data-astro-cid-sgpqyurt>NCA</span> <span class="logo-divider" data-astro-cid-sgpqyurt></span> <span class="logo-text" data-astro-cid-sgpqyurt>Editor</span> </div> <h1 class="login-title" data-astro-cid-sgpqyurt>Willkommen zurück</h1> <p class="login-subtitle" data-astro-cid-sgpqyurt>Melde dich an, um Artikel zu erstellen</p> </header> <form id="login-form" class="login-form" data-astro-cid-sgpqyurt> <div class="field" data-astro-cid-sgpqyurt> <label for="username" data-astro-cid-sgpqyurt>Benutzername</label> <input type="text" id="username" name="username" required autocomplete="username" placeholder="Dein Benutzername" data-astro-cid-sgpqyurt> </div> <div class="field" data-astro-cid-sgpqyurt> <label for="password" data-astro-cid-sgpqyurt>Passwort</label> <input type="password" id="password" name="password" required autocomplete="current-password" placeholder="Dein Passwort" data-astro-cid-sgpqyurt> </div> <div id="error" class="error" data-astro-cid-sgpqyurt></div> <button type="submit" class="submit-button glow-primary" data-astro-cid-sgpqyurt> <span class="button-text" data-astro-cid-sgpqyurt>Anmelden</span> <svg class="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-sgpqyurt> <line x1="5" y1="12" x2="19" y2="12" data-astro-cid-sgpqyurt></line> <polyline points="12 5 19 12 12 19" data-astro-cid-sgpqyurt></polyline> </svg> </button> </form> <footer class="login-footer" data-astro-cid-sgpqyurt> <a href="/" class="back-link" data-astro-cid-sgpqyurt> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-sgpqyurt> <line x1="19" y1="12" x2="5" y2="12" data-astro-cid-sgpqyurt></line> <polyline points="12 19 5 12 12 5" data-astro-cid-sgpqyurt></polyline> </svg>
Zurück zur Startseite
</a> </footer> </div> </div> </div> ` })}  ${renderScript($$result, "/home/rolandgolla/development/nca/nca-astro-content/src/pages/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/rolandgolla/development/nca/nca-astro-content/src/pages/login.astro", void 0);
const $$file = "/home/rolandgolla/development/nca/nca-astro-content/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
