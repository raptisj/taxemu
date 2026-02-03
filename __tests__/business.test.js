import {
  calculateTax2026Entrepreneur,
  getInsuranceTotal,
  applyPrePaidDiscount,
  applyFirstScaleDiscount,
  calculateBusinessScalesTax,
} from "../utils/business";
import { AGE_GROUPS, insuranceScales2026 } from "../constants";

describe("calculateTax2026Entrepreneur", () => {
  it("throws on invalid inputs", () => {
    expect(() =>
      calculateTax2026Entrepreneur({
        taxableIncome: -1,
        ageGroup: AGE_GROUPS.A30P,
        children: 0,
      }),
    ).toThrow("taxableIncome must be non-negative");

    expect(() =>
      calculateTax2026Entrepreneur({
        taxableIncome: 1000,
        ageGroup: "UNKNOWN",
        children: 0,
      }),
    ).toThrow("invalid ageGroup");

    expect(() =>
      calculateTax2026Entrepreneur({
        taxableIncome: 1000,
        ageGroup: AGE_GROUPS.A30P,
        children: 1.5,
      }),
    ).toThrow("children must be a non-negative integer");
  });

  it("applies U25 age relief only up to 20k", () => {
    const withinRelief = calculateTax2026Entrepreneur({
      taxableIncome: 20000,
      ageGroup: AGE_GROUPS.U25,
      children: 0,
    });

    expect(withinRelief.tax).toBe(0);
    expect(withinRelief.appliedRates["0-10k"]).toBe(0);
    expect(withinRelief.appliedRates["10-20k"]).toBe(0);
    expect(withinRelief.appliedRates["20-30k"]).toBe(0.26);

    const aboveRelief = calculateTax2026Entrepreneur({
      taxableIncome: 20001,
      ageGroup: AGE_GROUPS.U25,
      children: 0,
    });

    expect(aboveRelief.appliedRates["0-10k"]).toBe(0.09);
    expect(aboveRelief.appliedRates["10-20k"]).toBe(0.2);
    expect(aboveRelief.tax).toBeCloseTo(2900.26, 2);
  });

  it("adjusts rates for children and calculates progressive tax", () => {
    const result = calculateTax2026Entrepreneur({
      taxableIncome: 25000,
      ageGroup: AGE_GROUPS.A30P,
      children: 2,
    });

    expect(result.appliedRates["10-20k"]).toBe(0.16);
    expect(result.appliedRates["20-30k"]).toBe(0.22);
    expect(result.tax).toBeCloseTo(3600, 2);
  });

  it("applies 4+ children exemptions and third bracket reduction", () => {
    const fourKids = calculateTax2026Entrepreneur({
      taxableIncome: 25000,
      ageGroup: AGE_GROUPS.A30P,
      children: 4,
    });

    expect(fourKids.appliedRates["0-10k"]).toBe(0);
    expect(fourKids.appliedRates["10-20k"]).toBe(0);
    expect(fourKids.appliedRates["20-30k"]).toBe(0.18);
    expect(fourKids.tax).toBeCloseTo(900, 2);

    const fiveKids = calculateTax2026Entrepreneur({
      taxableIncome: 25000,
      ageGroup: AGE_GROUPS.A30P,
      children: 5,
    });

    expect(fiveKids.appliedRates["20-30k"]).toBe(0.16);
    expect(fiveKids.tax).toBeCloseTo(800, 2);

    const manyKids = calculateTax2026Entrepreneur({
      taxableIncome: 25000,
      ageGroup: AGE_GROUPS.A30P,
      children: 20,
    });

    expect(manyKids.appliedRates["20-30k"]).toBe(0);
    expect(manyKids.tax).toBe(0);
  });

  it("returns a breakdown with a null upper bound for the top bracket", () => {
    const result = calculateTax2026Entrepreneur({
      taxableIncome: 70000,
      ageGroup: AGE_GROUPS.A30P,
      children: 0,
    });

    expect(result.breakdown).toHaveLength(6);
    const last = result.breakdown[result.breakdown.length - 1];
    expect(last.to).toBeNull();
    expect(result.tax).toBeCloseTo(21100, 2);
  });
});

describe("getInsuranceTotal", () => {
  it("returns monthly or yearly insurance totals", () => {
    const taxationYearScales = { 2026: insuranceScales2026 };

    const monthly = getInsuranceTotal({
      taxationYearScales,
      taxationYear: 2026,
      taxYearDuration: 12,
      businessExpensesMonthOrYear: "month",
      insuranceScaleSelection: 2,
      specialInsuranceScale: false,
    });

    expect(monthly).toBe(300);

    const yearly = getInsuranceTotal({
      taxationYearScales,
      taxationYear: 2026,
      taxYearDuration: 11,
      businessExpensesMonthOrYear: "year",
      insuranceScaleSelection: 2,
      specialInsuranceScale: false,
    });

    expect(yearly).toBe(11 * 300);
  });

  it("forces scale 0 when special insurance scale is enabled", () => {
    const taxationYearScales = { 2026: insuranceScales2026 };

    const result = getInsuranceTotal({
      taxationYearScales,
      taxationYear: 2026,
      taxYearDuration: 12,
      businessExpensesMonthOrYear: "month",
      insuranceScaleSelection: 5,
      specialInsuranceScale: true,
    });

    expect(result).toBe(150);
  });
});

describe("discount helpers", () => {
  it("applies pre-paid tax discount", () => {
    expect(applyPrePaidDiscount(1000, false)).toBe(1000);
    expect(applyPrePaidDiscount(1000, true)).toBe(500);
  });

  it("applies first scale discount", () => {
    expect(applyFirstScaleDiscount(900, false)).toBe(900);
    expect(applyFirstScaleDiscount(900, true)).toBe(450);
  });
});

describe("calculateBusinessScalesTax", () => {
  it("calculates within first bracket with optional discount", () => {
    expect(
      calculateBusinessScalesTax({
        toBeTaxed: 5000,
        firstScaleDiscount: false,
      }),
    ).toBeCloseTo(450, 2);

    expect(
      calculateBusinessScalesTax({
        toBeTaxed: 5000,
        firstScaleDiscount: true,
      }),
    ).toBeCloseTo(225, 2);
  });

  it("does not apply first scale discount once above the first threshold", () => {
    expect(
      calculateBusinessScalesTax({
        toBeTaxed: 10001,
        firstScaleDiscount: true,
      }),
    ).toBeCloseTo(900.22, 2);
  });

  it("calculates multiple brackets correctly", () => {
    expect(
      calculateBusinessScalesTax({
        toBeTaxed: 35000,
        firstScaleDiscount: false,
      }),
    ).toBeCloseTo(7700, 2);

    expect(
      calculateBusinessScalesTax({
        toBeTaxed: 50000,
        firstScaleDiscount: false,
      }),
    ).toBeCloseTo(13900, 2);
  });
});
