import {
  CHANGELOG_LAST_INCLUDED_COMMIT,
  changelogEntries,
  isNewChangelogEntry,
} from "../constants/changelog";

describe("changelog data", () => {
  it("is newest-first with concise, unique entries", () => {
    expect(CHANGELOG_LAST_INCLUDED_COMMIT).toBe("b1b537e");
    expect(changelogEntries.length).toBeGreaterThan(0);

    const sectionDates = changelogEntries.map(({ date }) => date);
    expect(sectionDates).toEqual(["2026-09"]);
    sectionDates.forEach((date) => expect(date).toMatch(/^\d{4}-\d{2}$/));
    changelogEntries.forEach((section) =>
      section.items.forEach((item) =>
        expect(item.date.slice(0, 7)).toBe(section.date)
      )
    );

    const items = changelogEntries.flatMap(({ items }) => items);
    const itemDates = items.map(({ date }) => date);
    expect(itemDates).toEqual([...itemDates].sort().reverse());
    expect(new Set(items.map(({ text }) => text)).size).toBe(items.length);
    items.forEach(({ date, text }) => {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(text).toMatch(/\.$/);
      expect(text.length).toBeLessThanOrEqual(180);
    });
  });

  it("shows the new badge only for dates within the last seven days", () => {
    const now = new Date("2026-10-02T23:59:59Z");

    expect(isNewChangelogEntry({ date: "2026-10-02" }, now)).toBe(true);
    expect(isNewChangelogEntry({ date: "2026-09-25" }, now)).toBe(true);
    expect(isNewChangelogEntry({ date: "2026-09-24" }, now)).toBe(false);
    expect(isNewChangelogEntry({ date: "2026-10-03" }, now)).toBe(false);
  });
});
