import { Source } from '../domain/entities/Source';

export type FetchedContent = {
  title: string;
  content: string;
  url: string;
};

export class ContentFetcher {
  async fetch(source: Source): Promise<FetchedContent> {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'NCA-Content-Bot/1.0',
        Accept: 'text/html',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${source.url}: ${response.status}`);
    }

    const html = await response.text();
    const title = this.extractTitle(html);
    const content = this.extractMainContent(html);

    return {
      title,
      content,
      url: source.url,
    };
  }

  private extractTitle(html: string): string {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match?.[1]?.trim() ?? 'Untitled';
  }

  private extractMainContent(html: string): string {
    // Remove script and style tags
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');

    // Try to find main content area
    const mainMatch =
      content.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
      content.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
      content.match(
        /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i
      );

    if (mainMatch?.[1]) {
      content = mainMatch[1];
    }

    // Convert to plain text
    content = content
      .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => {
        const hashes = '#'.repeat(parseInt(level));
        return `\n${hashes} ${this.stripTags(text).trim()}\n`;
      })
      .replace(
        /<p[^>]*>([\s\S]*?)<\/p>/gi,
        (_, text) => `\n${this.stripTags(text).trim()}\n`
      )
      .replace(
        /<li[^>]*>([\s\S]*?)<\/li>/gi,
        (_, text) => `- ${this.stripTags(text).trim()}`
      )
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
      .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n')
      .replace(/<[^>]+>/g, '') // Remove remaining tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\n{3,}/g, '\n\n') // Normalize whitespace
      .trim();

    return content;
  }

  private stripTags(html: string): string {
    return html.replace(/<[^>]+>/g, '');
  }
}
