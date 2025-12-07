import { useState } from 'react';

const SOURCE_URL = 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML';

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

export default function Editor() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    if (!topic) {
      setError('Bitte wähle ein Thema aus');
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: SOURCE_URL, topic }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Generation failed');
      }

      const data = await response.json();
      setArticle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!article) return;

    setLoading(true);
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

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
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
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div style={styles.actions}>
          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              opacity: loading || !topic ? 0.5 : 1,
            }}
          >
            {loading ? 'Generiere...' : 'Generieren'}
          </button>

          {article && (
            <>
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={styles.button}
              >
                Neu generieren
              </button>
              <button
                onClick={handleSave}
                disabled={loading || saved}
                style={{
                  ...styles.button,
                  ...styles.successButton,
                  opacity: saved ? 0.5 : 1,
                }}
              >
                {saved ? '✓ Gespeichert' : 'Speichern'}
              </button>
            </>
          )}
        </div>

        {error && (
          <div style={styles.error}>{error}</div>
        )}
      </div>

      {article && (
        <div style={styles.preview}>
          <div style={styles.previewHeader}>
            <h3 style={styles.previewTitle}>Vorschau</h3>
            <span style={styles.filepath}>{article.filepath}</span>
          </div>

          <div style={styles.frontmatter}>
            <div><strong>Titel:</strong> {article.title}</div>
            <div><strong>Beschreibung:</strong> {article.description}</div>
          </div>

          <div style={styles.content}>
            <pre style={styles.markdown}>{article.content}</pre>
          </div>
        </div>
      )}
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
  actions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1.5rem',
    flexWrap: 'wrap',
  },
  button: {
    padding: '0.75rem 1rem',
    background: '#334155',
    border: 'none',
    borderRadius: '4px',
    color: '#f1f5f9',
    cursor: 'pointer',
    fontSize: '0.875rem',
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
    maxHeight: '600px',
    overflow: 'auto',
  },
  markdown: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    whiteSpace: 'pre-wrap',
    margin: 0,
    color: '#e2e8f0',
  },
};
