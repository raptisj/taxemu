import {
  isCalculateShortcut,
  isShortcutHelpKey,
} from "../utils/keyboardShortcuts";

describe("calculator keyboard shortcuts", () => {
  it("recognizes Ctrl+Enter and Command+Enter", () => {
    expect(isCalculateShortcut({ key: "Enter", ctrlKey: true })).toBe(true);
    expect(isCalculateShortcut({ key: "Enter", metaKey: true })).toBe(true);
    expect(isCalculateShortcut({ key: "Enter", altKey: true })).toBe(false);
    expect(isCalculateShortcut({ key: " ", ctrlKey: true })).toBe(false);
  });

  it("opens help with Shift+/ from anywhere in the calculator", () => {
    const input = document.createElement("input");
    expect(
      isShortcutHelpKey({ key: "?", shiftKey: true, target: input }),
    ).toBe(true);
    expect(isShortcutHelpKey({ key: "?", shiftKey: false })).toBe(false);
  });

  it("recognizes only the shifted slash key across layouts", () => {
    expect(
      isShortcutHelpKey({ key: ":", code: "Slash", shiftKey: true }),
    ).toBe(true);
    expect(
      isShortcutHelpKey({ key: "/", code: "Slash", shiftKey: false }),
    ).toBe(false);
    expect(isShortcutHelpKey({ key: "/" })).toBe(false);
    expect(
      isShortcutHelpKey({ key: "?", code: "Slash", ctrlKey: true }),
    ).toBe(false);
  });
});
