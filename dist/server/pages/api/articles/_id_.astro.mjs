import { A as ArticleService, a as ArticleNotFoundError } from '../../../chunks/ArticleService_bEWOXh-P.mjs';
export { renderers } from '../../../renderers.mjs';

const DELETE = async ({ params }) => {
  try {
    const slug = params.id;
    if (!slug) {
      return new Response(JSON.stringify({ error: "Article ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const service = new ArticleService();
    await service.delete(slug);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    if (error instanceof ArticleNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.error("Delete error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Delete failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
const GET = async ({ params }) => {
  try {
    const slug = params.id;
    if (!slug) {
      return new Response(JSON.stringify({ error: "Article ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const service = new ArticleService();
    const article = await service.read(slug);
    if (!article) {
      return new Response(JSON.stringify({ error: "Article not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(article), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Read error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Read failed"
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
  DELETE,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
