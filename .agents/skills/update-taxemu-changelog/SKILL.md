---
name: update-taxemu-changelog
description: Maintain Taxemu's user-facing changelog of major product improvements from local Git history. Use when adding important features or fixes to /changelog, advancing its included-commit marker, or checking whether committed work is missing; do not use for release notes outside Taxemu.
---

# Update Taxemu Changelog

Maintain the product updates in `constants/changelog.js` for nontechnical
readers. Keep monthly sections as `{ date: "YYYY-MM", items: [...] }` and give
each item its own `{ date: "YYYY-MM-DD", text: "..." }`. The section month is
displayed on `/changelog`; the item date is hidden and determines whether its
"Νέο" badge appears for the first seven days. Keep the original day for each
existing item when consolidating sections by month.

## Workflow

1. Read `CHANGELOG_LAST_INCLUDED_COMMIT` and confirm it is an ancestor of
   `HEAD` with `git merge-base --is-ancestor`.
2. Inspect commits after that marker in chronological order with local Git.
   Use commit subjects only for discovery; read the relevant diffs before
   deciding what changed for users.
3. Apply a high bar: include a change only when it materially expands what a
   user can calculate or compare, changes an important result or tax rule, or
   removes a substantial obstacle to completing a core task. Ask whether the
   change is worth announcing to a user who has not followed the development
   history. Being visible or mildly convenient is insufficient. Omit routine
   navigation and layout changes, confirmation dialogs, badges, labels, copy
   and link updates, as well as test fixes, refactors, build and tooling work,
   dependency updates, and unrelated changes. Do not combine minor changes
   into an entry just to make them seem significant. It is fine to add no
   entries for a reviewed range.
4. Write each item as one short, plain Greek sentence about the benefit or
   changed behavior. Avoid implementation terms and vague claims such as
   "fixed a bug". Combine commits that deliver one change, give each item its
   own product-change date, group items under its month, and keep sections and
   items newest-first. Preserve existing product items and their dates unless
   the user requests a rewrite.
5. Update `CHANGELOG_LAST_INCLUDED_COMMIT` to the newest reviewed commit only
   after every commit through it has been considered. Do not include
   uncommitted work unless the user explicitly asks for it.
6. Run `npm test -- --runInBand`, `npm run build`, and `git diff --check`.

If the marker is missing or is not an ancestor of `HEAD`, stop and inspect the
history before editing. Prefer local Git; use the GitHub commit history only
when the local checkout is incomplete or the user specifically requests it.

Preserve unrelated working-tree changes. If asked to commit, stage only files
related to the changelog work and inspect the staged diff before committing.
Report the covered commit range and the entries added or deliberately omitted.
