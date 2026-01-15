import { g as getEnvVariable } from '../../chunks/envUtils_iwYjdmOK.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  try {
    const { username, password } = await request.json();
    const validUser = getEnvVariable("EDITOR_ADMIN");
    const validPass = getEnvVariable("EDITOR_PASSWORD");
    if (username !== validUser || password !== validPass) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const token = Buffer.from(`${username}:${password}`).toString("base64");
    cookies.set("editor-auth", token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24
      // 24 hours
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Invalid request"
      }),
      {
        status: 400,
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
