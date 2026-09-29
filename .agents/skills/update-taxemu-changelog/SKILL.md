---
name: update-taxemu-changelog
description: Maintain Taxemu's user-facing changelog from local Git history. Use when adding recent noteworthy features or fixes to /changelog, advancing its included-commit marker, or checking whether committed work is missing; do not use for release notes outside Taxemu.
---

# Update Taxemu Changelog

Maintain `constants/changelog.js`; `pages/changelog.js` renders it without
additional page edits.

## Workflow

1. Read `CHANGELOG_LAST_INCLUDED_COMMIT` and confirm it is an ancestor of
   `HEAD` with `git merge-base --is-ancestor`.
2. Inspect commits after that marker in chronological order with local Git.
   Use commit subjects only for discovery; read the relevant diffs before
   deciding what changed for users.
3. Add only noteworthy user-facing features, calculation corrections, data
   updates, or reliability improvements. Omit tests, refactors, formatting,
   wording-only changes, and implementation detail unless they materially
   changed behavior.
4. Write each item as one short Greek sentence. Consolidate commits that form
   one feature or correction, group items by commit date, and keep date groups
   newest-first. Preserve existing entries unless the user requests a rewrite.
5. Update `CHANGELOG_LAST_INCLUDED_COMMIT` to the newest reviewed commit only
   after every commit through it has been considered. Do not include
   uncommitted work unless the user explicitly asks for it.
6. Run `npm test -- --runInBand`, `npm run build`, and `git diff --check`.

If the marker is missing or is not an ancestor of `HEAD`, stop and inspect the
history before editing. Prefer local Git; use the GitHub commit history only
when the local checkout is incomplete or the user specifically requests it.

Preserve unrelated working-tree changes and report the covered commit range and
the entries added.
