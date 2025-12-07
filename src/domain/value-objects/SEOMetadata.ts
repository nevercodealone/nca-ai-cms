export class SEOMetadata {
  readonly title: string;
  readonly description: string;

  private static readonly MAX_TITLE_LENGTH = 60;
  private static readonly MAX_DESCRIPTION_LENGTH = 155;

  constructor(title: string, description: string) {
    if (title.length > SEOMetadata.MAX_TITLE_LENGTH) {
      throw new Error(
        `Title must be max ${SEOMetadata.MAX_TITLE_LENGTH} characters, got ${title.length}`
      );
    }
    if (description.length > SEOMetadata.MAX_DESCRIPTION_LENGTH) {
      throw new Error(
        `Description must be max ${SEOMetadata.MAX_DESCRIPTION_LENGTH} characters, got ${description.length}`
      );
    }

    this.title = title;
    this.description = description;
  }

  static truncate(title: string, description: string): SEOMetadata {
    const truncatedTitle =
      title.length > SEOMetadata.MAX_TITLE_LENGTH
        ? title.slice(0, SEOMetadata.MAX_TITLE_LENGTH - 3) + '...'
        : title;

    const truncatedDesc =
      description.length > SEOMetadata.MAX_DESCRIPTION_LENGTH
        ? description.slice(0, SEOMetadata.MAX_DESCRIPTION_LENGTH - 3) + '...'
        : description;

    return new SEOMetadata(truncatedTitle, truncatedDesc);
  }
}
