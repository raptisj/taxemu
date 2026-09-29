import {
  CHANGELOG_LAST_INCLUDED_COMMIT,
  changelogEntries,
} from "../constants/changelog";

describe("changelog data", () => {
  it("is newest-first with concise, unique entries", () => {
    expect(CHANGELOG_LAST_INCLUDED_COMMIT).toBe("e2f1bce");
    expect(changelogEntries.length).toBeGreaterThan(0);

    const dates = changelogEntries.map(({ date }) => date);
    expect(dates).toEqual([...dates].sort().reverse());

    const items = changelogEntries.flatMap(({ items }) => items);
    expect(new Set(items).size).toBe(items.length);
    items.forEach((item) => {
      expect(item).toMatch(/\.$/);
      expect(item.length).toBeLessThanOrEqual(180);
    });
  });
});
