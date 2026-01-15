import { c as createComponent, a as createAstro, w as renderHead, d as addAttribute, x as renderSlot, b as renderTemplate } from './astro/server_CWhFJQ0n.mjs';
import 'piccolore';
import 'clsx';
/* empty css                          */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  const currentPath = Astro2.url.pathname;
  return renderTemplate`<html lang="de"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title} | NCA Content</title><!-- Editorial Typography: Playfair Display for headlines, Source Serif for body, JetBrains Mono for code --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400;1,8..60,500&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">${renderHead()}</head> <body> <header class="site-header"> <div class="container header-inner"> <a href="/" class="logo"> <span class="logo-mark">NCA</span> <span class="logo-divider" aria-hidden="true"></span> <span class="logo-tagline">Content</span> </a> <nav class="main-nav" aria-label="Hauptnavigation"> <a href="/"${addAttribute(["nav-link", { "is-active": currentPath === "/" }], "class:list")}>
Artikel
</a> <a href="/editor"${addAttribute(["nav-link", "nav-link--highlight", { "is-active": currentPath === "/editor" }], "class:list")}>
Editor
</a> </nav> </div> </header> <main class="site-main"> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "/home/rolandgolla/development/nca/nca-astro-content/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
