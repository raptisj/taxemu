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
