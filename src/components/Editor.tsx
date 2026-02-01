import { useState, useEffect } from 'react';

type TabType = 'generate' | 'planner' | 'settings';
type SettingsSubTab =
  | 'homepage'
  | 'content-ai'
  | 'analysis-ai'
  | 'image-ai'
  | 'website';

const SETTINGS_GROUPS: {
  key: SettingsSubTab;
  label: string;
  items: { type: 'setting' | 'prompt'; id: string }[];
}[] = [
  {
    key: 'homepage',
    label: 'Homepage',
    items: [
      { type: 'setting', id: 'hero_kicker' },
      { type: 'setting', id: 'hero_title' },
      { type: 'setting', id: 'hero_title_accent' },
      { type: 'setting', id: 'hero_description' },
    ],
  },
  {
    key: 'content-ai',
    label: 'Content-KI',
    items: [
      { type: 'prompt', id: 'system_prompt' },
      { type: 'prompt', id: 'user_prompt_template' },
      { type: 'prompt', id: 'cta_prompt' },
    ],
  },
  {
    key: 'analysis-ai',
    label: 'Analyse-KI',
    items: [
      { type: 'prompt', id: 'source_analysis' },
      { type: 'prompt', id: 'keyword_research' },
    ],
  },
  {
    key: 'image-ai',
    label: 'Bild-KI',
    items: [
      { type: 'prompt', id: 'image_prompt' },
      { type: 'prompt', id: 'filename_prompt' },
      { type: 'prompt', id: 'alt_text_template' },
    ],
  },
  {
    key: 'website',
    label: 'Website',
    items: [
      { type: 'setting', id: 'cta_url' },
      { type: 'setting', id: 'cta_style' },
      { type: 'setting', id: 'core_tags' },
      { type: 'setting', id: 'imprint_content' },
    ],
  },
];

interface Prompt {
  id: string;
  name: string;
  category: string;
  promptText: string;
}

interface Setting {
  key: string;
  value: string;
}

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

interface ScheduledPostData {
  id: string;
  input: string;
  inputType: string;
  scheduledDate: string;
  status: string;
  generatedTitle?: string | null;
  generatedDescription?: string | null;
  generatedContent?: string | null;
  generatedTags?: string | null;
  generatedImageData?: string | null;
  generatedImageAlt?: string | null;
  publishedPath?: string | null;
  createdAt: string;
}

export default function Editor() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const [activeSettingsTab, setActiveSettingsTab] =
    useState<SettingsSubTab>('homepage');

  // Planner tab state
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPostData[]>([]);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [plannerInput, setPlannerInput] = useState('');
  const [plannerDate, setPlannerDate] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatingMode, setGeneratingMode] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [autoPublishing, setAutoPublishing] = useState(false);

  // Generate tab state
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [image, setImage] = useState<GeneratedImage | null>(null);
  const [generating, setGenerating] = useState(false);
  const [regeneratingText, setRegeneratingText] = useState(false);
  const [regeneratingImage, setRegeneratingImage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  // Settings tab state
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const handleInputChange = (value: string) => {
    setInput(value);
    setArticle(null);
    setImage(null);
    setPublished(false);
    setError(null);
  };

  // Load settings when settings tab is active
  useEffect(() => {
    if (activeTab === 'settings' && prompts.length === 0) {
      loadSettings();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const response = await fetch('/api/prompts');
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      const data = await response.json();
      setPrompts(data.prompts || []);
      setSettings(data.settings || []);
    } catch (err) {
      setSettingsError(
        err instanceof Error ? err.message : 'Failed to load settings'
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  // Load planner when planner tab is active
  useEffect(() => {
    if (activeTab === 'planner') {
      loadPlanner();
    }
  }, [activeTab]);

  const loadPlanner = async () => {
    setPlannerLoading(true);
    setPlannerError(null);
    try {
      // Auto-publish due posts on load
      setAutoPublishing(true);
      await fetch('/api/scheduler/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'auto' }),
      });
      setAutoPublishing(false);

      const response = await fetch('/api/scheduler');
      if (!response.ok) throw new Error('Failed to load planner');
      const data = await response.json();
      setScheduledPosts(data.posts || []);
    } catch (err) {
      setPlannerError(
        err instanceof Error ? err.message : 'Failed to load planner'
      );
    } finally {
      setPlannerLoading(false);
      setAutoPublishing(false);
    }
  };

  const handleAddScheduledPost = async () => {
    if (!plannerInput.trim() || !plannerDate) return;
    setPlannerError(null);
    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: plannerInput.trim(),
          scheduledDate: plannerDate,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add entry');
      }
      setPlannerInput('');
      setPlannerDate('');
      await loadPlanner();
    } catch (err) {
      setPlannerError(
        err instanceof Error ? err.message : 'Failed to add entry'
      );
    }
  };

  const handleDeleteScheduledPost = async (id: string) => {
    setPlannerError(null);
    try {
      const response = await fetch(`/api/scheduler/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete entry');
      }
      await loadPlanner();
    } catch (err) {
      setPlannerError(
        err instanceof Error ? err.message : 'Failed to delete entry'
      );
    }
  };

  const handleGenerateScheduledPost = async (
    id: string,
    mode: 'all' | 'text' | 'image' = 'all'
  ) => {
    setGeneratingId(id);
    setGeneratingMode(mode);
    setPlannerError(null);
    try {
      const response = await fetch('/api/scheduler/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, mode }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Generation failed');
      }
      await loadPlanner();
    } catch (err) {
      setPlannerError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGeneratingId(null);
      setGeneratingMode(null);
    }
  };

  const handlePublishScheduledPost = async (id: string) => {
    setPublishingId(id);
    setPlannerError(null);
    try {
      const response = await fetch('/api/scheduler/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Publish failed');
      }
      await loadPlanner();
    } catch (err) {
      setPlannerError(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishingId(null);
    }
  };

  const getStatusBadge = (
    status: string
  ): { label: string; color: string; bg: string } => {
    switch (status) {
      case 'pending':
        return {
          label: 'Geplant',
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.12)',
        };
      case 'generated':
        return {
          label: 'Generiert',
          color: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.12)',
        };
      case 'published':
        return {
          label: 'Veröffentlicht',
          color: '#4ade80',
          bg: 'rgba(74, 222, 128, 0.12)',
        };
      default:
        return {
          label: status,
          color: '#9a9590',
          bg: 'rgba(154, 149, 144, 0.12)',
        };
    }
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Render Planner Tab Content
  const renderPlannerTab = () => {
    if (plannerLoading) {
      return (
        <div style={styles.loadingBox}>
          <span style={styles.spinner}></span>
          <span>
            {autoPublishing
              ? 'Veröffentliche fällige Beiträge...'
              : 'Lade Planer...'}
          </span>
        </div>
      );
    }

    return (
      <div style={styles.plannerContent}>
        {plannerError && <div style={styles.error}>{plannerError}</div>}

        {/* Add new entry form */}
        <div style={styles.plannerForm}>
          <div style={styles.plannerFormRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>URL oder Keywords</label>
              <input
                type="text"
                value={plannerInput}
                onChange={(e) => setPlannerInput(e.target.value)}
                placeholder="https://... oder Keywords eingeben"
                style={styles.input}
              />
            </div>
            <div style={{ width: '180px' }}>
              <label style={styles.label}>Datum</label>
              <input
                type="date"
                value={plannerDate}
                onChange={(e) => setPlannerDate(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button
                onClick={handleAddScheduledPost}
                disabled={!plannerInput.trim() || !plannerDate}
                style={{
                  ...styles.button,
                  ...styles.generateButton,
                  padding: '1rem 1.5rem',
                  opacity: !plannerInput.trim() || !plannerDate ? 0.5 : 1,
                  cursor:
                    !plannerInput.trim() || !plannerDate
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>

        {/* Post list */}
        {scheduledPosts.length === 0 ? (
          <div style={styles.emptyState}>
            Noch keine Beiträge geplant. Füge oben einen neuen Eintrag hinzu.
          </div>
        ) : (
          <div style={styles.plannerList}>
            {scheduledPosts.map((post) => {
              const badge = getStatusBadge(post.status);
              const isGenerating = generatingId === post.id;
              const isPublishing = publishingId === post.id;
              const isBusy = isGenerating || isPublishing;

              return (
                <div key={post.id} style={styles.plannerCard}>
                  <div style={styles.plannerCardHeader}>
                    <div style={styles.plannerCardMeta}>
                      <span style={styles.plannerDate}>
                        {formatDate(post.scheduledDate)}
                      </span>
                      <span
                        style={{
                          ...styles.statusBadge,
                          color: badge.color,
                          background: badge.bg,
                          borderColor: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>
                      <span style={styles.plannerInputType}>
                        {post.inputType === 'url' ? 'URL' : 'Keywords'}
                      </span>
                    </div>
                    <div style={styles.plannerCardActions}>
                      {post.status === 'pending' && (
                        <button
                          onClick={() => handleGenerateScheduledPost(post.id)}
                          disabled={isBusy}
                          style={{
                            ...styles.smallButton,
                            ...styles.saveButton,
                            opacity: isBusy ? 0.6 : 1,
                          }}
                        >
                          {isGenerating ? (
                            <span style={styles.buttonContent}>
                              <span
                                style={{
                                  ...styles.spinner,
                                  width: '12px',
                                  height: '12px',
                                }}
                              ></span>
                              Generiere...
                            </span>
                          ) : (
                            'Generieren'
                          )}
                        </button>
                      )}
                      {post.status === 'generated' && (
                        <>
                          <button
                            onClick={() =>
                              handleGenerateScheduledPost(post.id, 'text')
                            }
                            disabled={isBusy}
                            style={{
                              ...styles.smallButton,
                              ...styles.editButton,
                              opacity: isBusy ? 0.6 : 1,
                            }}
                          >
                            {isGenerating && generatingMode === 'text' ? (
                              <span style={styles.buttonContent}>
                                <span
                                  style={{
                                    ...styles.spinner,
                                    width: '12px',
                                    height: '12px',
                                  }}
                                ></span>
                                Text...
                              </span>
                            ) : (
                              'Text neu'
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleGenerateScheduledPost(post.id, 'image')
                            }
                            disabled={isBusy}
                            style={{
                              ...styles.smallButton,
                              ...styles.editButton,
                              opacity: isBusy ? 0.6 : 1,
                            }}
                          >
                            {isGenerating && generatingMode === 'image' ? (
                              <span style={styles.buttonContent}>
                                <span
                                  style={{
                                    ...styles.spinner,
                                    width: '12px',
                                    height: '12px',
                                  }}
                                ></span>
                                Bild...
                              </span>
                            ) : (
                              'Bild neu'
                            )}
                          </button>
                          <a
                            href={`/preview/${post.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              ...styles.smallButton,
                              ...styles.previewLink,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            Vorschau
                          </a>
                          <button
                            onClick={() =>
                              handlePublishScheduledPost(post.id)
                            }
                            disabled={isBusy}
                            style={{
                              ...styles.smallButton,
                              background: 'var(--color-success, #4ade80)',
                              color: '#000',
                              fontWeight: 700,
                              opacity: isBusy ? 0.6 : 1,
                            }}
                          >
                            {isPublishing ? (
                              <span style={styles.buttonContent}>
                                <span
                                  style={{
                                    ...styles.spinner,
                                    width: '12px',
                                    height: '12px',
                                    borderTopColor: '#000',
                                  }}
                                ></span>
                                Veröffentliche...
                              </span>
                            ) : (
                              'Jetzt Veröffentlichen'
                            )}
                          </button>
                        </>
                      )}
                      {post.status !== 'published' && (
                        <button
                          onClick={() => handleDeleteScheduledPost(post.id)}
                          disabled={isBusy}
                          style={{
                            ...styles.smallButton,
                            ...styles.cancelButton,
                            opacity: isBusy ? 0.6 : 1,
                          }}
                        >
                          Löschen
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={styles.plannerCardBody}>
                    <div style={styles.plannerInput}>{post.input}</div>

                    {/* Preview generated image */}
                    {post.generatedImageData && (
                      <div style={styles.plannerImagePreview}>
                        <img
                          src={`data:image/webp;base64,${post.generatedImageData}`}
                          alt={post.generatedImageAlt || ''}
                          style={styles.plannerImage}
                        />
                        {post.generatedImageAlt && (
                          <p style={styles.imageAlt}>
                            {post.generatedImageAlt}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Preview generated content */}
                    {post.generatedTitle && (
                      <div style={styles.plannerPreview}>
                        <div style={styles.frontmatterRow}>
                          <span style={styles.frontmatterLabel}>Titel</span>
                          <span style={styles.frontmatterValue}>
                            {post.generatedTitle}
                          </span>
                        </div>
                        {post.generatedDescription && (
                          <div style={styles.frontmatterRow}>
                            <span style={styles.frontmatterLabel}>
                              Beschreibung
                            </span>
                            <span style={styles.frontmatterValue}>
                              {post.generatedDescription}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {post.publishedPath && (
                      <div style={styles.plannerPublishedPath}>
                        {post.publishedPath}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const handleEditPrompt = (id: string, currentValue: string) => {
    setEditingPrompt(id);
    setEditValues({ ...editValues, [id]: currentValue });
  };

  const handleEditSetting = (key: string, currentValue: string) => {
    setEditingSetting(key);
    setEditValues({ ...editValues, [key]: currentValue });
  };

  const handleCancelEdit = () => {
    setEditingPrompt(null);
    setEditingSetting(null);
  };

  const handleSavePrompt = async (id: string) => {
    setSavingId(id);
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'prompt',
          id,
          promptText: editValues[id],
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save prompt');
      }
      setPrompts(
        prompts.map((p) =>
          p.id === id ? { ...p, promptText: editValues[id] ?? p.promptText } : p
        )
      );
      setEditingPrompt(null);
    } catch (err) {
      setSettingsError(
        err instanceof Error ? err.message : 'Failed to save prompt'
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveSetting = async (key: string) => {
    setSavingId(key);
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'setting',
          key,
          value: editValues[key],
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save setting');
      }
      setSettings(
        settings.map((s) =>
          s.key === key ? { ...s, value: editValues[key] ?? s.value } : s
        )
      );
      setEditingSetting(null);
    } catch (err) {
      setSettingsError(
        err instanceof Error ? err.message : 'Failed to save setting'
      );
    } finally {
      setSavingId(null);
    }
  };

  const getSettingLabel = (key: string): string => {
    const labels: Record<string, string> = {
      hero_kicker: 'Hero Kicker',
      hero_title: 'Hero Titel',
      hero_title_accent: 'Hero Titel Akzent',
      hero_description: 'Hero Beschreibung',
      cta_url: 'CTA URL',
      cta_style: 'CTA Stil',
      core_tags: 'Core Tags (JSON)',
      imprint_content: 'Impressum (Markdown)',
    };
    return labels[key] || key;
  };

  const getPromptLabel = (id: string): string => {
    const labels: Record<string, string> = {
      system_prompt: 'System Prompt',
      user_prompt_template: 'User Prompt Vorlage',
      source_analysis: 'Quellen-Analyse',
      keyword_research: 'Keyword-Recherche',
      cta_prompt: 'CTA Generierung',
      image_prompt: 'Bild-Prompt',
      filename_prompt: 'Dateiname-Prompt',
      alt_text_template: 'Alt-Text Vorlage',
    };
    return labels[id] || id;
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
      // First generate text to get the title
      const textData = await generateText();
      setArticle(textData);

      // Then generate image using the title
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
      // 1. Save article first to create folder and get folderPath
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

      // 2. Save image to the article folder as hero.webp
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

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const hasContent = article !== null;
  const isLoading =
    generating || regeneratingText || regeneratingImage || publishing;

  // Render a single settings card (prompt or setting)
  const renderSettingsCard = (item: {
    type: 'setting' | 'prompt';
    id: string;
  }) => {
    if (item.type === 'prompt') {
      const prompt = prompts.find((p) => p.id === item.id);
      if (!prompt) return null;
      const isEditing = editingPrompt === prompt.id;

      return (
        <div key={prompt.id} style={styles.settingsCard}>
          <div style={styles.settingsCardHeader}>
            <span style={styles.settingsItemLabel}>
              {getPromptLabel(prompt.id)}
            </span>
            <span style={styles.settingsItemCategory}>{prompt.category}</span>
          </div>
          {isEditing ? (
            <div style={styles.editArea}>
              <textarea
                value={editValues[prompt.id] || ''}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    [prompt.id]: e.target.value,
                  })
                }
                style={styles.textarea}
                rows={10}
              />
              <div style={styles.editButtons}>
                <button
                  onClick={() => handleSavePrompt(prompt.id)}
                  disabled={savingId === prompt.id}
                  style={{
                    ...styles.smallButton,
                    ...styles.saveButton,
                    opacity: savingId === prompt.id ? 0.6 : 1,
                  }}
                >
                  {savingId === prompt.id ? 'Speichert...' : 'Speichern'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{ ...styles.smallButton, ...styles.cancelButton }}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.settingsItemValue}>
              <pre style={styles.cardPreview}>{prompt.promptText}</pre>
              <button
                onClick={() => handleEditPrompt(prompt.id, prompt.promptText)}
                style={{ ...styles.smallButton, ...styles.editButton }}
              >
                Bearbeiten
              </button>
            </div>
          )}
        </div>
      );
    }

    // Setting item
    const setting = settings.find((s) => s.key === item.id);
    if (!setting) return null;
    const isEditing = editingSetting === setting.key;

    return (
      <div key={setting.key} style={styles.settingsCard}>
        <div style={styles.settingsCardHeader}>
          <span style={styles.settingsItemLabel}>
            {getSettingLabel(setting.key)}
          </span>
        </div>
        {isEditing ? (
          <div style={styles.editArea}>
            <textarea
              value={editValues[setting.key] || ''}
              onChange={(e) =>
                setEditValues({
                  ...editValues,
                  [setting.key]: e.target.value,
                })
              }
              style={styles.textarea}
              rows={setting.key === 'imprint_content' ? 12 : 3}
            />
            <div style={styles.editButtons}>
              <button
                onClick={() => handleSaveSetting(setting.key)}
                disabled={savingId === setting.key}
                style={{
                  ...styles.smallButton,
                  ...styles.saveButton,
                  opacity: savingId === setting.key ? 0.6 : 1,
                }}
              >
                {savingId === setting.key ? 'Speichert...' : 'Speichern'}
              </button>
              <button
                onClick={handleCancelEdit}
                style={{ ...styles.smallButton, ...styles.cancelButton }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.settingsItemValue}>
            <pre style={styles.cardPreview}>{setting.value}</pre>
            <button
              onClick={() => handleEditSetting(setting.key, setting.value)}
              style={{ ...styles.smallButton, ...styles.editButton }}
            >
              Bearbeiten
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render Settings Tab Content
  const renderSettingsTab = () => {
    if (settingsLoading) {
      return (
        <div style={styles.loadingBox}>
          <span style={styles.spinner}></span>
          <span>Lade Einstellungen...</span>
        </div>
      );
    }

    const activeGroup = SETTINGS_GROUPS.find(
      (g) => g.key === activeSettingsTab
    );

    return (
      <div style={styles.settingsContent}>
        {settingsError && <div style={styles.error}>{settingsError}</div>}

        {/* Sub-tab navigation */}
        <div style={styles.subTabNav}>
          {SETTINGS_GROUPS.map((group) => (
            <button
              key={group.key}
              onClick={() => setActiveSettingsTab(group.key)}
              style={{
                ...styles.subTab,
                ...(activeSettingsTab === group.key ? styles.subTabActive : {}),
              }}
            >
              {group.label}
            </button>
          ))}
        </div>

        {/* Card grid for active group */}
        {activeGroup && (
          <div style={styles.cardGrid}>
            {activeGroup.items.map((item) => renderSettingsCard(item))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        ...styles.container,
        gridTemplateColumns:
          activeTab === 'settings' || activeTab === 'planner'
            ? '1fr'
            : '380px 1fr',
      }}
    >
      <div
        style={{
          ...styles.panel,
          ...(activeTab === 'settings' || activeTab === 'planner'
            ? styles.panelFullWidth
            : {}),
        }}
      >
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>
            {activeTab === 'generate'
              ? 'Content Generator'
              : activeTab === 'planner'
                ? 'Content Planer'
                : 'Einstellungen'}
          </h2>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabNav}>
          <button
            onClick={() => setActiveTab('generate')}
            style={{
              ...styles.tab,
              ...(activeTab === 'generate' ? styles.tabActive : {}),
            }}
          >
            Generieren
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            style={{
              ...styles.tab,
              ...(activeTab === 'planner' ? styles.tabActive : {}),
            }}
          >
            Planer
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              ...styles.tab,
              ...(activeTab === 'settings' ? styles.tabActive : {}),
            }}
          >
            Einstellungen
          </button>
        </div>

        {/* Planner Tab */}
        {activeTab === 'planner' && renderPlannerTab()}

        {/* Settings Tab */}
        {activeTab === 'settings' && renderSettingsTab()}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <>
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
                  <label style={styles.label}>URL oder Thema</label>
                  <input
                    type="text"
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
                        <span style={styles.spinner}></span>
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
                        cursor:
                          publishing || !image ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {publishing ? (
                        <span style={styles.buttonContent}>
                          <span style={styles.spinner}></span>
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

            {error && <div style={styles.error}>{error}</div>}
          </>
        )}
      </div>

      {/* Preview Area - only show in generate tab */}
      {activeTab === 'generate' && (
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
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
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
                  <span style={styles.frontmatterValue}>
                    {article.description}
                  </span>
                </div>
              </div>
              <div style={styles.content}>
                <pre style={styles.markdown}>{article.content}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'grid',
    gap: '2rem',
    gridTemplateColumns: '380px 1fr',
  },
  panel: {
    background: 'var(--color-surface, #141416)',
    borderRadius: '16px',
    padding: '2rem',
    height: 'fit-content',
    border: '1px solid var(--color-border, #2a2a2e)',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid var(--color-border, #2a2a2e)',
  },
  heading: {
    fontFamily: 'var(--font-display, "Playfair Display", Georgia, serif)',
    fontSize: '1.5rem',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    margin: 0,
    color: 'var(--color-text, #faf9f7)',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid var(--color-border-accent, #3a3a40)',
    borderRadius: '6px',
    color: 'var(--color-text-muted, #706d68)',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    transition: 'all 0.2s ease',
  },
  field: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.75rem',
    color: 'var(--color-text-muted, #706d68)',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
  },
  input: {
    width: '100%',
    padding: '1rem',
    background: 'var(--color-bg, #0a0a0b)',
    border: '1px solid var(--color-border, #2a2a2e)',
    borderRadius: '8px',
    color: 'var(--color-text, #faf9f7)',
    fontSize: '1rem',
    transition: 'border-color 0.2s ease',
  },
  hint: {
    display: 'block',
    marginTop: '0.5rem',
    fontSize: '0.75rem',
    color: 'var(--color-text-muted, #706d68)',
  },
  button: {
    padding: '1rem 1.25rem',
    background: 'var(--color-surface-elevated, #1a1a1d)',
    border: 'none',
    borderRadius: '8px',
    color: 'var(--color-text, #faf9f7)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  generateButton: {
    background: 'var(--color-primary, #e63946)',
    width: '100%',
    padding: '1.25rem',
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    boxShadow: '0 4px 20px rgba(230, 57, 70, 0.3)',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  actionSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  regenerateRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  secondaryButton: {
    background: 'var(--color-surface-accent, #222226)',
    fontSize: '0.875rem',
    padding: '1rem',
  },
  publishButton: {
    background: 'var(--color-success, #4ade80)',
    color: '#000',
    width: '100%',
    padding: '1.25rem',
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    boxShadow: '0 4px 20px rgba(74, 222, 128, 0.3)',
  },
  successBox: {
    textAlign: 'center' as const,
    padding: '3rem 1.5rem',
    background: 'var(--color-success-muted, rgba(74, 222, 128, 0.12))',
    borderRadius: '12px',
    border: '1px solid rgba(74, 222, 128, 0.3)',
  },
  successIcon: {
    color: 'var(--color-success, #4ade80)',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
  },
  successTitle: {
    fontFamily: 'var(--font-display, "Playfair Display", Georgia, serif)',
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    color: 'var(--color-text, #faf9f7)',
  },
  successPath: {
    color: 'var(--color-text-muted, #706d68)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
    marginBottom: '2rem',
    wordBreak: 'break-all' as const,
  },
  newButton: {
    padding: '1rem 2rem',
    background: 'var(--color-primary, #e63946)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600,
    boxShadow: '0 4px 20px rgba(230, 57, 70, 0.3)',
  },
  error: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: 'var(--color-error-muted, rgba(248, 113, 113, 0.12))',
    border: '1px solid rgba(248, 113, 113, 0.3)',
    borderRadius: '8px',
    color: 'var(--color-error, #f87171)',
    fontSize: '0.9rem',
  },
  previewArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  preview: {
    background: 'var(--color-surface, #141416)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid var(--color-border, #2a2a2e)',
  },
  publishedPreview: {
    borderColor: 'var(--color-success, #4ade80)',
    boxShadow: '0 0 24px rgba(74, 222, 128, 0.15)',
  },
  previewHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--color-border, #2a2a2e)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--color-surface-elevated, #1a1a1d)',
  },
  previewTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--color-text, #faf9f7)',
  },
  publishedBadge: {
    background: 'var(--color-success, #4ade80)',
    color: '#000',
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px',
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  filepath: {
    color: 'var(--color-text-muted, #706d68)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
  },
  frontmatter: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--color-border, #2a2a2e)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  frontmatterRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  frontmatterLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: 'var(--color-text-muted, #706d68)',
  },
  frontmatterValue: {
    fontSize: '0.9rem',
    color: 'var(--color-text-accent, #e8e6e1)',
  },
  content: {
    padding: '1.5rem',
    maxHeight: '450px',
    overflow: 'auto',
    background: 'var(--color-bg, #0a0a0b)',
  },
  markdown: {
    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
    fontSize: '0.85rem',
    whiteSpace: 'pre-wrap' as const,
    margin: 0,
    color: 'var(--color-text-accent, #e8e6e1)',
    lineHeight: 1.7,
  },
  imagePreview: {
    padding: '1.5rem',
    textAlign: 'center' as const,
    background: 'var(--color-bg, #0a0a0b)',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '350px',
    borderRadius: '8px',
    boxShadow: '0 12px 24px -4px rgba(0, 0, 0, 0.5)',
  },
  imageAlt: {
    marginTop: '0.75rem',
    color: 'var(--color-text-muted, #706d68)',
    fontSize: '0.875rem',
    fontStyle: 'italic' as const,
  },
  // Tab Navigation
  tabNav: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    padding: '0.25rem',
    background: 'var(--color-bg, #0a0a0b)',
    borderRadius: '8px',
  },
  tab: {
    flex: 1,
    padding: '0.75rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: 'var(--color-text-muted, #9a9590)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'var(--color-surface-elevated, #1a1a1d)',
    color: 'var(--color-text, #faf9f7)',
  },
  // Settings Tab
  panelFullWidth: {
    maxWidth: '100%',
  },
  settingsContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  subTabNav: {
    display: 'flex',
    gap: '0.375rem',
    flexWrap: 'wrap' as const,
  },
  subTab: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid var(--color-border, #2a2a2e)',
    borderRadius: '9999px',
    color: 'var(--color-text-muted, #9a9590)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const,
  },
  subTabActive: {
    background: 'var(--color-surface-elevated, #1a1a1d)',
    color: 'var(--color-text, #faf9f7)',
    borderColor: 'var(--color-border-accent, #3a3a40)',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1rem',
  },
  settingsCard: {
    background: 'var(--color-bg, #0a0a0b)',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid var(--color-border, #2a2a2e)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  settingsCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsItemLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--color-text, #faf9f7)',
  },
  settingsItemCategory: {
    fontSize: '0.65rem',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    padding: '0.25rem 0.5rem',
    background: 'var(--color-surface-elevated, #1a1a1d)',
    borderRadius: '4px',
    color: 'var(--color-text-muted, #9a9590)',
  },
  settingsItemValue: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  cardPreview: {
    fontSize: '0.8rem',
    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
    color: 'var(--color-text-muted, #9a9590)',
    margin: 0,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    lineHeight: 1.5,
    maxHeight: '200px',
    overflow: 'auto',
  },
  editArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    background: 'var(--color-surface, #141416)',
    border: '1px solid var(--color-border-accent, #3a3a40)',
    borderRadius: '6px',
    color: 'var(--color-text, #faf9f7)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
    resize: 'vertical' as const,
    lineHeight: 1.5,
  },
  editButtons: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
  },
  smallButton: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  editButton: {
    background: 'var(--color-surface-elevated, #1a1a1d)',
    color: 'var(--color-text, #faf9f7)',
    alignSelf: 'flex-start',
  },
  saveButton: {
    background: 'var(--color-primary, #e63946)',
    color: '#fff',
  },
  cancelButton: {
    background: 'transparent',
    border: '1px solid var(--color-border, #2a2a2e)',
    color: 'var(--color-text-muted, #9a9590)',
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '2rem',
    color: 'var(--color-text-muted, #9a9590)',
  },
  // Planner styles
  plannerContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  plannerForm: {
    background: 'var(--color-bg, #0a0a0b)',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid var(--color-border, #2a2a2e)',
  },
  plannerFormRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end',
  },
  plannerList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  plannerCard: {
    background: 'var(--color-bg, #0a0a0b)',
    borderRadius: '12px',
    border: '1px solid var(--color-border, #2a2a2e)',
    overflow: 'hidden',
  },
  plannerCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--color-border, #2a2a2e)',
    background: 'var(--color-surface-elevated, #1a1a1d)',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
  },
  plannerCardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  plannerDate: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--color-text, #faf9f7)',
    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
  },
  statusBadge: {
    padding: '0.2rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    border: '1px solid',
  },
  plannerInputType: {
    fontSize: '0.65rem',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    padding: '0.2rem 0.5rem',
    background: 'var(--color-surface, #141416)',
    borderRadius: '4px',
    color: 'var(--color-text-muted, #9a9590)',
  },
  plannerCardActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  plannerCardBody: {
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  plannerInput: {
    fontSize: '0.9rem',
    color: 'var(--color-text-accent, #e8e6e1)',
    wordBreak: 'break-all' as const,
  },
  plannerImagePreview: {
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'var(--color-bg, #0a0a0b)',
    textAlign: 'center' as const,
  },
  plannerImage: {
    maxWidth: '100%',
    maxHeight: '250px',
    borderRadius: '8px',
    objectFit: 'cover' as const,
  },
  plannerPreview: {
    padding: '0.75rem',
    background: 'var(--color-surface, #141416)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  plannerPublishedPath: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
    color: 'var(--color-success, #4ade80)',
    padding: '0.5rem 0.75rem',
    background: 'rgba(74, 222, 128, 0.08)',
    borderRadius: '6px',
  },
  previewLink: {
    background: 'var(--color-surface-accent, #222226)',
    color: 'var(--color-text, #faf9f7)',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem 1.5rem',
    color: 'var(--color-text-muted, #9a9590)',
    fontSize: '0.9rem',
    background: 'var(--color-bg, #0a0a0b)',
    borderRadius: '12px',
    border: '1px dashed var(--color-border, #2a2a2e)',
  },
};
