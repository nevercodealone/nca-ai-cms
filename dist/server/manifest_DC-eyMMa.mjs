import 'piccolore';
import { y as decodeKey } from './chunks/astro/server_CWhFJQ0n.mjs';
import 'clsx';
import './chunks/astro-designed-error-pages_BatojL7e.mjs';
import 'es-module-lexer';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_Bn5Gz8yA.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///home/rolandgolla/development/nca/nca-astro-content/","cacheDir":"file:///home/rolandgolla/development/nca/nca-astro-content/node_modules/.astro/","outDir":"file:///home/rolandgolla/development/nca/nca-astro-content/dist/","srcDir":"file:///home/rolandgolla/development/nca/nca-astro-content/src/","publicDir":"file:///home/rolandgolla/development/nca/nca-astro-content/public/","buildClientDir":"file:///home/rolandgolla/development/nca/nca-astro-content/dist/client/","buildServerDir":"file:///home/rolandgolla/development/nca/nca-astro-content/dist/server/","adapterName":"@astrojs/node","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/node.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/article-image/[...path]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/article-image(?:\\/(.*?))?\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"article-image","dynamic":false,"spread":false}],[{"content":"...path","dynamic":true,"spread":true}]],"params":["...path"],"component":"src/pages/api/article-image/[...path].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/generate","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/generate\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"generate","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/generate.ts","pathname":"/api/generate","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/generate-image","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/generate-image\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"generate-image","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/generate-image.ts","pathname":"/api/generate-image","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/login","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/login\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/login.ts","pathname":"/api/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/logout","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/logout\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"logout","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/logout.ts","pathname":"/api/logout","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/save","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/save\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"save","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/save.ts","pathname":"/api/save","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/save-image","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/save-image\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"save-image","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/save-image.ts","pathname":"/api/save-image","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.BGWuJs9L.css"},{"type":"external","src":"/_astro/_slug_.BdUk5or7.css"}],"routeData":{"route":"/articles/[...slug]","isIndex":false,"type":"page","pattern":"^\\/articles(?:\\/(.*?))?\\/?$","segments":[[{"content":"articles","dynamic":false,"spread":false}],[{"content":"...slug","dynamic":true,"spread":true}]],"params":["...slug"],"component":"src/pages/articles/[...slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.BGWuJs9L.css"}],"routeData":{"route":"/editor","isIndex":false,"type":"page","pattern":"^\\/editor\\/?$","segments":[[{"content":"editor","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/editor.astro","pathname":"/editor","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.BGWuJs9L.css"},{"type":"external","src":"/_astro/login.DM0VgTn4.css"}],"routeData":{"route":"/login","isIndex":false,"type":"page","pattern":"^\\/login\\/?$","segments":[[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login.astro","pathname":"/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.BGWuJs9L.css"},{"type":"external","src":"/_astro/index.Dnb8Yi85.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/home/rolandgolla/development/nca/nca-astro-content/src/pages/articles/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/articles/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["/home/rolandgolla/development/nca/nca-astro-content/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/rolandgolla/development/nca/nca-astro-content/src/pages/editor.astro",{"propagation":"none","containsHead":true}],["/home/rolandgolla/development/nca/nca-astro-content/src/pages/login.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/node@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/api/article-image/[...path]@_@ts":"pages/api/article-image/_---path_.astro.mjs","\u0000@astro-page:src/pages/api/generate@_@ts":"pages/api/generate.astro.mjs","\u0000@astro-page:src/pages/api/generate-image@_@ts":"pages/api/generate-image.astro.mjs","\u0000@astro-page:src/pages/api/login@_@ts":"pages/api/login.astro.mjs","\u0000@astro-page:src/pages/api/logout@_@ts":"pages/api/logout.astro.mjs","\u0000@astro-page:src/pages/api/save@_@ts":"pages/api/save.astro.mjs","\u0000@astro-page:src/pages/api/save-image@_@ts":"pages/api/save-image.astro.mjs","\u0000@astro-page:src/pages/articles/[...slug]@_@astro":"pages/articles/_---slug_.astro.mjs","\u0000@astro-page:src/pages/editor@_@astro":"pages/editor.astro.mjs","\u0000@astro-page:src/pages/login@_@astro":"pages/login.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_DC-eyMMa.mjs","/home/rolandgolla/development/nca/nca-astro-content/node_modules/unstorage/drivers/fs-lite.mjs":"chunks/fs-lite_COtHaKzy.mjs","/home/rolandgolla/development/nca/nca-astro-content/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_Cx9w39Yb.mjs","/home/rolandgolla/development/nca/nca-astro-content/.astro/content-assets.mjs":"chunks/content-assets_DleWbedO.mjs","/home/rolandgolla/development/nca/nca-astro-content/.astro/content-modules.mjs":"chunks/content-modules_Dz-S_Wwv.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_BHNqqMUx.mjs","/home/rolandgolla/development/nca/nca-astro-content/src/components/Editor":"_astro/Editor.BQkVEHRI.js","@astrojs/react/client.js":"_astro/client.9unXo8s5.js","/home/rolandgolla/development/nca/nca-astro-content/src/pages/login.astro?astro&type=script&index=0&lang.ts":"_astro/login.astro_astro_type_script_index_0_lang.BiwNlCaP.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/home/rolandgolla/development/nca/nca-astro-content/src/pages/login.astro?astro&type=script&index=0&lang.ts","const n=document.getElementById(\"login-form\"),a=document.getElementById(\"error\");n.addEventListener(\"submit\",async c=>{c.preventDefault(),a.textContent=\"\";const o=new FormData(n),l=o.get(\"username\"),i=o.get(\"password\"),e=n.querySelector(\"button\"),r=e.querySelector(\".button-text\"),s=e.querySelector(\".button-icon\");e.disabled=!0,r.textContent=\"Anmelden...\",s.style.display=\"none\";try{const t=await fetch(\"/api/login\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify({username:l,password:i})});if(!t.ok){const d=await t.json();throw new Error(d.error||\"Login fehlgeschlagen\")}window.location.href=\"/editor\"}catch(t){a.textContent=t instanceof Error?t.message:\"Login fehlgeschlagen\",e.disabled=!1,r.textContent=\"Anmelden\",s.style.display=\"block\"}});"]],"assets":["/_astro/_slug_.BGWuJs9L.css","/_astro/_slug_.BdUk5or7.css","/_astro/index.Dnb8Yi85.css","/_astro/login.DM0VgTn4.css","/favicon.svg","/_astro/Editor.BQkVEHRI.js","/_astro/client.9unXo8s5.js","/_astro/index.WFquGv8Z.js"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"K5yH/1qE3M2ZfCknISj3zH4RHsrKfraqpCeN9GhdEM4=","sessionConfig":{"driver":"fs-lite","options":{"base":"/home/rolandgolla/development/nca/nca-astro-content/node_modules/.astro/sessions"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/fs-lite_COtHaKzy.mjs');

export { manifest };
