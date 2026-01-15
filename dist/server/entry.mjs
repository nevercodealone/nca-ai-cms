import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BoZKcrqA.mjs';
import { manifest } from './manifest_C9IzjXBZ.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/article-image/_---path_.astro.mjs');
const _page2 = () => import('./pages/api/articles/articles.integration.test.astro.mjs');
const _page3 = () => import('./pages/api/articles/_id_/apply.astro.mjs');
const _page4 = () => import('./pages/api/articles/_id_/regenerate-image.astro.mjs');
const _page5 = () => import('./pages/api/articles/_id_/regenerate-text.astro.mjs');
const _page6 = () => import('./pages/api/articles/_id_.astro.mjs');
const _page7 = () => import('./pages/api/auth-check.astro.mjs');
const _page8 = () => import('./pages/api/generate-content.astro.mjs');
const _page9 = () => import('./pages/api/generate-image.astro.mjs');
const _page10 = () => import('./pages/api/login.astro.mjs');
const _page11 = () => import('./pages/api/logout.astro.mjs');
const _page12 = () => import('./pages/api/save.astro.mjs');
const _page13 = () => import('./pages/api/save-image.astro.mjs');
const _page14 = () => import('./pages/articles/_---slug_.astro.mjs');
const _page15 = () => import('./pages/editor.astro.mjs');
const _page16 = () => import('./pages/login.astro.mjs');
const _page17 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/api/article-image/[...path].ts", _page1],
    ["src/pages/api/articles/articles.integration.test.ts", _page2],
    ["src/pages/api/articles/[id]/apply.ts", _page3],
    ["src/pages/api/articles/[id]/regenerate-image.ts", _page4],
    ["src/pages/api/articles/[id]/regenerate-text.ts", _page5],
    ["src/pages/api/articles/[id].ts", _page6],
    ["src/pages/api/auth-check.ts", _page7],
    ["src/pages/api/generate-content.ts", _page8],
    ["src/pages/api/generate-image.ts", _page9],
    ["src/pages/api/login.ts", _page10],
    ["src/pages/api/logout.ts", _page11],
    ["src/pages/api/save.ts", _page12],
    ["src/pages/api/save-image.ts", _page13],
    ["src/pages/articles/[...slug].astro", _page14],
    ["src/pages/editor.astro", _page15],
    ["src/pages/login.astro", _page16],
    ["src/pages/index.astro", _page17]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///home/rolandgolla/development/nca/nca-astro-content/dist/client/",
    "server": "file:///home/rolandgolla/development/nca/nca-astro-content/dist/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
