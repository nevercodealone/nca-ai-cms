import { useState, useEffect } from 'react';
import { styles } from './styles';
import { useTabNavigation } from './useTabNavigation';
import type { Prompt, Setting, SettingsSubTab } from './types';

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

export default function SettingsTab() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [activeSettingsTab, setActiveSettingsTab] =
    useState<SettingsSubTab>('homepage');

  const { handleTabKeyDown } = useTabNavigation();

  useEffect(() => {
    loadSettings();
  }, []);

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

  const settingsTabKeys = SETTINGS_GROUPS.map(
    (g) => g.key
  ) as readonly string[];

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
                aria-label={getPromptLabel(prompt.id)}
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
              aria-label={getSettingLabel(setting.key)}
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

  if (settingsLoading) {
    return (
      <div style={styles.loadingBox}>
        <span style={styles.spinner} aria-hidden="true"></span>
        <span>Lade Einstellungen...</span>
      </div>
    );
  }

  const activeGroup = SETTINGS_GROUPS.find((g) => g.key === activeSettingsTab);

  return (
    <div style={styles.settingsContent}>
      {settingsError && (
        <div style={styles.error} role="alert">
          {settingsError}
        </div>
      )}

      {/* Sub-tab navigation */}
      <div
        style={styles.subTabNav}
        role="tablist"
        aria-label="Einstellungskategorien"
      >
        {SETTINGS_GROUPS.map((group) => (
          <button
            key={group.key}
            role="tab"
            id={`settings-tab-${group.key}`}
            aria-selected={activeSettingsTab === group.key}
            aria-controls={`settings-panel-${group.key}`}
            tabIndex={activeSettingsTab === group.key ? 0 : -1}
            onClick={() => setActiveSettingsTab(group.key)}
            onKeyDown={(e) =>
              handleTabKeyDown(e, settingsTabKeys, activeSettingsTab, (t) =>
                setActiveSettingsTab(t as SettingsSubTab)
              )
            }
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
        <div
          role="tabpanel"
          id={`settings-panel-${activeGroup.key}`}
          aria-labelledby={`settings-tab-${activeGroup.key}`}
          style={styles.cardGrid}
        >
          {activeGroup.items.map((item) => renderSettingsCard(item))}
        </div>
      )}
    </div>
  );
}
