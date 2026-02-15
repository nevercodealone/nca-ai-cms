import { useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { styles } from './styles';
import type { GeneratedArticle, GeneratedImage } from './types';

interface GenerateTabState {
  input: string;
  error: string | null;
  article: GeneratedArticle | null;
  image: GeneratedImage | null;
  generating: boolean;
  regeneratingText: boolean;
  regeneratingImage: boolean;
  publishing: boolean;
  published: boolean;
  handleInputChange: (value: string) => void;
  getInputType: () => 'url' | 'keywords' | 'empty';
  canGenerate: () => boolean;
  handleGenerateAll: () => Promise<void>;
  handleRegenerateText: () => Promise<void>;
  handleRegenerateImage: () => Promise<void>;
  handlePublish: () => Promise<void>;
  handleCreateNew: () => void;
  hasContent: boolean;
  isLoading: boolean;
  getStatusText: () => string;
}

const GenerateTabContext = createContext<GenerateTabState | null>(null);

function useGenerateTabContext(): GenerateTabState {
  const ctx = useContext(GenerateTabContext);
  if (!ctx)
    throw new Error(
      'GenerateTab compound components must be used within GenerateTabProvider'
    );
  return ctx;
}

export function GenerateTabProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [image, setImage] = useState<GeneratedImage | null>(null);
  const [generating, setGenerating] = useState(false);
  const [regeneratingText, setRegeneratingText] = useState(false);
  const [regeneratingImage, setRegeneratingImage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handleInputChange = (value: string) => {
    setInput(value);
    setArticle(null);
    setImage(null);
    setPublished(false);
    setError(null);
  };

  const isUrl = (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const getInputType = (): 'url' | 'keywords' | 'empty' => {
    if (!input.trim()) return 'empty';
    return isUrl(input.trim()) ? 'url' : 'keywords';
  };

  const canGenerate = () => {
    return input.trim().length > 0;
  };

  const generateText = async (): Promise<GeneratedArticle | null> => {
    const type = getInputType();
    const response = await fetch('/api/generate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        type === 'url' ? { url: input.trim() } : { keywords: input.trim() }
      ),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Text generation failed');
    }

    return response.json();
  };

  const generateImage = async (
    title: string
  ): Promise<GeneratedImage | null> => {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Image generation failed');
    }

    return response.json();
  };

  const handleGenerateAll = async () => {
    if (!canGenerate()) return;

    setGenerating(true);
    setError(null);
    setArticle(null);
    setImage(null);

    try {
      const textData = await generateText();
      setArticle(textData);

      if (textData?.title) {
        const imageData = await generateImage(textData.title);
        setImage(imageData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateText = async () => {
    if (!canGenerate()) return;

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
    if (!article?.title) return;

    setRegeneratingImage(true);
    setError(null);

    try {
      const data = await generateImage(article.title);
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
      const articleData = {
        ...article,
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

      const { folderPath } = await articleResponse.json();

      const imageResponse = await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: image.url, folderPath }),
      });

      if (!imageResponse.ok) {
        const data = await imageResponse.json();
        throw new Error(data.error || 'Image save failed');
      }

      setPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  const handleCreateNew = () => {
    setInput('');
    setArticle(null);
    setImage(null);
    setPublished(false);
    setError(null);
  };

  const hasContent = article !== null;
  const isLoading =
    generating || regeneratingText || regeneratingImage || publishing;

  const getStatusText = (): string => {
    if (generating) return 'Generiere Bild und Text...';
    if (regeneratingText) return 'Generiere Text neu...';
    if (regeneratingImage) return 'Generiere Bild neu...';
    if (publishing) return 'Veröffentliche Artikel...';
    if (published) return 'Artikel erfolgreich veröffentlicht.';
    if (error) return `Fehler: ${error}`;
    if (hasContent) return 'Inhalt wurde generiert.';
    return '';
  };

  const value: GenerateTabState = {
    input,
    error,
    article,
    image,
    generating,
    regeneratingText,
    regeneratingImage,
    publishing,
    published,
    handleInputChange,
    getInputType,
    canGenerate,
    handleGenerateAll,
    handleRegenerateText,
    handleRegenerateImage,
    handlePublish,
    handleCreateNew,
    hasContent,
    isLoading,
    getStatusText,
  };

  return (
    <GenerateTabContext.Provider value={value}>
      {children}
    </GenerateTabContext.Provider>
  );
}

export function GenerateTabControls() {
  const {
    input,
    error,
    article,
    published,
    generating,
    regeneratingText,
    regeneratingImage,
    publishing,
    image,
    handleInputChange,
    getInputType,
    canGenerate,
    handleGenerateAll,
    handleRegenerateText,
    handleRegenerateImage,
    handlePublish,
    handleCreateNew,
    hasContent,
    isLoading,
    getStatusText,
  } = useGenerateTabContext();

  return (
    <>
      <div aria-live="polite" style={styles.srOnly}>
        {getStatusText()}
      </div>
      <div
        role="tabpanel"
        id="tabpanel-generate"
        aria-labelledby="tab-generate"
      >
        {/* Published State */}
        {published ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 style={styles.successTitle}>Artikel veröffentlicht!</h3>
            <p style={styles.successPath}>{article?.filepath}</p>
            <button onClick={handleCreateNew} style={styles.newButton}>
              Neuen Artikel erstellen
            </button>
          </div>
        ) : (
          <>
            {/* Input Field */}
            <div style={styles.field}>
              <label htmlFor="content-input" style={styles.label}>
                URL oder Thema
              </label>
              <input
                type="text"
                id="content-input"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="https://... oder Keywords eingeben"
                style={styles.input}
                disabled={isLoading}
              />
              <span style={styles.hint}>
                {getInputType() === 'url'
                  ? 'URL erkannt – Inhalt wird analysiert'
                  : getInputType() === 'keywords'
                    ? 'Keywords erkannt – Recherche wird durchgeführt'
                    : 'URL für Analyse oder Keywords für Recherche'}
              </span>
            </div>

            {/* Generate Button - before content exists */}
            {canGenerate() && !hasContent && (
              <button
                onClick={handleGenerateAll}
                disabled={generating}
                style={{
                  ...styles.button,
                  ...styles.generateButton,
                  opacity: generating ? 0.6 : 1,
                  cursor: generating ? 'not-allowed' : 'pointer',
                }}
              >
                {generating ? (
                  <span style={styles.buttonContent}>
                    <span style={styles.spinner} aria-hidden="true"></span>
                    Generiere Bild & Text...
                  </span>
                ) : (
                  'Generieren'
                )}
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
                      opacity: isLoading ? 0.6 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {regeneratingImage ? 'Generiere...' : 'Bild neu'}
                  </button>
                  <button
                    onClick={handleRegenerateText}
                    disabled={isLoading}
                    style={{
                      ...styles.button,
                      ...styles.secondaryButton,
                      opacity: isLoading ? 0.6 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {regeneratingText ? 'Generiere...' : 'Text neu'}
                  </button>
                </div>
                <button
                  onClick={handlePublish}
                  disabled={publishing || !image}
                  style={{
                    ...styles.button,
                    ...styles.publishButton,
                    opacity: publishing || !image ? 0.6 : 1,
                    cursor: publishing || !image ? 'not-allowed' : 'pointer',
                  }}
                >
                  {publishing ? (
                    <span style={styles.buttonContent}>
                      <span style={styles.spinner} aria-hidden="true"></span>
                      Veröffentliche...
                    </span>
                  ) : (
                    'Veröffentlichen'
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {error && (
          <div style={styles.error} role="alert">
            {error}
          </div>
        )}
      </div>
    </>
  );
}

export function GenerateTabPreview() {
  const { image, article, published } = useGenerateTabContext();

  return (
    <div style={styles.previewArea}>
      {image && (
        <div
          style={{
            ...styles.preview,
            ...(published ? styles.publishedPreview : {}),
          }}
        >
          <div style={styles.previewHeader}>
            <h3 style={styles.previewTitle}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Bild</span>
              {published && (
                <span style={styles.publishedBadge}>Veröffentlicht</span>
              )}
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
        <div
          style={{
            ...styles.preview,
            ...(published ? styles.publishedPreview : {}),
          }}
        >
          <div style={styles.previewHeader}>
            <h3 style={styles.previewTitle}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span>Text</span>
              {published && (
                <span style={styles.publishedBadge}>Veröffentlicht</span>
              )}
            </h3>
            <span style={styles.filepath}>{article.filepath}</span>
          </div>
          <div style={styles.frontmatter}>
            <div style={styles.frontmatterRow}>
              <span style={styles.frontmatterLabel}>Titel</span>
              <span style={styles.frontmatterValue}>{article.title}</span>
            </div>
            <div style={styles.frontmatterRow}>
              <span style={styles.frontmatterLabel}>Beschreibung</span>
              <span style={styles.frontmatterValue}>{article.description}</span>
            </div>
          </div>
          <div style={styles.content}>
            <pre style={styles.markdown}>{article.content}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
