import * as z from 'zod';
import { A as AstroError, ap as LiveContentConfigError } from './astro/server_BJX1LJQr.mjs';
import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';

const LIVE_CONTENT_TYPE = "live";

function getImporterFilename() {
  const stackLine = new Error().stack?.split("\n").find(
    (line) => !line.includes("defineCollection") && !line.includes("defineLiveCollection") && !line.includes("getImporterFilename") && !line.startsWith("Error")
  );
  if (!stackLine) {
    return void 0;
  }
  const match = /\/((?:src|chunks)\/.*?):\d+:\d+/.exec(stackLine);
  return match?.[1] ?? void 0;
}
function defineLiveCollection(config) {
  const importerFilename = getImporterFilename();
  if (importerFilename && !importerFilename.includes("live.config")) {
    throw new AstroError({
      ...LiveContentConfigError,
      message: LiveContentConfigError.message(
        "Live collections must be defined in a `src/live.config.ts` file.",
        importerFilename ?? "your content config file"
      )
    });
  }
  config.type ??= LIVE_CONTENT_TYPE;
  if (config.type !== LIVE_CONTENT_TYPE) {
    throw new AstroError({
      ...LiveContentConfigError,
      message: LiveContentConfigError.message(
        "Collections in a live config file must have a type of `live`.",
        importerFilename
      )
    });
  }
  if (!config.loader) {
    throw new AstroError({
      ...LiveContentConfigError,
      message: LiveContentConfigError.message(
        "Live collections must have a `loader` defined.",
        importerFilename
      )
    });
  }
  if (!config.loader.loadCollection || !config.loader.loadEntry) {
    throw new AstroError({
      ...LiveContentConfigError,
      message: LiveContentConfigError.message(
        "Live collection loaders must have `loadCollection()` and `loadEntry()` methods. Please check that you are not using a loader intended for build-time collections",
        importerFilename
      )
    });
  }
  if (typeof config.schema === "function") {
    throw new AstroError({
      ...LiveContentConfigError,
      message: LiveContentConfigError.message(
        "The schema cannot be a function for live collections. Please use a schema object instead.",
        importerFilename
      )
    });
  }
  return config;
}

function articlesLoader() {
  const articlesDir = path.join(process.cwd(), "src/content/articles");
  async function scanDir(dir) {
    const entries = [];
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          const subEntries = await scanDir(fullPath);
          entries.push(...subEntries);
        } else if (item.name.endsWith(".md")) {
          try {
            const content = await fs.readFile(fullPath, "utf-8");
            const { data, content: body } = matter(content);
            const relativePath = path.relative(articlesDir, fullPath);
            const id = relativePath.replace(/\.md$/, "");
            entries.push({
              id,
              data: {
                title: data.title || "",
                description: data.description || "",
                date: new Date(data.date),
                createdAt: data.createdAt ? new Date(data.createdAt) : void 0,
                tags: data.tags || [],
                image: data.image,
                imageAlt: data.imageAlt
              },
              body
            });
          } catch (err) {
            console.error(`Error reading ${fullPath}:`, err);
          }
        }
      }
    } catch {
    }
    return entries;
  }
  return {
    name: "articles-loader",
    async loadCollection() {
      const entries = await scanDir(articlesDir);
      entries.sort((a, b) => {
        const aTime = a.data.createdAt?.getTime() ?? a.data.date.getTime();
        const bTime = b.data.createdAt?.getTime() ?? b.data.date.getTime();
        return bTime - aTime;
      });
      return { entries };
    },
    async loadEntry({ id }) {
      const filePath = path.join(articlesDir, `${id}.md`);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        const { data, content: body } = matter(content);
        return {
          entry: {
            id,
            data: {
              title: data.title || "",
              description: data.description || "",
              date: new Date(data.date),
              createdAt: data.createdAt ? new Date(data.createdAt) : void 0,
              tags: data.tags || [],
              image: data.image,
              imageAlt: data.imageAlt
            },
            body
          }
        };
      } catch {
        return { error: new Error(`Article not found: ${id}`) };
      }
    }
  };
}

defineLiveCollection({
  loader: articlesLoader(),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    createdAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional()
  })
});
