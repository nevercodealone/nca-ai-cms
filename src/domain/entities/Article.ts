import { Slug } from '../value-objects/Slug';
import { SEOMetadata } from '../value-objects/SEOMetadata';

export type ArticleProps = {
  title: string;
  description: string;
  content: string;
  date: Date;
  tags: string[];
  source: string;
  image?: string;
  imageAlt?: string;
};

export class Article {
  readonly title: string;
  readonly description: string;
  readonly content: string;
  readonly date: Date;
  readonly tags: string[];
  readonly source: string;
  readonly slug: Slug;
  readonly seoMetadata: SEOMetadata;
  readonly image?: string;
  readonly imageAlt?: string;

  constructor(props: ArticleProps) {
    this.title = props.title;
    this.description = props.description;
    this.content = props.content;
    this.date = props.date;
    this.tags = props.tags;
    this.source = props.source;
    this.slug = new Slug(props.title);
    this.seoMetadata = SEOMetadata.truncate(props.title, props.description);
    if (props.image !== undefined) {
      this.image = props.image;
    }
    if (props.imageAlt !== undefined) {
      this.imageAlt = props.imageAlt;
    }
  }

  get filename(): string {
    return `${this.slug.toString()}.md`;
  }

  get year(): number {
    return this.date.getFullYear();
  }

  get month(): string {
    return String(this.date.getMonth() + 1).padStart(2, '0');
  }

  get filepath(): string {
    return `src/content/articles/${this.year}/${this.month}/${this.filename}`;
  }

  toFrontmatter(): Record<string, unknown> {
    return {
      title: this.seoMetadata.title,
      description: this.seoMetadata.description,
      date: this.date.toISOString().split('T')[0],
      tags: this.tags,
      source: this.source,
      ...(this.image && { image: this.image }),
      ...(this.imageAlt && { imageAlt: this.imageAlt }),
    };
  }

  toMarkdown(): string {
    const frontmatter = Object.entries(this.toFrontmatter())
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${JSON.stringify(value)}`;
        }
        return `${key}: "${value}"`;
      })
      .join('\n');

    return `---\n${frontmatter}\n---\n\n${this.content}`;
  }
}
