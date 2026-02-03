import { calculateBusinessResults } from "../utils/business";
import { insuranceScales2026 } from "../constants";

describe("calculateBusinessResults", () => {
  const baseParams = {
    userDetails: {
      grossIncome: {
        month: 2000,
        year: 24000,
      },
      taxationYearScales: {
        2026: insuranceScales2026,
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
    },
  };

  it("calculates base totals for 2026", () => {
    const result = calculateBusinessResults(baseParams);

    expect(result.totalTax.year).toBeCloseTo(3160, 2);
    expect(result.finalIncome.year).toBeCloseTo(17840, 2);
    expect(result.nextBusinessTable.insurance.year).toBeCloseTo(3000, 2);
    expect(result.nextBusinessTable.grossIncome.year).toBeCloseTo(24000, 2);
    expect(result.nextBusinessTable.finalTax.year).toBeCloseTo(3160, 2);
  });

  it("reduces total tax when children increase", () => {
    const result = calculateBusinessResults({
      ...baseParams,
      userDetails: {
        ...baseParams.userDetails,
        numberOfChildren: 2,
      },
    });

    expect(result.totalTax.year).toBeCloseTo(2720, 2);
    expect(result.finalIncome.year).toBeCloseTo(18280, 2);
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

    expect(result.taxInAdvanceValue.year).toBeCloseTo(869, 2);
    expect(result.finalIncome.year).toBeCloseTo(16971, 2);
  });
});
