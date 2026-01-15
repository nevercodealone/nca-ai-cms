import * as fs from 'fs/promises';
import matter from 'gray-matter';
import { ArticleFinder } from '../domain/value-objects/ArticleFinder';

export class ArticleNotFoundError extends Error {
  constructor(slug: string) {
    super(`Article not found: ${slug}`);
    this.name = 'ArticleNotFoundError';
  }
}

export interface ArticleData {
  articleId: string;
  title: string;
  description: string;
  date: Date;
  tags: string[];
  image?: string;
  imageAlt?: string;
  content: string;
  folderPath: string;
}

export interface UpdateContentOptions {
  title?: string;
  description?: string;
  content?: string;
}

export class ArticleService {
  private readonly finder: ArticleFinder;

  constructor(basePath: string = 'src/content/articles') {
    this.finder = new ArticleFinder(basePath);
  }

  async delete(slug: string): Promise<void> {
    const location = await this.finder.findBySlug(slug);

    if (!location) {
      throw new ArticleNotFoundError(slug);
    }

    await fs.rm(location.folderPath, { recursive: true, force: true });
  }

  async read(slug: string): Promise<ArticleData | null> {
    const location = await this.finder.findBySlug(slug);

    if (!location) {
      return null;
    }

    try {
      const fileContent = await fs.readFile(location.indexPath, 'utf-8');
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
        folderPath: location.folderPath,
      };
    } catch {
      return null;
    }
  }

  async updateContent(
    slug: string,
    options: UpdateContentOptions
  ): Promise<void> {
    const location = await this.finder.findBySlug(slug);

    if (!location) {
      throw new ArticleNotFoundError(slug);
    }

    const fileContent = await fs.readFile(location.indexPath, 'utf-8');
    const { data, content } = matter(fileContent);

    // Update frontmatter fields if provided
    const updatedData = {
      ...data,
      ...(options.title && { title: options.title }),
      ...(options.description && { description: options.description }),
    };

    // Use new content or keep existing
    const updatedContent = options.content ?? content;

    // Rebuild the file with frontmatter
    const newFileContent = matter.stringify(updatedContent, updatedData);

    await fs.writeFile(location.indexPath, newFileContent, 'utf-8');
  }
}
