import { I as ImageGenerator } from '../../chunks/ImageGenerator_CxVCz3Rv.mjs';
import { g as getEnvVariable } from '../../chunks/envUtils_iwYjdmOK.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const { title } = await request.json();
    if (!title) {
      return new Response(JSON.stringify({ error: "Title is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const apiKey = getEnvVariable("GOOGLE_GEMINI_API_KEY");
    const generator = new ImageGenerator({ apiKey });
    const image = await generator.generate(title);
    return new Response(
      JSON.stringify({
        url: image.url,
        alt: image.alt,
        filepath: image.filepath
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Image generation failed"
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
