// Global keyboard shortcuts hook for the Today command cockpit and focus engine
import { useEffect, useState, useRef } from "react";

const ENABLED_KEY = "mission_keyboard_shortcuts_enabled";

export function areShortcutsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ENABLED_KEY) !== "false";
}

export const getShortcutsEnabled = areShortcutsEnabled;

export function setShortcutsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ENABLED_KEY, enabled ? "true" : "false");
}

export interface ShortcutHandlers {
  onTogglePause?: () => void;
  onToggleFullscreen?: () => void;
  onBlitzMode?: () => void;
  onOpenQuickTodo?: () => void;
  onToggleMute?: () => void;
  onSwitchTask?: (index: number) => void;
  onEscape?: () => void;
  onSnapshot?: () => void;
}

export const SHORTCUT_LIST = [
  { key: "Space", description: "Pause / Resume active focus timer" },
  { key: "B", description: "Toggle Emergency Blitz lock-in mode" },
  { key: "F", description: "Toggle distraction-free fullscreen overlay" },
  { key: "N", description: "Quick jump to create daily action todo" },
  { key: "M", description: "Toggle soundscape master mute / unmute" },
  { key: "S", description: "Open daily focus snapshot breakdown" },
  { key: "1 – 9", description: "Switch focus to the N-th daily action task" },
  { key: "Esc", description: "Close fullscreen mode / active dialogs" },
];

export const SHORTCUT_CHEATSHEET = SHORTCUT_LIST.map((s) => ({ keys: s.key, action: s.description }));

function isTypingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node || !node.tagName) return false;
  const tag = node.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || node.isContentEditable === true;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabledOverride?: boolean) {
  const [enabled, setEnabledState] = useState(() => areShortcutsEnabled());
  const ref = useRef(handlers);
  ref.current = handlers;

  const isGloballyEnabled = enabledOverride !== undefined ? enabledOverride : enabled;

  useEffect(() => {
    if (!isGloballyEnabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const h = ref.current;
      if (e.key === "Escape") {
        h.onEscape?.();
        return;
      }
      if (isTypingTarget(e.target)) return;

      if (e.code === "Space") {
        e.preventDefault();
        h.onTogglePause?.();
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "b") {
        e.preventDefault();
        h.onBlitzMode?.();
      } else if (key === "f") {
        e.preventDefault();
        h.onToggleFullscreen?.();
      } else if (key === "n") {
        e.preventDefault();
        h.onOpenQuickTodo?.();
      } else if (key === "m") {
        e.preventDefault();
        h.onToggleMute?.();
      } else if (key === "s") {
        e.preventDefault();
        h.onSnapshot?.();
      } else if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        h.onSwitchTask?.(Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isGloballyEnabled]);

  return {
    shortcutsEnabled: enabled,
    setShortcutsEnabled: (v: boolean) => {
      setShortcutsEnabled(v);
      setEnabledState(v);
    },
  };
}
