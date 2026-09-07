import {
  calculateYearComparison,
  getDifference,
  parseComparisonInput,
  parseComparisonYears,
  removeComparisonParams,
  serializeComparisonInput,
} from "../utils/yearComparison";

const employee = {
  activeInput: "gross",
  grossIncomeMonthly: 2000,
  grossIncomeYearly: 28000,
  finalIncomeMonthly: 0,
  finalIncomeYearly: 0,
  salaryMonthCount: 14,
  taxationYear: 2026,
  numberOfChildren: 0,
  ageGroup: "A30P",
  discountOptions: { returnBaseInland: false },
};

const business = {
  grossIncome: { month: 2000, year: 24000 },
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
};

describe("year comparison", () => {
  it("compares employee years without changing the supplied inputs", () => {
    const original = JSON.parse(JSON.stringify(employee));
    const comparison = calculateYearComparison("employee", employee, [2025, 2026]);

    expect(employee).toEqual(original);
    expect(comparison.results[0].metrics.tax.year).toBe(3762);
    expect(comparison.results[1].metrics.tax.year).toBe(3477);
    expect(comparison.differences.tax.annual).toBe(-285);
    expect(comparison.differences.netIncome.annual).toBe(285);
    expect(comparison.differences.netIncome.monthly).toBe(21);
    expect(comparison.differences.netIncome.percentage).toBeCloseTo(1.3902, 3);
  });

  it("holds a requested employee net income fixed in both years", () => {
    const comparison = calculateYearComparison(
      "employee",
      {
        ...employee,
        activeInput: "final",
        finalIncomeMonthly: 1500,
        finalIncomeYearly: 21000,
      },
      [2025, 2026],
    );

    expect(comparison.results.map((result) => result.metrics.netIncome.month)).toEqual([1500, 1500]);
    expect(comparison.results[0].grossIncome.month).not.toBe(
      comparison.results[1].grossIncome.month,
    );
  });

  it("compares business insurance, taxable income, tax, prepayment and net", () => {
    const comparison = calculateYearComparison("business", business, [2025, 2026]);

    expect(comparison.results[0].metrics.insurance.year).toBeCloseTo(2935.8, 2);
    expect(comparison.results[1].metrics.insurance.year).toBeCloseTo(3009.24, 2);
    expect(comparison.results[1].metrics.taxableIncome.year).toBeCloseTo(20990.76, 2);
    expect(comparison.results[0].metrics.adjustment.year).toBe(0);
    expect(comparison.differences.tax.annual).toBeCloseTo(-240.38, 2);
    expect(comparison.differences.netIncome.annual).toBeCloseTo(166.94, 2);

    const withPrepayment = calculateYearComparison(
      "business",
      { ...business, prePaidNextYearTax: true },
      [2025, 2026],
    );
    expect(withPrepayment.results[1].metrics.adjustment.year).toBeCloseTo(1736.68, 2);
  });

  it("parses only supported URL years and handles zero-based percentages", () => {
    expect(parseComparisonYears("2024,2026", 2026)).toEqual([2024, 2026]);
    expect(parseComparisonYears("1999,2026", 2026)).toEqual([2025, 2026]);
    expect(getDifference({ month: 0, year: 0 }, { month: 1, year: 12 })).toEqual({
      annual: 12,
      monthly: 1,
      percentage: null,
    });
  });

  it("round-trips only calculation inputs through a shareable URL payload", () => {
    const value = serializeComparisonInput("employee", {
      ...employee,
      hasError: true,
      tableResults: { finalIncome: { month: 1, year: 1 } },
    });
    const parsed = parseComparisonInput("employee", value);

    expect(parsed.grossIncomeYearly).toBe(28000);
    expect(parsed.discountOptions).toEqual({ returnBaseInland: false });
    expect(parsed).not.toHaveProperty("hasError");
    expect(parsed).not.toHaveProperty("tableResults");
    expect(parseComparisonInput("business", value)).toBeNull();
    expect(parseComparisonInput("employee", "not-json")).toBeNull();
  });

  it("clears comparison URL state without removing unrelated parameters", () => {
    const query = {
      compare: "2025,2026",
      compareInput: "shared-input",
      wiki: "open",
    };

    expect(removeComparisonParams(query)).toEqual({ wiki: "open" });
    expect(query).toHaveProperty("compare");
  });
});
