import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render } from "@testing-library/react";
import KeyboardShortcutsButton from "../components/keyboard/KeyboardShortcutsButton";
import {
  isCalculateShortcut,
  isClearShortcut,
  isShortcutHelpKey,
  isWikiShortcut,
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

  it("clears only with Ctrl/Command+Shift+Backspace", () => {
    expect(isClearShortcut({ key: "Backspace", ctrlKey: true, shiftKey: true })).toBe(true);
    expect(isClearShortcut({ key: "Backspace", metaKey: true, shiftKey: true })).toBe(true);
    expect(isClearShortcut({ key: "Backspace", ctrlKey: true })).toBe(false);
    expect(isClearShortcut({ key: "Backspace", metaKey: true, shiftKey: true, altKey: true })).toBe(false);
  });

  it("opens explanations with Ctrl/Command+Shift+E across keyboard layouts", () => {
    expect(isWikiShortcut({ key: "E", ctrlKey: true, shiftKey: true })).toBe(true);
    expect(isWikiShortcut({ key: "ε", code: "KeyE", metaKey: true, shiftKey: true })).toBe(true);
    expect(isWikiShortcut({ key: "e", ctrlKey: true })).toBe(false);
    expect(isWikiShortcut({ key: "e", ctrlKey: true, shiftKey: true, altKey: true })).toBe(false);
  });

  it("uses the calculator's clear action when the shortcut is pressed", () => {
    const onClear = jest.fn();
    const onCalculate = jest.fn();
    render(
      <ChakraProvider>
        <KeyboardShortcutsButton onCalculate={onCalculate} onClear={onClear} />
      </ChakraProvider>,
    );

    fireEvent.keyDown(window, { key: "Backspace", ctrlKey: true, shiftKey: true });
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onCalculate).not.toHaveBeenCalled();
  });
});
