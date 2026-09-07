import { hicpInflation, wageDistributions } from "../constants";
import {
  calculateBinnedPercentile,
  getInflationRatesBetween,
  getWageDistributionForYear,
} from "../utils";

describe("insight datasets", () => {
  test.each([
    [2021, 2163610],
    [2022, 2249599],
    [2023, 2296845],
    [2024, 2390157],
    [2025, 2460720],
  ])("reconciles the %s ERGANI wage distribution", (year, expected) => {
    const total = wageDistributions[year].bins.reduce(
      (sum, bin) => sum + bin.count,
      0,
    );

    expect(total).toBe(expected);
  });

  it("uses the matching year and clearly identifies a fallback", () => {
    expect(getWageDistributionForYear(2024, wageDistributions)).toMatchObject({
      year: 2024,
      requestedYear: 2024,
      isFallback: false,
    });
    expect(getWageDistributionForYear(2026, wageDistributions)).toMatchObject({
      year: 2025,
      requestedYear: 2026,
      isFallback: true,
    });
  });

  it("interpolates closed wage bands and treats the last band as open-ended", () => {
    const bins = [
      { label: "0-100", lower: 0, upper: 100, count: 10 },
      { label: "101-200", lower: 100, upper: 200, count: 30 },
      { label: ">200", lower: 200, upper: null, count: 60 },
    ];

    expect(calculateBinnedPercentile(50, bins)).toMatchObject({
      percentile: 5,
      isLowerBound: false,
      selectedBin: bins[0],
    });
    expect(calculateBinnedPercentile(250, bins)).toMatchObject({
      percentile: 40,
      isLowerBound: true,
      selectedBin: bins[2],
    });
  });

  it("excludes the base year from a purchasing-power comparison", () => {
    expect(getInflationRatesBetween(2022, 2025, hicpInflation)).toEqual([
      { year: 2023, rate: 0.042, status: "actual" },
      { year: 2024, rate: 0.03, status: "actual" },
      { year: 2025, rate: 0.029, status: "actual" },
    ]);
  });
});
