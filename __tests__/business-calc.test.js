import { getBusinessRules } from "../rules";
import { calculateBusinessResults } from "../utils/business";

describe("calculateBusinessResults", () => {
  const baseParams = {
    userDetails: {
      grossIncome: {
        month: 2000,
        year: 24000,
      },
      taxationYear: 2026,
      taxYearDuration: 12,
      grossMonthOrYear: "year",
      businessExpensesMonthOrYear: "month",
      insuranceScaleSelection: 1,
      discountOptions: {
        firstScaleDiscount: false,
        prePaidTaxDiscount: false,
        specialInsuranceScale: false,
      },
      prePaidNextYearTax: false,
      withholdingTax: false,
      extraBusinessExpenses: 0,
      previousYearTaxInAdvance: 0,
      numberOfChildren: 0,
      ageGroup: "A30P",
      minimumPresumedIncome: {
        businessAge: 6,
        hasAdjustments: false,
      },
    },
  };

  it("calculates base totals for 2026", () => {
    const result = calculateBusinessResults(baseParams);

    expect(result.totalTax.year).toBeCloseTo(3126.4, 2);
    expect(result.finalIncome.year).toBeCloseTo(17744.36, 2);
    expect(result.nextBusinessTable.insurance.year).toBeCloseTo(3129.24, 2);
    expect(result.nextBusinessTable.grossIncome.year).toBeCloseTo(24000, 2);
    expect(result.nextBusinessTable.finalTax.year).toBeCloseTo(3126.4, 2);
  });

  it("halves the first-bracket rate for an eligible new business in 2026", () => {
    const rules = JSON.parse(JSON.stringify(getBusinessRules(2026)));
    rules.insurance.monthlyAmounts = rules.insurance.monthlyAmounts.map(() => 0);
    rules.insurance.monthlyUnemploymentContribution = 0;

    const result = calculateBusinessResults({
      rules,
      userDetails: {
        ...baseParams.userDetails,
        grossIncome: { month: 8000 / 12, year: 8000 },
        discountOptions: {
          ...baseParams.userDetails.discountOptions,
          firstScaleDiscount: true,
        },
        minimumPresumedIncome: {
          businessAge: 1,
          hasAdjustments: false,
        },
      },
    });

    expect(result.taxableIncome.year).toBe(8000);
    expect(result.totalTax.year).toBe(360);
  });

  it("reduces total tax when children increase", () => {
    const result = calculateBusinessResults({
      ...baseParams,
      userDetails: {
        ...baseParams.userDetails,
        numberOfChildren: 2,
      },
    });

    expect(result.totalTax.year).toBeCloseTo(2691.57, 2);
    expect(result.finalIncome.year).toBeCloseTo(18179.19, 2);
  });

  it("updates tax in advance and final income when pre-paid tax is enabled", () => {
    const result = calculateBusinessResults({
      ...baseParams,
      userDetails: {
        ...baseParams.userDetails,
        prePaidNextYearTax: true,
        discountOptions: {
          ...baseParams.userDetails.discountOptions,
          prePaidTaxDiscount: true,
        },
      },
    });

    expect(result.taxInAdvanceValue.year).toBeCloseTo(859.76, 2);
    expect(result.finalIncome.year).toBeCloseTo(16884.6, 2);
  });

  it("deducts withholding from the advance in the reported €24,000 case", () => {
    const result = calculateBusinessResults({
      ...baseParams,
      userDetails: {
        ...baseParams.userDetails,
        prePaidNextYearTax: true,
        withholdingTax: true,
      },
    });

    expect(result.totalTax.year).toBeCloseTo(3126.4, 2);
    expect(result.nextBusinessTable.withholdingTaxAmount.year).toBe(4800);
    expect(result.taxInAdvanceValue).toEqual({ month: 0, year: 0 });
    expect(result.finalIncome.year).toBeCloseTo(17744.36, 2);
  });

  it("preserves the accounting loss while taxing the presumed minimum", () => {
    const result = calculateBusinessResults({
      ...baseParams,
      userDetails: {
        ...baseParams.userDetails,
        grossIncome: { month: 500, year: 6000 },
        extraBusinessExpenses: 10000,
      },
    });

    expect(result.accountingProfit).toEqual({ month: 0, year: 0 });
    expect(result.presumedIncome.year).toBe(12880);
    expect(result.taxableIncome).toEqual({
      month: 12880 / 12,
      year: 12880,
    });
    expect(result.totalTax.year).toBe(1476);
    expect(result.finalIncome.year).toBeLessThan(0);
  });

  it("reproduces the reported 2025 sixth-year example", () => {
    const result = calculateBusinessResults({
      userDetails: {
        ...baseParams.userDetails,
        taxationYear: 2025,
        grossIncome: { month: 500, year: 6000 },
        minimumPresumedIncome: {
          businessAge: 6,
          hasAdjustments: false,
        },
      },
    });

    expect(result.nextBusinessTable.insurance.year).toBe(2935.8);
    expect(result.accountingProfit.year).toBeCloseTo(3064.2, 2);
    expect(result.presumedIncome.year).toBe(12320);
    expect(result.taxableIncome.year).toBe(12320);
    expect(result.totalTax.year).toBeCloseTo(1410.4, 2);
  });

  it("uses the full selected-period revenue for a six-month monthly-income calculation", () => {
    const result = calculateBusinessResults({
      ...baseParams,
      userDetails: {
        ...baseParams.userDetails,
        grossIncome: { month: 2000, year: 12000 },
        grossMonthOrYear: "month",
        taxYearDuration: 6,
        minimumPresumedIncome: {
          businessAge: 5,
          hasAdjustments: false,
        },
      },
    });

    expect(result.nextBusinessTable.grossIncome).toEqual({
      month: 2000,
      year: 12000,
    });
    expect(result.nextBusinessTable.insurance.year).toBeCloseTo(1564.62, 2);
    expect(result.accountingProfit.year).toBeCloseTo(10435.38, 2);
    expect(result.taxableIncome.year).toBeCloseTo(10435.38, 2);
    expect(result.totalTax.year).toBeCloseTo(987.08, 2);
    expect(result.finalIncome.year).toBeCloseTo(9448.3, 2);
    expect(result.finalIncome.month).toBeCloseTo(1574.72, 2);
  });

  it("produces identical six-month results from monthly and period-total income", () => {
    const monthlyResult = calculateBusinessResults({
      ...baseParams,
      userDetails: {
        ...baseParams.userDetails,
        grossIncome: { month: 2000, year: 12000 },
        grossMonthOrYear: "month",
        taxYearDuration: 6,
      },
    });
    const periodTotalResult = calculateBusinessResults({
      ...baseParams,
      userDetails: {
        ...baseParams.userDetails,
        grossIncome: { month: 2000, year: 12000 },
        grossMonthOrYear: "year",
        taxYearDuration: 6,
      },
    });

    expect(periodTotalResult.nextBusinessTable.grossIncome).toEqual(
      monthlyResult.nextBusinessTable.grossIncome,
    );
    expect(periodTotalResult.accountingProfit).toEqual(
      monthlyResult.accountingProfit,
    );
    expect(periodTotalResult.taxableIncome).toEqual(monthlyResult.taxableIncome);
    expect(periodTotalResult.totalTax).toEqual(monthlyResult.totalTax);
    expect(periodTotalResult.finalIncome).toEqual(monthlyResult.finalIncome);
  });
});
