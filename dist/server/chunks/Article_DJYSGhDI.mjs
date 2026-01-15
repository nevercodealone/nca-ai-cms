import { S as Slug } from './Slug_BsqCPyNW.mjs';

class SEOMetadata {
  title;
  description;
  static MAX_TITLE_LENGTH = 60;
  static MAX_DESCRIPTION_LENGTH = 155;
  constructor(title, description) {
    this.title = title.length > SEOMetadata.MAX_TITLE_LENGTH ? title.slice(0, SEOMetadata.MAX_TITLE_LENGTH - 3) + "..." : title;
    this.description = description.length > SEOMetadata.MAX_DESCRIPTION_LENGTH ? description.slice(0, SEOMetadata.MAX_DESCRIPTION_LENGTH - 3) + "..." : description;
  }
}

class Article {
  title;
  description;
  content;
  date;
  tags;
  slug;
  seoMetadata;
  image;
  imageAlt;
  constructor(props) {
    this.title = props.title;
    this.description = props.description;
    this.date = props.date;
    this.tags = props.tags;
    this.slug = new Slug(props.title);
    this.seoMetadata = new SEOMetadata(props.title, props.description);
    this.content = props.content;
    if (props.image !== void 0) {
      this.image = props.image;
    }
    if (props.imageAlt !== void 0) {
      this.imageAlt = props.imageAlt;
    }
  }
  get filename() {
    return `${this.slug.toString()}.md`;
  }
  get year() {
    return this.date.getFullYear();
  }
  get month() {
    return String(this.date.getMonth() + 1).padStart(2, "0");
  }
  get folderPath() {
    return `src/content/articles/${this.year}/${this.month}/${this.slug.toString()}`;
  }
  get filepath() {
    return `${this.folderPath}/index.md`;
  }
  toFrontmatter() {
    return {
      title: this.title,
      description: this.description,
      date: this.date.toISOString().split("T")[0],
      createdAt: this.date.toISOString(),
      tags: this.tags,
      ...this.image && { image: this.image },
      ...this.imageAlt && { imageAlt: this.imageAlt }
    };
  }
  toMarkdown() {
    const frontmatter = Object.entries(this.toFrontmatter()).map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: ${JSON.stringify(value)}`;
      }
      return `${key}: "${value}"`;
    }).join("\n");
    return `---
${frontmatter}
---

${this.content}`;
  }
}

export { Article as A };
