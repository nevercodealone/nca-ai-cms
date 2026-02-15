import { useState, useEffect } from 'react';
import { styles } from './styles';
import type { ScheduledPostData } from './types';

export default function PlannerTab() {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPostData[]>([]);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [plannerInput, setPlannerInput] = useState('');
  const [plannerDate, setPlannerDate] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatingMode, setGeneratingMode] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [autoPublishing, setAutoPublishing] = useState(false);

  useEffect(() => {
    loadPlanner();
  }, []);

  const loadPlanner = async () => {
    setPlannerLoading(true);
    setPlannerError(null);
    try {
      // Auto-publish due posts on load
      setAutoPublishing(true);
      const autoResponse = await fetch('/api/scheduler/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'auto' }),
      });
      setAutoPublishing(false);

      if (!autoResponse.ok) {
        setPlannerError('Auto-Veröffentlichung fehlgeschlagen');
      } else {
        const autoData = await autoResponse.json();
        if (autoData.failed && autoData.failed.length > 0) {
          const failedIds = autoData.failed.map((f: { id: string }) => f.id).join(', ');
          setPlannerError(`Auto-Veröffentlichung fehlgeschlagen für: ${failedIds}`);
        }
      }

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

  if (plannerLoading) {
    return (
      <div style={styles.loadingBox}>
        <span style={styles.spinner} aria-hidden="true"></span>
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
      {plannerError && (
        <div style={styles.error} role="alert">
          {plannerError}
        </div>
      )}

      {/* Add new entry form */}
      <div style={styles.plannerForm}>
        <div style={styles.plannerFormRow}>
          <div style={{ flex: 1 }}>
            <label htmlFor="planner-input" style={styles.label}>
              URL oder Keywords
            </label>
            <input
              type="text"
              id="planner-input"
              value={plannerInput}
              onChange={(e) => setPlannerInput(e.target.value)}
              placeholder="https://... oder Keywords eingeben"
              style={styles.input}
            />
          </div>
          <div style={{ width: '180px' }}>
            <label htmlFor="planner-date" style={styles.label}>
              Datum
            </label>
            <input
              type="date"
              id="planner-date"
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
                              aria-hidden="true"
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
                          onClick={() => handlePublishScheduledPost(post.id)}
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
                                aria-hidden="true"
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
                        <p style={styles.imageAlt}>{post.generatedImageAlt}</p>
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
}
