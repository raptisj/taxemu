import { hicpInflation, wageDistributions } from "../constants";
import {
  calculateBinnedPercentile,
  calculateEmployerCostBreakdown,
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

  it("expresses each employer-cost component per €100", () => {
    const breakdown = calculateEmployerCostBreakdown({
      finalIncome: 2072,
      incomeTax: 527,
      employeeContributions: 400,
      employerContributions: 654,
      totalEmployerCost: 3654,
    });

    expect(breakdown.map(({ key, perHundred }) => [key, perHundred])).toEqual([
      ["netIncome", 56.7],
      ["incomeTax", 14.42],
      ["employeeContributions", 10.95],
      ["employerContributions", 17.9],
    ]);
  });

  it("returns zeroes when employer cost is unavailable", () => {
    expect(
      calculateEmployerCostBreakdown({ totalEmployerCost: 0 }).every(
        ({ amount, perHundred }) => amount === 0 && perHundred === 0,
      ),
    ).toBe(true);
  });
});
