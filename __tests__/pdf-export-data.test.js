import { buildPersonalCalculationPdfData } from "../features/pdf/buildPersonalCalculationPdfData";
import { uppercaseWithoutDiacritics } from "../features/pdf/formatPdfText";
import { calculateBusinessResults } from "../utils/business";
import { calculateEmployeeForGrossMonth } from "../utils/employeeCalculation";
import { getComparisonInput } from "../utils/yearComparison";

const employeeInput = {
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

const businessInput = {
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
  prePaidNextYearTax: true,
  withholdingTax: false,
  extraBusinessExpenses: 1200,
  previousYearTaxInAdvance: 0,
  numberOfChildren: 0,
  ageGroup: "A30P",
  minimumPresumedIncome: {
    businessAge: 6,
    hasAdjustments: false,
  },
};

const buildEmployeeDetails = () => {
  const calculation = calculateEmployeeForGrossMonth(employeeInput, 2000);
  return {
    ...employeeInput,
    ...calculation.calculatedState,
    finalIncomeMonthly: calculation.finalIncomeMonthly,
    finalIncomeYearly: calculation.finalIncomeYearly,
    tableResults: {
      ...calculation.calculatedState,
      grossIncome: { month: 2000, year: 28000 },
      finalIncome: {
        month: calculation.finalIncomeMonthly,
        year: calculation.finalIncomeYearly,
      },
      taxationYear: 2026,
      calculationInput: getComparisonInput("employee", employeeInput),
    },
  };
};

const buildBusinessDetails = () => {
  const calculation = calculateBusinessResults({ userDetails: businessInput });
  return {
    ...businessInput,
    tableResults: {
      ...calculation.nextBusinessTable,
      taxableIncome: calculation.taxableIncome,
      totalTax: calculation.totalTax,
      taxInAdvance: calculation.taxInAdvanceValue,
      calculationInput: getComparisonInput("business", businessInput),
    },
  };
};

describe("personal calculation PDF data", () => {
  test("formats uppercase Greek PDF labels without diacritics", () => {
    expect(uppercaseWithoutDiacritics("Μισθοί ανά έτος")).toBe(
      "ΜΙΣΘΟΙ ΑΝΑ ΕΤΟΣ",
    );
    expect(uppercaseWithoutDiacritics("Ηλικιακή ομάδα")).toBe(
      "ΗΛΙΚΙΑΚΗ ΟΜΑΔΑ",
    );
  });

  it("returns null until a calculation has been committed", () => {
    expect(
      buildPersonalCalculationPdfData({
        entity: "employee",
        details: { ...employeeInput, tableResults: { calculationInput: null } },
      }),
    ).toBeNull();
  });

  it("builds employee results from the committed calculation", () => {
    const data = buildPersonalCalculationPdfData({
      entity: "employee",
      details: buildEmployeeDetails(),
      generatedAt: new Date("2026-09-08T09:00:00.000Z"),
    });

    expect(data.entity).toBe("employee");
    expect(data.taxationYear).toBe(2026);
    expect(data.generatedAt).toBe("2026-09-08T09:00:00.000Z");
    expect(data.results.find(({ key }) => key === "netIncome").value.year).toBe(20785);
    expect(data.results.find(({ key }) => key === "taxWedge").percentage.year).toBeCloseTo(39.05, 2);
    expect(data.results.find(({ key }) => key === "adjustment").value.month).toBeCloseTo(38, 0);
    expect(data.comparison).toBeNull();
    expect(data.sources.length).toBeGreaterThan(0);
  });

  it("includes the active employee year comparison", () => {
    const data = buildPersonalCalculationPdfData({
      entity: "employee",
      details: buildEmployeeDetails(),
      compare: "2025,2026",
    });

    expect(data.comparison.years).toEqual([2025, 2026]);
    expect(data.comparison.differences.tax.annual).toBe(-285);
    expect(data.comparison.differences.netIncome.annual).toBe(285);
    expect(new Set(data.sources.map(({ url }) => url)).size).toBe(data.sources.length);
  });

  it("builds business rows including conditional prepayment", () => {
    const data = buildPersonalCalculationPdfData({
      entity: "business",
      details: buildBusinessDetails(),
      compare: "2025,2026",
    });
    const keys = data.results.map(({ key }) => key);

    expect(keys).toContain("taxableIncome");
    expect(keys).toContain("accountingProfit");
    expect(keys).toContain("presumedIncome");
    expect(keys).toContain("taxPrepayment");
    expect(keys).toContain("taxDue");
    expect(data.comparison.results).toHaveLength(2);
  });

  it("rejects an unknown calculator entity", () => {
    expect(() =>
      buildPersonalCalculationPdfData({ entity: "unknown", details: {} }),
    ).toThrow("Unknown calculator entity");
  });
});
