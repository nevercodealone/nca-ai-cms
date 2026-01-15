import { c as createComponent, a as createAstro, m as maybeRenderHead, r as renderComponent, b as renderTemplate, d as addAttribute, u as unescapeHTML } from '../../chunks/astro/server_CWhFJQ0n.mjs';
import 'piccolore';
import { g as getEntry } from '../../chunks/_astro_content_DlRV1zVb.mjs';
import { marked } from 'marked';
import { $ as $$Layout } from '../../chunks/Layout_BNY3nqea.mjs';
import { $ as $$Image } from '../../chunks/_astro_assets_BF8bq_6c.mjs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro$1 = createAstro();
const $$HeroImage = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$HeroImage;
  const { articleId, alt } = Astro2.props;
  const imageSrc = `/api/article-image/${articleId}/hero.webp`;
  return renderTemplate`${maybeRenderHead()}<figure class="article-hero" data-astro-cid-v6eggwfy> <div class="article-hero-image" data-astro-cid-v6eggwfy> ${renderComponent($$result, "Image", $$Image, { "src": imageSrc, "alt": alt, "width": 1200, "height": 675, "loading": "eager", "data-astro-cid-v6eggwfy": true })} </div> ${alt && renderTemplate`<figcaption class="article-hero-caption" data-astro-cid-v6eggwfy> ${alt} </figcaption>`} </figure> `;
}, "/home/rolandgolla/development/nca/nca-astro-content/src/components/HeroImage.astro", void 0);

const $$Astro = createAstro();
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { slug } = Astro2.params;
  if (!slug) {
    return Astro2.redirect("/");
  }
  const article = await getEntry("articles", slug);
  if (!article) {
    return Astro2.redirect("/");
  }
  const htmlContent = await marked(article.body || "");
  const formattedDate = article.data.date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": article.data.title, "data-astro-cid-c7vabzjd": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<article class="article-page" data-astro-cid-c7vabzjd> <!-- Article Header --> <header class="article-header" data-astro-cid-c7vabzjd> <div class="article-header-content animate-fadeInUp" data-astro-cid-c7vabzjd> <div class="article-meta" data-astro-cid-c7vabzjd> <span class="article-category" data-astro-cid-c7vabzjd>${article.data.tags[0]}</span> <span class="article-meta-divider" aria-hidden="true" data-astro-cid-c7vabzjd></span> <time${addAttribute(article.data.date.toISOString(), "datetime")} class="article-date" data-astro-cid-c7vabzjd> ${formattedDate} </time> </div> <p class="article-lede" data-astro-cid-c7vabzjd>${article.data.description}</p> ${article.data.tags.length > 1 && renderTemplate`<div class="article-tags" data-astro-cid-c7vabzjd> ${article.data.tags.slice(1).map((tag) => renderTemplate`<span class="article-tag" data-astro-cid-c7vabzjd>${tag}</span>`)} </div>`} </div> </header> <!-- Hero Image --> ${article.data.image && renderTemplate`${renderComponent($$result2, "HeroImage", $$HeroImage, { "articleId": slug, "alt": article.data.imageAlt || article.data.title, "data-astro-cid-c7vabzjd": true })}`} <!-- Article Body --> <div class="article-body" data-astro-cid-c7vabzjd> <div class="article-content prose" data-astro-cid-c7vabzjd>${unescapeHTML(htmlContent)}</div> <!-- Sidebar --> <aside class="article-sidebar" data-astro-cid-c7vabzjd> <div class="sidebar-card" data-astro-cid-c7vabzjd> <h4 class="sidebar-title" data-astro-cid-c7vabzjd>Themen</h4> <div class="sidebar-tags" data-astro-cid-c7vabzjd> ${article.data.tags.map((tag) => renderTemplate`<span class="sidebar-tag" data-astro-cid-c7vabzjd>${tag}</span>`)} </div> </div> </aside> </div> <!-- Article Footer --> <footer class="article-footer" data-astro-cid-c7vabzjd> <a href="/" class="back-link" data-astro-cid-c7vabzjd> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-c7vabzjd> <line x1="19" y1="12" x2="5" y2="12" data-astro-cid-c7vabzjd></line> <polyline points="12 19 5 12 12 5" data-astro-cid-c7vabzjd></polyline> </svg> <span data-astro-cid-c7vabzjd>Zurück zur Übersicht</span> </a> </footer> </article> ` })} `;
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
