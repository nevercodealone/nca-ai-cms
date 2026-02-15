import { useState } from 'react';
import { styles } from './editor/styles';
import { useTabNavigation } from './editor/useTabNavigation';
import PlannerTab from './editor/PlannerTab';
import SettingsTab from './editor/SettingsTab';
import {
  GenerateTabProvider,
  GenerateTabControls,
  GenerateTabPreview,
} from './editor/GenerateTab';

type TabType = 'generate' | 'planner' | 'settings';

const mainTabs = ['generate', 'planner', 'settings'] as const;

export default function Editor() {
  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const { handleTabKeyDown } = useTabNavigation();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const isFullWidth = activeTab === 'settings' || activeTab === 'planner';

  return (
    <GenerateTabProvider>
      <div
        style={{
          ...styles.container,
          gridTemplateColumns: isFullWidth ? '1fr' : '380px 1fr',
        }}
      >
        <div
          style={{
            ...styles.panel,
            ...(isFullWidth ? styles.panelFullWidth : {}),
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
          <div
            style={styles.tabNav}
            role="tablist"
            aria-label="Editor-Bereiche"
          >
            <button
              role="tab"
              id="tab-generate"
              aria-selected={activeTab === 'generate'}
              aria-controls="tabpanel-generate"
              tabIndex={activeTab === 'generate' ? 0 : -1}
              onClick={() => setActiveTab('generate')}
              onKeyDown={(e) =>
                handleTabKeyDown(e, mainTabs, activeTab, (t) =>
                  setActiveTab(t as TabType)
                )
              }
              style={{
                ...styles.tab,
                ...(activeTab === 'generate' ? styles.tabActive : {}),
              }}
            >
              Generieren
            </button>
            <button
              role="tab"
              id="tab-planner"
              aria-selected={activeTab === 'planner'}
              aria-controls="tabpanel-planner"
              tabIndex={activeTab === 'planner' ? 0 : -1}
              onClick={() => setActiveTab('planner')}
              onKeyDown={(e) =>
                handleTabKeyDown(e, mainTabs, activeTab, (t) =>
                  setActiveTab(t as TabType)
                )
              }
              style={{
                ...styles.tab,
                ...(activeTab === 'planner' ? styles.tabActive : {}),
              }}
            >
              Planer
            </button>
            <button
              role="tab"
              id="tab-settings"
              aria-selected={activeTab === 'settings'}
              aria-controls="tabpanel-settings"
              tabIndex={activeTab === 'settings' ? 0 : -1}
              onClick={() => setActiveTab('settings')}
              onKeyDown={(e) =>
                handleTabKeyDown(e, mainTabs, activeTab, (t) =>
                  setActiveTab(t as TabType)
                )
              }
              style={{
                ...styles.tab,
                ...(activeTab === 'settings' ? styles.tabActive : {}),
              }}
            >
              Einstellungen
            </button>
          </div>

          {/* Planner Tab */}
          {activeTab === 'planner' && (
            <div
              role="tabpanel"
              id="tabpanel-planner"
              aria-labelledby="tab-planner"
            >
              <PlannerTab />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div
              role="tabpanel"
              id="tabpanel-settings"
              aria-labelledby="tab-settings"
            >
              <SettingsTab />
            </div>
          )}

          {/* Generate Tab - Controls */}
          {activeTab === 'generate' && <GenerateTabControls />}
        </div>

        {/* Preview Area - only show in generate tab */}
        {activeTab === 'generate' && <GenerateTabPreview />}
      </div>
    </GenerateTabProvider>
  );
}
