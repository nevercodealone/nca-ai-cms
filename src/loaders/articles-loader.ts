import type { LiveLoader } from 'astro:content';
import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';

interface ArticleData {
  title: string;
  description: string;
  date: Date;
  createdAt?: Date;
  tags: string[];
  image?: string;
  imageAlt?: string;
}

interface ArticleEntry {
  id: string;
  data: ArticleData;
  body: string;
}

export function articlesLoader(): LiveLoader {
  const articlesDir = path.join(process.cwd(), 'src/content/articles');

  async function scanDir(dir: string): Promise<ArticleEntry[]> {
    const entries: ArticleEntry[] = [];

    try {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          const subEntries = await scanDir(fullPath);
          entries.push(...subEntries);
        } else if (item.name.endsWith('.md')) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const { data, content: body } = matter(content);

            const relativePath = path.relative(articlesDir, fullPath);
            const id = relativePath.replace(/\.md$/, '');

            entries.push({
              id,
              data: {
                title: data.title || '',
                description: data.description || '',
                date: new Date(data.date),
                createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
                tags: data.tags || [],
                image: data.image,
                imageAlt: data.imageAlt,
              },
              body,
            });
          } catch (err) {
            console.error(`Error reading ${fullPath}:`, err);
          }
        }
      }
    } catch {
      // Directory doesn't exist
    }

    return entries;
  }

  return {
    name: 'articles-loader',

    async loadCollection() {
      const entries = await scanDir(articlesDir);

      // Sort by date descending
      entries.sort((a, b) => {
        const aTime = a.data.createdAt?.getTime() ?? a.data.date.getTime();
        const bTime = b.data.createdAt?.getTime() ?? b.data.date.getTime();
        return bTime - aTime;
      });

      return { entries };
    },

    async loadEntry({ id }: { id: string }) {
      // id format: "2025/12/slug-name"
      const filePath = path.join(articlesDir, `${id}.md`);

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data, content: body } = matter(content);

        return {
          entry: {
            id,
            data: {
              title: data.title || '',
              description: data.description || '',
              date: new Date(data.date),
              createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
              tags: data.tags || [],
              image: data.image,
              imageAlt: data.imageAlt,
            },
            body,
          },
        };
      } catch {
        return { error: new Error(`Article not found: ${id}`) };
      }
    },
  };
}
