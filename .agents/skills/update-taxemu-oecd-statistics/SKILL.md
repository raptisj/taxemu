---
name: update-taxemu-oecd-statistics
description: Update or verify the static OECD Taxing Wages data used by Taxemu's /statistics page. Use when refreshing its data year, Greece-versus-OECD figures, household profiles, rank, components, or official source links; do not use for personal calculator results.
---

# Update Taxemu OECD Statistics

Maintain the static OECD comparison in constants/statistics.js. Keep this page
independent from the employee form and do not add a database.

## Workflow

1. Find the latest published OECD Taxing Wages edition on official OECD pages.
   Confirm its observation year; do not assume that the report year and data
   year are identical.
2. Read references/oecd-sdmx.md and fetch the required observations from the
   official OECD SDMX API as CSV. Use report pages for methodology and editorial
   links, not as the primary numeric source when SDMX has the observation.
3. Before editing, validate exactly one Greece and one OECD_REP value per
   profile, all 38 member values for ranking, finite values for the requested
   year, and component reconciliation within 0.2 percentage points after
   display rounding.
4. Update constants/statistics.js with one-decimal percentages and the average
   Greek gross wage rounded to the nearest euro. If the observation year
   changes, update its year-specific export name and every import and test.
5. Update the edition-specific report, Greece chapter, and methodology links.
   Keep the OECD Data Explorer link.
6. Confirm the UI still identifies these as standardized OECD examples,
   explains the two-child assumption, and states that Taxemu form data is not
   used.
7. Run npm test -- --runInBand, npm run build, and git diff --check. Report the
   edition, observation year, fetched values, validations, and official links.

## Guardrails

- Never infer a personalized OECD result from Taxemu inputs.
- The displayed child profiles mean exactly two children under OECD assumptions;
  do not map an arbitrary user child count to them.
- Use the published OECD_REP observation for the OECD average. Use country rows
  only to calculate Greece's rank.
- Stop and inspect any SDMX schema/code change, missing country, duplicate
  observation, or changed household definition. Never carry a stale value
  forward silently.
- Preserve unrelated working-tree changes.
