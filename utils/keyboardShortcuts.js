export const isCalculateShortcut = (event) =>
  event.key === "Enter" &&
  Boolean(event.ctrlKey || event.metaKey) &&
  !event.altKey;

export const isShortcutHelpKey = (event) =>
  Boolean(event.shiftKey) &&
  (event.key === "?" || event.code === "Slash") &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.altKey;

export const isClearShortcut = (event) =>
  event.key === "Backspace" &&
  Boolean(event.ctrlKey || event.metaKey) &&
  Boolean(event.shiftKey) &&
  !event.altKey;

export const isWikiShortcut = (event) =>
  (event.key?.toLowerCase() === "e" || event.code === "KeyE") &&
  Boolean(event.ctrlKey || event.metaKey) &&
  Boolean(event.shiftKey) &&
  !event.altKey;
