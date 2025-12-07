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

  // Text state
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [textLoading, setTextLoading] = useState(false);
  const [textSaved, setTextSaved] = useState(false);

  // Image state
  const [image, setImage] = useState<GeneratedImage | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageSaved, setImageSaved] = useState(false);

  // Text handlers
  const handleGenerateText = async () => {
    if (!topic) {
      setError('Bitte wähle ein Thema aus');
      return;
    }

    setTextLoading(true);
    setError(null);
    setTextSaved(false);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: SOURCE_URL, topic }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Text generation failed');
      }

      const data = await response.json();
      setArticle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Text generation failed');
    } finally {
      setTextLoading(false);
    }
  };

  const handleSaveText = async () => {
    if (!article) return;

    setTextLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Save failed');
      }

      setTextSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setTextLoading(false);
    }
  };

  // Image handlers
  const handleGenerateImage = async () => {
    if (!topic) {
      setError('Bitte wähle ein Thema aus');
      return;
    }

    setImageLoading(true);
    setError(null);
    setImageSaved(false);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, title: article?.title }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Image generation failed');
      }

      const data = await response.json();
      setImage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image generation failed');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSaveImage = async () => {
    if (!image) return;

    setImageLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(image),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Image save failed');
      }

      setImageSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image save failed');
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <h2 style={styles.heading}>Content Generator</h2>

        <div style={styles.field}>
          <label style={styles.label}>Thema auswählen</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={styles.select}
          >
            <option value="">-- Thema wählen --</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Text Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📄 Text</h3>
          <div style={styles.actions}>
            <button
              onClick={handleGenerateText}
              disabled={textLoading || !topic}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                opacity: textLoading || !topic ? 0.5 : 1,
              }}
            >
              {textLoading ? 'Generiere...' : 'Generieren'}
            </button>
            <button
              onClick={handleGenerateText}
              disabled={textLoading || !article}
              style={{
                ...styles.button,
                opacity: textLoading || !article ? 0.5 : 1,
              }}
            >
              Neu generieren
            </button>
            <button
              onClick={handleSaveText}
              disabled={textLoading || !article || textSaved}
              style={{
                ...styles.button,
                ...styles.successButton,
                opacity: textLoading || !article || textSaved ? 0.5 : 1,
              }}
            >
              {textSaved ? '✓ Gespeichert' : 'Speichern'}
            </button>
          </div>
        </div>

        {/* Image Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🖼️ Bild</h3>
          <div style={styles.actions}>
            <button
              onClick={handleGenerateImage}
              disabled={imageLoading || !topic}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                opacity: imageLoading || !topic ? 0.5 : 1,
              }}
            >
              {imageLoading ? 'Generiere...' : 'Generieren'}
            </button>
            <button
              onClick={handleGenerateImage}
              disabled={imageLoading || !image}
              style={{
                ...styles.button,
                opacity: imageLoading || !image ? 0.5 : 1,
              }}
            >
              Neu generieren
            </button>
            <button
              onClick={handleSaveImage}
              disabled={imageLoading || !image || imageSaved}
              style={{
                ...styles.button,
                ...styles.successButton,
                opacity: imageLoading || !image || imageSaved ? 0.5 : 1,
              }}
            >
              {imageSaved ? '✓ Gespeichert' : 'Speichern'}
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}
      </div>

      {/* Preview Area */}
      <div style={styles.previewArea}>
        {article && (
          <div style={styles.preview}>
            <div style={styles.previewHeader}>
              <h3 style={styles.previewTitle}>📄 Text Vorschau</h3>
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

        {image && (
          <div style={styles.preview}>
            <div style={styles.previewHeader}>
              <h3 style={styles.previewTitle}>🖼️ Bild Vorschau</h3>
              <span style={styles.filepath}>{image.filepath}</span>
            </div>
            <div style={styles.imagePreview}>
              <img src={image.url} alt={image.alt} style={styles.image} />
              <p style={styles.imageAlt}>{image.alt}</p>
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
    gridTemplateColumns: '400px 1fr',
  },
  panel: {
    background: '#1e293b',
    borderRadius: '8px',
    padding: '1.5rem',
    height: 'fit-content',
  },
  heading: {
    fontSize: '1.25rem',
    marginBottom: '1.5rem',
  },
  field: {
    marginBottom: '1.5rem',
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
  section: {
    marginBottom: '1.5rem',
    padding: '1rem',
    background: '#0f172a',
    borderRadius: '6px',
  },
  sectionTitle: {
    fontSize: '1rem',
    marginBottom: '0.75rem',
    color: '#e2e8f0',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  button: {
    padding: '0.5rem 0.75rem',
    background: '#334155',
    border: 'none',
    borderRadius: '4px',
    color: '#f1f5f9',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  primaryButton: {
    background: '#3b82f6',
  },
  successButton: {
    background: '#22c55e',
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
