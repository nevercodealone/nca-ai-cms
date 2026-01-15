import * as fs from 'fs/promises';
import matter from 'gray-matter';
import * as path from 'path';

class ArticleFinder {
  constructor(basePath) {
    this.basePath = basePath;
  }
  async findBySlug(slug) {
    try {
      const years = await this.getDirectories(this.basePath);
      for (const year of years) {
        const yearPath = path.join(this.basePath, year);
        const months = await this.getDirectories(yearPath);
        for (const month of months) {
          const monthPath = path.join(yearPath, month);
          const articles = await this.getDirectories(monthPath);
          for (const article of articles) {
            if (article === slug) {
              const folderPath = path.join(monthPath, article);
              const indexPath = path.join(folderPath, "index.md");
              try {
                await fs.access(indexPath);
                return {
                  folderPath,
                  indexPath,
                  articleId: `${year}/${month}/${article}`
                };
              } catch {
                continue;
              }
            }
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }
  async getDirectories(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      return [];
    }
  }
}

class ArticleNotFoundError extends Error {
  constructor(slug) {
    super(`Article not found: ${slug}`);
    this.name = "ArticleNotFoundError";
  }
}
class ArticleService {
  finder;
  constructor(basePath = "src/content/articles") {
    this.finder = new ArticleFinder(basePath);
  }
  async delete(slug) {
    const location = await this.finder.findBySlug(slug);
    if (!location) {
      throw new ArticleNotFoundError(slug);
    }
    await fs.rm(location.folderPath, { recursive: true, force: true });
  }
  async read(slug) {
    const location = await this.finder.findBySlug(slug);
    if (!location) {
      return null;
    }
    try {
      const fileContent = await fs.readFile(location.indexPath, "utf-8");
      const { data, content } = matter(fileContent);
      return {
        articleId: location.articleId,
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        tags: data.tags || [],
        image: data.image,
        imageAlt: data.imageAlt,
        content: content.trim(),
        folderPath: location.folderPath
      };
    } catch {
      return null;
    }
  }
  async updateContent(slug, options) {
    const location = await this.finder.findBySlug(slug);
    if (!location) {
      throw new ArticleNotFoundError(slug);
    }
    const fileContent = await fs.readFile(location.indexPath, "utf-8");
    const { data, content } = matter(fileContent);
    const updatedData = {
      ...data,
      ...options.title && { title: options.title },
      ...options.description && { description: options.description }
    };
    const updatedContent = options.content ?? content;
    const newFileContent = matter.stringify(updatedContent, updatedData);
    await fs.writeFile(location.indexPath, newFileContent, "utf-8");
  }
}

export { ArticleService as A, ArticleNotFoundError as a };
