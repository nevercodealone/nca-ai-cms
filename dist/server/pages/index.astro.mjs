import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead, F as Fragment, d as addAttribute } from '../chunks/astro/server_BJX1LJQr.mjs';
import 'piccolore';
import { a as getLiveCollection } from '../chunks/_astro_content_CXlse_dn.mjs';
import { $ as $$Image } from '../chunks/_astro_assets_BxRdcx6d.mjs';
import { $ as $$Layout } from '../chunks/Layout_D1TlOTe7.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { entries: articles, error } = await getLiveCollection("articles");
  if (error) {
    console.error("Failed to load articles:", error);
  }
  const sortedArticles = (articles || []).sort((a, b) => {
    const aTime = a.data.createdAt?.getTime() ?? a.data.date.getTime();
    const bTime = b.data.createdAt?.getTime() ?? b.data.date.getTime();
    return bTime - aTime;
  });
  const featuredArticle = sortedArticles[0];
  const remainingArticles = sortedArticles.slice(1);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Home", "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="hero" data-astro-cid-j7pv25f6> <div class="container" data-astro-cid-j7pv25f6> <div class="hero-content" data-astro-cid-j7pv25f6> <p class="hero-kicker" data-astro-cid-j7pv25f6>Web Accessibility Expertise</p> <h1 class="hero-title" data-astro-cid-j7pv25f6>
NCA Content
<span class="hero-title-accent" data-astro-cid-j7pv25f6>Marketing</span> </h1> <p class="hero-description" data-astro-cid-j7pv25f6>
Fachartikel für barrierefreie Webentwicklung und digitale Inklusion
</p> </div> <div class="hero-decoration" aria-hidden="true" data-astro-cid-j7pv25f6></div> </div> </section>  <section class="articles-section" data-astro-cid-j7pv25f6> <div class="container" data-astro-cid-j7pv25f6> ${sortedArticles.length > 0 ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-j7pv25f6": true }, { "default": async ($$result3) => renderTemplate`  <header class="section-header" data-astro-cid-j7pv25f6> <div class="section-header-left" data-astro-cid-j7pv25f6> <span class="section-kicker" data-astro-cid-j7pv25f6>Aktuelles</span> <h2 class="section-title" data-astro-cid-j7pv25f6>Artikel</h2> </div> <span class="article-count" data-astro-cid-j7pv25f6>${sortedArticles.length} Beiträge</span> </header>  ${featuredArticle && renderTemplate`<a${addAttribute(`/articles/${featuredArticle.id}`, "href")} class="featured-card" data-astro-cid-j7pv25f6> <div class="featured-card-image img-zoom" data-astro-cid-j7pv25f6> ${featuredArticle.data.image ? renderTemplate`${renderComponent($$result3, "Image", $$Image, { "src": featuredArticle.data.image, "alt": featuredArticle.data.imageAlt || featuredArticle.data.title, "width": 900, "height": 500, "data-astro-cid-j7pv25f6": true })}` : renderTemplate`<div class="image-placeholder" data-astro-cid-j7pv25f6> <span data-astro-cid-j7pv25f6>Kein Bild</span> </div>`} <div class="featured-card-overlay" data-astro-cid-j7pv25f6></div> </div> <div class="featured-card-content" data-astro-cid-j7pv25f6> <div class="card-meta" data-astro-cid-j7pv25f6> <span class="card-tag" data-astro-cid-j7pv25f6>${featuredArticle.data.tags[0]}</span> <span class="card-date" data-astro-cid-j7pv25f6> ${featuredArticle.data.date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} </span> </div> <h3 class="featured-card-title" data-astro-cid-j7pv25f6>${featuredArticle.data.title}</h3> <p class="featured-card-excerpt" data-astro-cid-j7pv25f6>${featuredArticle.data.description}</p> <span class="read-more" data-astro-cid-j7pv25f6>
Artikel lesen
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-j7pv25f6> <line x1="5" y1="12" x2="19" y2="12" data-astro-cid-j7pv25f6></line> <polyline points="12 5 19 12 12 19" data-astro-cid-j7pv25f6></polyline> </svg> </span> </div> </a>`} ${remainingArticles.length > 0 && renderTemplate`<div class="article-grid stagger-children" data-astro-cid-j7pv25f6> ${remainingArticles.map((article, index) => renderTemplate`<a${addAttribute(`/articles/${article.id}`, "href")}${addAttribute([
    "article-card",
    "hover-lift",
    { "article-card--wide": index % 5 === 0 }
  ], "class:list")} data-astro-cid-j7pv25f6> <div class="article-card-image img-zoom" data-astro-cid-j7pv25f6> ${article.data.image ? renderTemplate`${renderComponent($$result3, "Image", $$Image, { "src": article.data.image, "alt": article.data.imageAlt || article.data.title, "width": 480, "height": 280, "data-astro-cid-j7pv25f6": true })}` : renderTemplate`<div class="image-placeholder" data-astro-cid-j7pv25f6> <span data-astro-cid-j7pv25f6>Kein Bild</span> </div>`} </div> <div class="article-card-content" data-astro-cid-j7pv25f6> <div class="card-meta" data-astro-cid-j7pv25f6> <span class="card-tag" data-astro-cid-j7pv25f6>${article.data.tags[0]}</span> <span class="card-date" data-astro-cid-j7pv25f6> ${article.data.date.toLocaleDateString("de-DE")} </span> </div> <h3 class="article-card-title" data-astro-cid-j7pv25f6>${article.data.title}</h3> <p class="article-card-excerpt" data-astro-cid-j7pv25f6>${article.data.description}</p> </div> </a>`)} </div>`}` })}` : renderTemplate`<div class="empty-state" data-astro-cid-j7pv25f6> <div class="empty-state-icon" data-astro-cid-j7pv25f6> <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-j7pv25f6> <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" data-astro-cid-j7pv25f6></path> <polyline points="14 2 14 8 20 8" data-astro-cid-j7pv25f6></polyline> <line x1="16" y1="13" x2="8" y2="13" data-astro-cid-j7pv25f6></line> <line x1="16" y1="17" x2="8" y2="17" data-astro-cid-j7pv25f6></line> <polyline points="10 9 9 9 8 9" data-astro-cid-j7pv25f6></polyline> </svg> </div> <h3 class="empty-state-title" data-astro-cid-j7pv25f6>Noch keine Artikel</h3> <p class="empty-state-text" data-astro-cid-j7pv25f6>Erstelle deinen ersten Artikel im Editor.</p> <a href="/editor" class="empty-state-cta glow-primary" data-astro-cid-j7pv25f6>
Zum Editor
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-j7pv25f6> <line x1="5" y1="12" x2="19" y2="12" data-astro-cid-j7pv25f6></line> <polyline points="12 5 19 12 12 19" data-astro-cid-j7pv25f6></polyline> </svg> </a> </div>`} </div> </section> ` })} `;
}, "/home/rolandgolla/development/nca/nca-astro-content/src/pages/index.astro", void 0);

const $$file = "/home/rolandgolla/development/nca/nca-astro-content/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
