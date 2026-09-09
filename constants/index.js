export {
  hicpInflation,
  hicpSource,
  latestActualInflationYear,
  purchasingPowerBaseYear,
  wageDistributions,
} from "./insights";
export { oecdTaxWedge2025 } from "./statistics";

export const AGE_GROUPS = Object.freeze({
  U25: "U25",
  A26_30: "A26_30",
  A30P: "A30P",
});

// Keep /compare accessible by direct URL until the feature is ready to launch.
export const SHOW_OFFER_COMPARISON_LINKS = false;
