import taxRules from "../rules/taxRules.json";
import { validateTaxRules } from "../rules";
import { calculateEmployeeForGrossMonth, solveEngineerGrossForNet } from "../utils/employeeCalculation";
import { calculateEngineerContributions, formatContributionMoney } from "../utils/employeeContributions";
import { getEmployeeCalculationInput, getDirtyFields } from "../utils/formState";
import { calculateYearComparison, getComparisonInput, parseComparisonInput, serializeComparisonInput } from "../utils/yearComparison";
import { calculateEmployeeOffer, calculateOfferComparison, createDefaultOfferComparisonInput, parseOfferComparisonInput, serializeOfferComparisonInput } from "../utils/offerComparison";
import { buildPersonalCalculationPdfData } from "../features/pdf/buildPersonalCalculationPdfData";
import { buildEmployeeExplanation } from "../features/wiki/explanations";

const engineer = (overrides = {}) => ({
  taxationYear: 2026, insuranceProfile: "engineer", supplementaryCategory: 1,
  lumpSumCategory: 1, supplementaryFund: "efka", salaryMonthCount: 14,
  numberOfChildren: 0, ageGroup: "A30P", activeInput: "gross", grossMonthOrYear: "month",
  grossIncomeMonthly: 2000, grossIncomeYearly: 28000,
  discountOptions: { returnBaseInland: false }, ...overrides,
});

describe("2026 salaried engineer, full-year coverage code 1022", () => {
  // Independent fixtures from the research supplied by the user:
  // Circular 38/2024, PDF p. 11: 10.37% / 18.79%, supplementary/lump sum excluded.
  // Circular 4/2026, §§1–3 pp. 2–3: €7,761.94 cap and category amounts.
  // Circular 8/2021 §4.3 and document 1283148/17-09-2024 p. 9: 12 fixed charges, no gifts.

  test.each([
    [1, 1, 279.42, 372.60], [1, 2, 279.42, 444.24], [1, 3, 279.42, 530.16],
    [2, 1, 336.78, 372.60], [2, 2, 336.78, 444.24], [2, 3, 336.78, 530.16],
    [3, 1, 401.28, 372.60], [3, 2, 401.28, 444.24], [3, 3, 401.28, 530.16],
  ])("applies supplementary %s and lump-sum %s independently", (supplementaryCategory, lumpSumCategory, supplementaryAnnual, lumpAnnual) => {
    const result = calculateEngineerContributions(engineer({ supplementaryCategory, lumpSumCategory }), 2000);
    expect(result.employee.year).toBeCloseTo(2903.60 + supplementaryAnnual + lumpAnnual, 2);
    expect(result.employer.year).toBeCloseTo(5261.20 + supplementaryAnnual, 2);
    expect(result.rows.find(({ id }) => id === "lumpSum").employer.year).toBe(0);
    expect(Math.round(result.rows.reduce((total, row) => total + row.employee.year * 100, 0))).toBe(Math.round(result.employee.year * 100));
  });

  test.each([12, 14, 14.5])("charges only 12 fixed months for %s salary equivalents", (salaryMonthCount) => {
    const result = calculateEngineerContributions(engineer({ salaryMonthCount }), 2000);
    expect(result.rows.find(({ id }) => id === "supplementary").employee.year).toBe(279.42);
    expect(result.rows.find(({ id }) => id === "lumpSum").employee.year).toBe(372.60);
  });

  test("caps percentage contributions without capping the category charges", () => {
    const below = calculateEngineerContributions(engineer(), 7761.93);
    const at = calculateEngineerContributions(engineer(), 7761.94);
    const above = calculateEngineerContributions(engineer(), 10000);
    expect(above.employee.year).toBe(at.employee.year);
    expect(above.employer.year).toBe(at.employer.year);
    expect(below.employee.year).toBeLessThan(at.employee.year);
    expect(above.rows.find(({ id }) => id === "pension").employee.year).toBe(7248.10);
    expect(above.rows.find(({ id }) => id === "lumpSum").employee.year).toBe(372.60);
  });

  test("retains half-cent payer shares and displays real zero employer lump-sum", () => {
    const result = calculateEngineerContributions(engineer(), 2000);
    expect(result.rows.find(({ id }) => id === "supplementary").employee.ordinaryMonth).toBe(23.285);
    expect(formatContributionMoney(23.285)).toBe("23,285 €");
    expect(formatContributionMoney(0)).toBe("0,00 €");
    expect(calculateEngineerContributions(engineer({ supplementaryFund: "teka" }), 2000).employee).toEqual(result.employee);
  });

  test.each([0, 4, 1.5, "2"])("rejects invalid category %s", (supplementaryCategory) => {
    expect(() => calculateEngineerContributions(engineer({ supplementaryCategory }), 2000)).toThrow("Invalid supplementaryCategory");
  });

  test("rejects unsupported years and invalid fund, and yields zero before pay is entered", () => {
    expect(() => calculateEmployeeForGrossMonth(engineer({ taxationYear: 2025 }), 2000)).toThrow("2025");
    expect(() => calculateEmployeeForGrossMonth(engineer({ supplementaryFund: "other" }), 2000)).toThrow("Invalid supplementary fund");
    expect(calculateEmployeeForGrossMonth(engineer(), 0).calculatedState.insurance.year).toBe(0);
  });

  test.each(["month", "year"])("reverse-calculates the engineer net in %s units", (period) => {
    const forward = calculateEmployeeForGrossMonth(engineer(), 2000);
    const target = period === "year" ? forward.finalIncomeYearly : forward.finalIncomeMonthly;
    const solved = solveEngineerGrossForNet(engineer(), target, period);
    expect(solved.grossIncomeMonthly).toBeCloseTo(2000, 1);
    expect(Math.abs(solved.result.finalIncomeYearly - (period === "year" ? target : target * 14))).toBeLessThanOrEqual(0.15);
  });

  test("tracks category/fund changes only while the engineer profile is active", () => {
    const before = getEmployeeCalculationInput(engineer());
    for (const [field, value] of [["supplementaryCategory", 2], ["lumpSumCategory", 3], ["supplementaryFund", "teka"]]) {
      expect(getDirtyFields(getEmployeeCalculationInput(engineer({ [field]: value })), before)).toContain(field);
      expect(getEmployeeCalculationInput(engineer({ insuranceProfile: "general", [field]: value }))).not.toHaveProperty(field);
    }
  });

  test("round-trips the insurance selections and preserves old general links", () => {
    const details = engineer({ supplementaryCategory: 2, lumpSumCategory: 3, supplementaryFund: "teka" });
    expect(parseComparisonInput("employee", serializeComparisonInput("employee", details))).toMatchObject({ insuranceProfile: "engineer", supplementaryCategory: 2, lumpSumCategory: 3, supplementaryFund: "teka" });
    const old = parseComparisonInput("employee", JSON.stringify({ version: 1, entity: "employee", input: { grossIncomeMonthly: 2000 } }));
    expect(old.insuranceProfile).toBe("general");
    const comparison = calculateYearComparison("employee", details, [2025, 2026]);
    expect(comparison.results[0].unsupported).toContain("2025");
    expect(comparison.results[0].metrics).toEqual({});
    expect(comparison.results[1].metrics.insurance.year).toBe(3770.54);
    expect(comparison.differences).toBeNull();
  });

  test("uses engineer selections in offer calculations and shared offers", () => {
    const input = { ...createDefaultOfferComparisonInput(), ...engineer(), employeeOfferAmount: 28000 };
    const offer = calculateEmployeeOffer(input, 28000);
    expect(offer.companyCost).toBe(33540.62);
    expect(offer.employeeInsurance).toBe(3555.62);
    expect(calculateOfferComparison(input).employee.employeeInsurance).toBe(3555.62);
    expect(parseOfferComparisonInput(serializeOfferComparisonInput(input)).insuranceProfile).toBe("engineer");
    expect(calculateOfferComparison({ ...input, taxationYear: 2025 })).toBeNull();
  });

  test("fits the supplied employer cost in budget mode and rejects an infeasible fixed-charge budget", () => {
    const input = { ...createDefaultOfferComparisonInput(), ...engineer(), mode: "budget", companyBudget: 33540.62 };
    const result = calculateOfferComparison(input);
    expect(result.employee.annualGross).toBe(28000);
    expect(result.employee.companyCost).toBe(33540.62);
    expect(calculateOfferComparison({ ...input, companyBudget: 100 })).toBeNull();
  });

  test("exports committed assumptions and the breakdown even after form edits", () => {
    const input = engineer();
    const result = calculateEmployeeForGrossMonth(input, 2000);
    const tableResults = { ...result.calculatedState, taxationYear: 2026, grossIncome: { month: 2000, year: 28000 }, finalIncome: { month: result.finalIncomeMonthly, year: result.finalIncomeYearly }, calculationInput: getComparisonInput("employee", input) };
    const data = buildPersonalCalculationPdfData({ entity: "employee", details: { ...engineer({ supplementaryCategory: 3, supplementaryFund: "teka" }), tableResults }, compare: "2025,2026" });
    expect(data.contributionBreakdown.supplementaryCategory).toBe(1);
    expect(data.assumptions).toContainEqual({ label: "Φορέας επικουρικής", value: "e-ΕΦΚΑ" });
    expect(data.comparison.differences).toBeNull();
    expect(data.sources.some(({ url }) => url.endsWith("egkyklios-42026"))).toBe(true);
    expect(buildEmployeeExplanation(input).sections.find(({ title }) => title === "Ασφαλιστικές και εργοδοτικές εισφορές").rules.join(" ")).toContain("Εφάπαξ");
    expect(buildEmployeeExplanation(engineer({ taxationYear: 2025 })).intro).toContain("2025");
  });

  test("validates category amounts and source references when rules load", () => {
    const invalid = JSON.parse(JSON.stringify(taxRules));
    invalid[2026].employee.insurance.engineer.lumpSumMonthlyAmounts[0] = -1;
    expect(() => validateTaxRules(invalid)).toThrow("lumpSumMonthlyAmounts");
    invalid[2026].employee.insurance.engineer.lumpSumMonthlyAmounts[0] = 31.05;
    invalid[2026].employee.insurance.engineer.components[0].sourceUrls = ["https://invalid.example/"];
    expect(() => validateTaxRules(invalid)).toThrow("sourceUrls");
  });
});
