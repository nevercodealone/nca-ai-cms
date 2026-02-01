import { marked } from 'marked';
import { sanitizeMarkdownHtml } from './sanitize';

/**
 * Parse markdown to sanitized HTML.
 * This is the ONLY correct way to convert markdown to HTML in this project.
 * Do NOT call marked() directly -- always use this function.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const rawHtml = await marked(markdown);
  return sanitizeMarkdownHtml(rawHtml);
}
