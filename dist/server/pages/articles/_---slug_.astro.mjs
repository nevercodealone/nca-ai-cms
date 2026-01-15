import { c as createComponent, a as createAstro, m as maybeRenderHead, b as addAttribute, r as renderComponent, d as renderScript, e as renderTemplate, F as Fragment, u as unescapeHTML } from '../../chunks/astro/server_CT8QpgxF.mjs';
import 'piccolore';
import { g as getEntry } from '../../chunks/_astro_content_DbH7c-a8.mjs';
import { marked } from 'marked';
import { $ as $$Layout } from '../../chunks/Layout_D2yqFEeI.mjs';
import { $ as $$Image } from '../../chunks/_astro_assets_C3eQMTmc.mjs';
import * as fs from 'fs/promises';
import * as path from 'path';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro$1 = createAstro();
const $$HeroImage = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$HeroImage;
  const { articleId, alt, isAuthenticated } = Astro2.props;
  const slug = articleId.split("/").pop() || articleId;
  let mtime = "";
  try {
    const heroPath = path.join(
      process.cwd(),
      "src/content/articles",
      articleId,
      "hero.webp"
    );
    const stats = await fs.stat(heroPath);
    mtime = stats.mtimeMs.toString(36);
  } catch {
  }
  const imageSrc = `/api/article-image/${articleId}/hero.webp${mtime ? `?v=${mtime}` : ""}`;
  return renderTemplate`${maybeRenderHead()}<figure class="article-hero"${addAttribute(slug, "data-article-id")}${addAttribute(imageSrc, "data-image-src")} data-astro-cid-v6eggwfy> <div class="article-hero-image" data-astro-cid-v6eggwfy> ${renderComponent($$result, "Image", $$Image, { "src": imageSrc, "alt": alt, "width": 1200, "height": 675, "loading": "eager", "class": "hero-img", "data-astro-cid-v6eggwfy": true })} ${isAuthenticated && renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-v6eggwfy": true }, { "default": async ($$result2) => renderTemplate` <button class="regenerate-btn" type="button" aria-label="Bild neu generieren" data-astro-cid-v6eggwfy> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-v6eggwfy> <path d="M23 4v6h-6" data-astro-cid-v6eggwfy></path> <path d="M1 20v-6h6" data-astro-cid-v6eggwfy></path> <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" data-astro-cid-v6eggwfy></path> </svg> </button> <button class="confirm-btn" type="button" hidden aria-label="Speichern" data-astro-cid-v6eggwfy> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" data-astro-cid-v6eggwfy> <polyline points="20 6 9 17 4 12" data-astro-cid-v6eggwfy></polyline> </svg> </button> ` })}`} </div> ${alt && renderTemplate`<figcaption class="hero-caption" data-astro-cid-v6eggwfy>${alt}</figcaption>`} </figure> ${renderScript($$result, "/home/rolandgolla/development/nca/nca-astro-content/src/components/HeroImage.astro?astro&type=script&index=0&lang.ts")} `;
}, "/home/rolandgolla/development/nca/nca-astro-content/src/components/HeroImage.astro", void 0);

const $$Astro = createAstro();
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const authCookie = Astro2.cookies.get("editor-auth");
  const isAuthenticated = !!authCookie?.value;
  const { slug } = Astro2.params;
  if (!slug) {
    return Astro2.redirect("/");
  }
  const article = await getEntry("articles", slug);
  if (!article) {
    return Astro2.redirect("/");
  }
  const articleSlug = slug.split("/").pop() || slug;
  const htmlContent = await marked(article.body || "");
  const formattedDate = article.data.date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": article.data.title, "data-astro-cid-c7vabzjd": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<article class="article-page" data-astro-cid-c7vabzjd> <!-- Article Header --> <header class="article-header"${addAttribute(articleSlug, "data-article-id")} data-astro-cid-c7vabzjd> <div class="article-header-content animate-fadeInUp" data-astro-cid-c7vabzjd> <div class="article-meta" data-astro-cid-c7vabzjd> <span class="article-category" data-astro-cid-c7vabzjd>${article.data.tags[0]}</span> <span class="article-meta-divider" aria-hidden="true" data-astro-cid-c7vabzjd></span> <time${addAttribute(article.data.date.toISOString(), "datetime")} class="article-date" data-astro-cid-c7vabzjd> ${formattedDate} </time> </div> <p class="article-lede" data-astro-cid-c7vabzjd>${article.data.description}</p> ${article.data.tags.length > 1 && renderTemplate`<div class="article-tags" data-astro-cid-c7vabzjd> ${article.data.tags.slice(1).map((tag) => renderTemplate`<span class="article-tag" data-astro-cid-c7vabzjd>${tag}</span>`)} </div>`} </div> </header> <!-- Hero Image --> ${article.data.image && renderTemplate`${renderComponent($$result2, "HeroImage", $$HeroImage, { "articleId": slug, "alt": article.data.imageAlt || article.data.title, "isAuthenticated": isAuthenticated, "data-astro-cid-c7vabzjd": true })}`} <!-- Article Body --> <div class="article-body" data-astro-cid-c7vabzjd> <div class="content-column"${addAttribute(articleSlug, "data-article-id")} data-astro-cid-c7vabzjd> ${isAuthenticated && renderTemplate`<div class="content-actions" data-astro-cid-c7vabzjd> <button class="regenerate-text-icon" type="button" aria-label="Text neu generieren" data-astro-cid-c7vabzjd> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-c7vabzjd> <path d="M23 4v6h-6" data-astro-cid-c7vabzjd></path> <path d="M1 20v-6h6" data-astro-cid-c7vabzjd></path> <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" data-astro-cid-c7vabzjd></path> </svg> </button> <button class="apply-text-btn" type="button" hidden aria-label="Speichern" data-astro-cid-c7vabzjd> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" data-astro-cid-c7vabzjd> <polyline points="20 6 9 17 4 12" data-astro-cid-c7vabzjd></polyline> </svg> </button> </div>`} <div class="article-content prose" data-astro-cid-c7vabzjd>${unescapeHTML(htmlContent)}</div> <div class="content-preview prose" hidden data-astro-cid-c7vabzjd></div> </div> <!-- Sidebar --> <aside class="article-sidebar" data-astro-cid-c7vabzjd> <div class="sidebar-card" data-astro-cid-c7vabzjd> <h4 class="sidebar-title" data-astro-cid-c7vabzjd>Themen</h4> <div class="sidebar-tags" data-astro-cid-c7vabzjd> ${article.data.tags.map((tag) => renderTemplate`<span class="sidebar-tag" data-astro-cid-c7vabzjd>${tag}</span>`)} </div> </div> </aside> </div> <!-- Article Footer --> <footer class="article-footer" data-astro-cid-c7vabzjd> <a href="/" class="back-link" data-astro-cid-c7vabzjd> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-c7vabzjd> <line x1="19" y1="12" x2="5" y2="12" data-astro-cid-c7vabzjd></line> <polyline points="12 19 5 12 12 5" data-astro-cid-c7vabzjd></polyline> </svg> <span data-astro-cid-c7vabzjd>Zurück zur Übersicht</span> </a> </footer> </article> ` })} ${renderScript($$result, "/home/rolandgolla/development/nca/nca-astro-content/src/pages/articles/[...slug].astro?astro&type=script&index=0&lang.ts")} `;
}, "/home/rolandgolla/development/nca/nca-astro-content/src/pages/articles/[...slug].astro", void 0);

const $$file = "/home/rolandgolla/development/nca/nca-astro-content/src/pages/articles/[...slug].astro";
const $$url = "/articles/[...slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
