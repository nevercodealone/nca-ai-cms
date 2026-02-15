import type React from 'react';

export function useTabNavigation() {
  const handleTabKeyDown = (
    e: React.KeyboardEvent,
    tabs: readonly string[],
    currentTab: string,
    setTab: (tab: string) => void
  ) => {
    const currentIndex = tabs.indexOf(currentTab);
    let newIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = tabs.length - 1;
    }
    if (newIndex >= 0 && tabs[newIndex] !== undefined) {
      setTab(tabs[newIndex] as string);
      // Focus the new tab button
      const tabList = (e.currentTarget as HTMLElement).parentElement;
      const buttons =
        tabList?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[newIndex]?.focus();
    }
  };

  return { handleTabKeyDown };
}
