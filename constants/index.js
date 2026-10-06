export {
  hicpInflation,
  hicpSource,
  latestActualInflationYear,
  purchasingPowerBaseYear,
  wageDistributions,
} from "./insights";
export { oecdTaxWedge2025 } from "./statistics";
export {
  CHANGELOG_LAST_INCLUDED_COMMIT,
  changelogEntries,
} from "./changelog";

export const AGE_GROUPS = Object.freeze({
  U25: "U25",
  A26_30: "A26_30",
  A30P: "A30P",
});

// Show /compare in the desktop navbar and mobile navigation menu.
export const SHOW_OFFER_COMPARISON_LINKS = true;

export const FEEDBACK_FORM_URL = "https://forms.gle/DT6tNoR2VES57XrY7";
