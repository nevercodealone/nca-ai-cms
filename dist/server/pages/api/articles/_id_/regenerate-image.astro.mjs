import { A as ArticleService, a as ArticleNotFoundError } from '../../../../chunks/ArticleService_bEWOXh-P.mjs';
import { I as ImageGenerator } from '../../../../chunks/ImageGenerator_CxVCz3Rv.mjs';
import { g as getEnvVariable } from '../../../../chunks/envUtils_iwYjdmOK.mjs';
export { renderers } from '../../../../renderers.mjs';

const POST = async ({ params }) => {
  try {
    const slug = params.id;
    if (!slug) {
      return new Response(JSON.stringify({ error: "Article ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const service = new ArticleService();
    const existingArticle = await service.read(slug);
    if (!existingArticle) {
      throw new ArticleNotFoundError(slug);
    }
    const apiKey = getEnvVariable("GOOGLE_GEMINI_API_KEY");
    const generator = new ImageGenerator({ apiKey });
    const image = await generator.generate(existingArticle.title);
    return new Response(
      JSON.stringify({
        url: image.url,
        alt: image.alt,
        // Include article info for reference
        articleId: existingArticle.articleId,
        articleTitle: existingArticle.title
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    if (error instanceof ArticleNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.error("Regenerate image error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Image regeneration failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
