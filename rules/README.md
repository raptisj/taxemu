# Annual tax rules

`taxRules.json` is the single source of truth for year-dependent employee and
business calculations. It also contains the year-dependent options used by the
forms.

## Adding a taxation year

1. Copy the entire latest year object in `taxRules.json` and give the copy the
   new year key and matching `year` value.
2. Keep unchanged values duplicated in the new object. This makes each year
   complete and avoids hidden inheritance from an older year.
3. Change only the values and policies introduced for the new year, and add the
   authoritative source links to `sources`.
4. Run `npm test` and `npm run build`.

The year selector and default/latest year are derived from the JSON keys, so a
new complete entry is picked up automatically. The application validates the
rules when they are loaded and fails early for invalid rates, brackets, or
missing core values.

Changing rates, thresholds, credits, insurance amounts, brackets, or existing
policy options only requires editing the JSON. A genuinely new kind of formula
still requires adding an interpreter for that policy kind in
`utils/taxPolicy.js`.
