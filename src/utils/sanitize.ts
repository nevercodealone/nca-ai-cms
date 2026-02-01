import sanitizeHtml from 'sanitize-html';

const MARKDOWN_ALLOWED_TAGS: string[] = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'blockquote',
  'pre',
  'code',
  'ul',
  'ol',
  'li',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'hr',
  'br',
  'div',
  'a',
  'strong',
  'em',
  'b',
  'i',
  'del',
  's',
  'sub',
  'sup',
  'mark',
  'img',
  'dl',
  'dt',
  'dd',
];

const MARKDOWN_ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] =
  {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    td: ['align'],
    th: ['align'],
    code: ['class'],
    pre: ['class'],
    '*': ['id'],
  };

const MARKDOWN_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: MARKDOWN_ALLOWED_TAGS,
  allowedAttributes: MARKDOWN_ALLOWED_ATTRIBUTES,
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
  disallowedTagsMode: 'discard',
};

/**
 * Sanitize HTML produced by a markdown parser.
 * Allows standard markdown elements, strips everything dangerous.
 */
export function sanitizeMarkdownHtml(dirtyHtml: string): string {
  return sanitizeHtml(dirtyHtml, MARKDOWN_SANITIZE_OPTIONS);
}

/**
 * Escape a string for safe inclusion in JSON-LD <script> blocks.
 * JSON.stringify does not escape </script> sequences.
 */
export function escapeJsonLd(jsonString: string): string {
  return jsonString
    .replace(/<\/script/gi, '<\\/script')
    .replace(/<!--/g, '<\\!--');
}

/**
 * Escape a string for safe use in innerHTML.
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
