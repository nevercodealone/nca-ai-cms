import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BtdJ3A4W.mjs';
import { manifest } from './manifest_DC-eyMMa.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/article-image/_---path_.astro.mjs');
const _page2 = () => import('./pages/api/generate.astro.mjs');
const _page3 = () => import('./pages/api/generate-image.astro.mjs');
const _page4 = () => import('./pages/api/login.astro.mjs');
const _page5 = () => import('./pages/api/logout.astro.mjs');
const _page6 = () => import('./pages/api/save.astro.mjs');
const _page7 = () => import('./pages/api/save-image.astro.mjs');
const _page8 = () => import('./pages/articles/_---slug_.astro.mjs');
const _page9 = () => import('./pages/editor.astro.mjs');
const _page10 = () => import('./pages/login.astro.mjs');
const _page11 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/api/article-image/[...path].ts", _page1],
    ["src/pages/api/generate.ts", _page2],
    ["src/pages/api/generate-image.ts", _page3],
    ["src/pages/api/login.ts", _page4],
    ["src/pages/api/logout.ts", _page5],
    ["src/pages/api/save.ts", _page6],
    ["src/pages/api/save-image.ts", _page7],
    ["src/pages/articles/[...slug].astro", _page8],
    ["src/pages/editor.astro", _page9],
    ["src/pages/login.astro", _page10],
    ["src/pages/index.astro", _page11]
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
