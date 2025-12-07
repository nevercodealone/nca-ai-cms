import { useState } from 'react';

const SOURCE_URL =
  'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML';

const TOPICS = [
  'Audio-Only or Video-Only',
  'CAPTCHA',
  'Changing (Dynamic) Content',
  'Contrast',
  'Flashing',
  'Forms',
  'Frames & iFrames',
  'Headings',
  'Images',
  'Keyboard and Focus',
  'Language',
  'Links and Buttons',
  'Multiple Ways',
  'Page Title',
  'Parsing',
  'Repetitive Content',
  'Resizable Text',
  'Sensory Characteristics',
  'Stylesheet',
  'Synchronized Media',
  'Tables',
  'Timed Events',
];

interface GeneratedArticle {
  title: string;
  description: string;
  content: string;
  filepath: string;
}

interface GeneratedImage {
  url: string;
  alt: string;
  filepath: string;
}

export default function Editor() {
  const [topic, setTopic] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [image, setImage] = useState<GeneratedImage | null>(null);
  const [generating, setGenerating] = useState(false);
  const [regeneratingText, setRegeneratingText] = useState(false);
  const [regeneratingImage, setRegeneratingImage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
    setArticle(null);
    setImage(null);
    setPublished(false);
    setError(null);
  };

  const generateText = async (): Promise<GeneratedArticle | null> => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: SOURCE_URL, topic }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Text generation failed');
    }

    return response.json();
  };

  const generateImage = async (title?: string): Promise<GeneratedImage | null> => {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, title }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Image generation failed');
    }

    return response.json();
  };

  const handleGenerateAll = async () => {
    if (!topic) return;

    setGenerating(true);
    setError(null);
    setArticle(null);
    setImage(null);

    try {
      // Generate both in parallel
      const [textData, imageData] = await Promise.all([
        generateText(),
        generateImage(),
      ]);

      setArticle(textData);
      setImage(imageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateText = async () => {
    if (!topic) return;

    setRegeneratingText(true);
    setError(null);

    try {
      const data = await generateText();
      setArticle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Text generation failed');
    } finally {
      setRegeneratingText(false);
    }
  };

  const handleRegenerateImage = async () => {
    if (!topic) return;

    setRegeneratingImage(true);
    setError(null);

    try {
      const data = await generateImage(article?.title);
      setImage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image generation failed');
    } finally {
      setRegeneratingImage(false);
    }
  };

  const handlePublish = async () => {
    if (!article || !image) return;

    setPublishing(true);
    setError(null);

    try {
      // 1. Save image first
      const imageResponse = await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(image),
      });

      if (!imageResponse.ok) {
        const data = await imageResponse.json();
        throw new Error(data.error || 'Image save failed');
      }

      // 2. Save article with image reference
      const articleData = {
        ...article,
        image: image.filepath.replace('public', ''),
        imageAlt: image.alt,
      };

      const articleResponse = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      });

      if (!articleResponse.ok) {
        const data = await articleResponse.json();
        throw new Error(data.error || 'Article save failed');
      }

      setPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  const handleCreateNew = () => {
    setTopic('');
    setArticle(null);
    setImage(null);
    setPublished(false);
    setError(null);
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const hasContent = article && image;
  const isLoading = generating || regeneratingText || regeneratingImage || publishing;

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>Content Generator</h2>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        {/* Published State */}
        {published ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <h3 style={styles.successTitle}>Artikel veröffentlicht!</h3>
            <p style={styles.successPath}>{article?.filepath}</p>
            <button onClick={handleCreateNew} style={styles.newButton}>
              Neuen Artikel erstellen
            </button>
          </div>
        ) : (
          <>
            {/* Topic Selection */}
            <div style={styles.field}>
              <label style={styles.label}>Thema auswählen</label>
              <select
                value={topic}
                onChange={(e) => handleTopicChange(e.target.value)}
                style={styles.select}
                disabled={isLoading}
              >
                <option value="">-- Thema wählen --</option>
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button - before content exists */}
            {topic && !hasContent && (
              <button
                onClick={handleGenerateAll}
                disabled={generating}
                style={{
                  ...styles.button,
                  ...styles.generateButton,
                  opacity: generating ? 0.5 : 1,
                }}
              >
                {generating ? 'Generiere Bild & Text...' : 'Generieren'}
              </button>
            )}

            {/* After content generated: Regenerate + Publish */}
            {hasContent && (
              <div style={styles.actionSection}>
                <div style={styles.regenerateRow}>
                  <button
                    onClick={handleRegenerateImage}
                    disabled={isLoading}
                    style={{
                      ...styles.button,
                      ...styles.secondaryButton,
                      opacity: isLoading ? 0.5 : 1,
                    }}
                  >
                    {regeneratingImage ? 'Generiere...' : '🖼️ Bild neu'}
                  </button>
                  <button
                    onClick={handleRegenerateText}
                    disabled={isLoading}
                    style={{
                      ...styles.button,
                      ...styles.secondaryButton,
                      opacity: isLoading ? 0.5 : 1,
                    }}
                  >
                    {regeneratingText ? 'Generiere...' : '📄 Text neu'}
                  </button>
                </div>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  style={{
                    ...styles.button,
                    ...styles.publishButton,
                    opacity: publishing ? 0.5 : 1,
                  }}
                >
                  {publishing ? 'Veröffentliche...' : 'Veröffentlichen'}
                </button>
              </div>
            )}
          </>
        )}

        {error && <div style={styles.error}>{error}</div>}
      </div>

      {/* Preview Area - Image first, then Text */}
      <div style={styles.previewArea}>
        {image && (
          <div style={{ ...styles.preview, ...(published ? styles.publishedPreview : {}) }}>
            <div style={styles.previewHeader}>
              <h3 style={styles.previewTitle}>
                🖼️ Bild {published && <span style={styles.publishedBadge}>Veröffentlicht</span>}
              </h3>
              <span style={styles.filepath}>{image.filepath}</span>
            </div>
            <div style={styles.imagePreview}>
              <img src={image.url} alt={image.alt} style={styles.image} />
              <p style={styles.imageAlt}>{image.alt}</p>
            </div>
          </div>
        )}

        {article && (
          <div style={{ ...styles.preview, ...(published ? styles.publishedPreview : {}) }}>
            <div style={styles.previewHeader}>
              <h3 style={styles.previewTitle}>
                📄 Text {published && <span style={styles.publishedBadge}>Veröffentlicht</span>}
              </h3>
              <span style={styles.filepath}>{article.filepath}</span>
            </div>
            <div style={styles.frontmatter}>
              <div>
                <strong>Titel:</strong> {article.title}
              </div>
              <div>
                <strong>Beschreibung:</strong> {article.description}
              </div>
            </div>
            <div style={styles.content}>
              <pre style={styles.markdown}>{article.content}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'grid',
    gap: '2rem',
    gridTemplateColumns: '350px 1fr',
  },
  panel: {
    background: '#1e293b',
    borderRadius: '8px',
    padding: '1.5rem',
    height: 'fit-content',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  heading: {
    fontSize: '1.25rem',
    margin: 0,
  },
  logoutButton: {
    padding: '0.4rem 0.75rem',
    background: 'transparent',
    border: '1px solid #475569',
    borderRadius: '4px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  field: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#94a3b8',
    fontSize: '0.875rem',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '4px',
    color: '#f1f5f9',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem 1rem',
    background: '#334155',
    border: 'none',
    borderRadius: '4px',
    color: '#f1f5f9',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  generateButton: {
    background: '#3b82f6',
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  actionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  regenerateRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  secondaryButton: {
    background: '#475569',
    flex: 1,
  },
  publishButton: {
    background: '#22c55e',
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  successBox: {
    textAlign: 'center',
    padding: '2rem 1rem',
  },
  successIcon: {
    fontSize: '3rem',
    color: '#22c55e',
    marginBottom: '1rem',
  },
  successTitle: {
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
  },
  successPath: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    marginBottom: '1.5rem',
  },
  newButton: {
    padding: '0.75rem 1.5rem',
    background: '#3b82f6',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  error: {
    marginTop: '1rem',
    padding: '0.75rem',
    background: '#7f1d1d',
    borderRadius: '4px',
    color: '#fecaca',
  },
  previewArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  preview: {
    background: '#1e293b',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  publishedPreview: {
    border: '2px solid #22c55e',
  },
  previewHeader: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: '1rem',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  publishedBadge: {
    background: '#22c55e',
    color: '#fff',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 'normal',
  },
  filepath: {
    color: '#94a3b8',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
  },
  frontmatter: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #334155',
    fontSize: '0.875rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  content: {
    padding: '1.5rem',
    maxHeight: '400px',
    overflow: 'auto',
  },
  markdown: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    whiteSpace: 'pre-wrap',
    margin: 0,
    color: '#e2e8f0',
  },
  imagePreview: {
    padding: '1.5rem',
    textAlign: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '4px',
  },
  imageAlt: {
    marginTop: '0.5rem',
    color: '#94a3b8',
    fontSize: '0.875rem',
  },
};
