import {
  calculateTax2026Entrepreneur,
  getInsuranceTotal,
  applyPrePaidDiscount,
  calculateTaxPrepayment,
  applyFirstScaleDiscount,
  calculateBusinessScalesTax,
  calculateMinimumPresumedBusinessIncome,
} from "../utils/business";
import { AGE_GROUPS } from "../constants";
import { getBusinessRules } from "../rules";

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
    const rules = getBusinessRules(2026);

    const monthly = getInsuranceTotal({
      rules,
      taxationYear: 2026,
      taxYearDuration: 12,
      businessExpensesMonthOrYear: "month",
      insuranceScaleSelection: 2,
      specialInsuranceScale: false,
    });

    expect(monthly).toBe(300.93);

    const yearly = getInsuranceTotal({
      rules,
      taxationYear: 2026,
      taxYearDuration: 11,
      businessExpensesMonthOrYear: "year",
      insuranceScaleSelection: 2,
      specialInsuranceScale: false,
    });

    expect(yearly).toBe(11 * 300.93);
  });

  it("forces scale 0 when special insurance scale is enabled", () => {
    const rules = getBusinessRules(2026);

    const result = getInsuranceTotal({
      rules,
      taxationYear: 2026,
      taxYearDuration: 12,
      businessExpensesMonthOrYear: "month",
      insuranceScaleSelection: 5,
      specialInsuranceScale: true,
    });

    expect(result).toBe(150.46);
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

describe("calculateTaxPrepayment", () => {
  const calculate = (overrides = {}) =>
    calculateTaxPrepayment({
      incomeTax: 1000,
      withholdingTax: 0,
      rate: 0.55,
      prePaidTaxDiscount: false,
      discountMultiplier: 0.5,
      minimumAssessmentAmount: 30,
      ...overrides,
    });

  it("deducts withholding from the 55% advance before assessment", () => {
    expect(calculate({ withholdingTax: 200 })).toBe(350);
    expect(calculate({ withholdingTax: 550 })).toBe(0);
    expect(calculate({ withholdingTax: 800 })).toBe(0);
  });

  it("applies the first-years discount after withholding", () => {
    expect(
      calculate({ withholdingTax: 200, prePaidTaxDiscount: true }),
    ).toBe(175);
  });

  it("does not assess an advance of €30 or less", () => {
    expect(calculate({ withholdingTax: 520.01 })).toBe(0);
    expect(calculate({ withholdingTax: 520 })).toBe(0);
    expect(calculate({ withholdingTax: 519.99 })).toBe(30.01);
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

  it("applies the first-years relief to the 2026 business policy", () => {
    const rules = getBusinessRules(2026);

    expect(
      calculateBusinessScalesTax({
        toBeTaxed: 8000,
        grossIncome: 8000,
        firstScaleDiscount: true,
        policy: rules.incomeTax,
        discountRules: { ...rules.firstYearsDiscount, enabled: true },
      }),
    ).toBe(360);
  });

  it.each([
    [AGE_GROUPS.U25, 0, 0],
    [AGE_GROUPS.A26_30, 0, 360],
    [AGE_GROUPS.A30P, 4, 0],
  ])(
    "composes the first-years relief with the %s age group and %s children",
    (ageGroup, children, expectedTax) => {
      const rules = getBusinessRules(2026);

      expect(
        calculateBusinessScalesTax({
          toBeTaxed: 8000,
          grossIncome: 8000,
          firstScaleDiscount: true,
          policy: rules.incomeTax,
          discountRules: { ...rules.firstYearsDiscount, enabled: true },
          ageGroup,
          children,
        }),
      ).toBe(expectedTax);
    },
  );

  it("halves only the resolved first-bracket rate", () => {
    const rules = getBusinessRules(2026);

    expect(
      calculateBusinessScalesTax({
        toBeTaxed: 25000,
        grossIncome: 10000,
        firstScaleDiscount: true,
        policy: rules.incomeTax,
        discountRules: { ...rules.firstYearsDiscount, enabled: true },
        ageGroup: AGE_GROUPS.A30P,
        children: 2,
      }),
    ).toBe(3150);
  });

  it("uses gross business income for the €10,000 eligibility limit", () => {
    const rules = getBusinessRules(2026);

    expect(
      calculateBusinessScalesTax({
        toBeTaxed: 8000,
        grossIncome: 10000.01,
        firstScaleDiscount: true,
        policy: rules.incomeTax,
        discountRules: { ...rules.firstYearsDiscount, enabled: true },
      }),
    ).toBe(720);
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

describe("calculateMinimumPresumedBusinessIncome", () => {
  const calculate = (businessAge, overrides = {}, taxationYear = 2025) =>
    calculateMinimumPresumedBusinessIncome({
      taxationYear,
      annualTurnover: 6000,
      minimumPresumedIncome: {
        businessAge,
        hasAdjustments: false,
        ...overrides,
      },
    });

  it("uses the selected year's annual minimum salary", () => {
    expect(calculate(6, {}, 2023).amount).toBe(10920);
    expect(calculate(6, {}, 2024).amount).toBe(11620);
    expect(calculate(6, {}, 2025).amount).toBe(12320);
    expect(calculate(6, {}, 2026).amount).toBe(12880);
  });

  it("applies the new-business reductions and later trienniums", () => {
    expect(calculate(3).amount).toBe(0);
    expect(calculate(4).amount).toBeCloseTo(4106.67, 2);
    expect(calculate(5).amount).toBeCloseTo(8213.33, 2);
    expect(calculate(6).amount).toBe(12320);
    expect(calculate(7).amount).toBe(13552);
    expect(calculate(10).amount).toBeCloseTo(14907.2, 2);
    expect(calculate(13).amount).toBeCloseTo(16397.92, 2);
  });

  it("applies employee, turnover, offset, relief, duration, and caps", () => {
    const adjusted = calculate(6, {
      hasAdjustments: true,
      employeeAdjustment: true,
      annualPayrollCost: 20000,
      highestPaidEmployeeGross: 18000,
      turnoverAdjustment: true,
      kadAverageTurnover: 4000,
      otherIncomeAdjustment: true,
      otherIncome: 1000,
      reliefAdjustment: true,
      reliefType: "half",
    });

    expect(adjusted.breakdown.payrollComponent).toBe(2000);
    expect(adjusted.breakdown.turnoverComponent).toBe(100);
    expect(adjusted.breakdown.article28AAmount).toBe(18000);
    expect(adjusted.amount).toBe(8500);

    const limited = calculate(6, {
      hasAdjustments: true,
      reliefAdjustment: true,
      reliefType: "limited",
      eligibleOperatingDays: 100,
    });
    expect(limited.amount).toBeCloseTo(3375.34, 2);

    const exempt = calculate(6, {
      hasAdjustments: true,
      reliefAdjustment: true,
      reliefType: "exempt",
    });
    expect(exempt.amount).toBe(0);

    const capped = calculate(6, {
      hasAdjustments: true,
      employeeAdjustment: true,
      annualPayrollCost: 500000,
      highestPaidEmployeeGross: 100000,
      turnoverAdjustment: true,
      kadAverageTurnover: 1,
    });
    expect(capped.breakdown.article28AAmount).toBeLessThanOrEqual(50000);
  });

  it("does not apply before tax year 2023 and validates business age", () => {
    expect(calculate(6, {}, 2022)).toEqual({
      applies: false,
      amount: 0,
      breakdown: null,
    });
    expect(() => calculate(0)).toThrow("businessAge");
  });
});
