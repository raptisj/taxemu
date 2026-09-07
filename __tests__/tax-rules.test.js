import taxRulesByYear from "../rules/taxRules.json";
import {
  getBusinessRules,
  getEmployeeRules,
  getTaxRules,
  latestTaxYear,
  supportedTaxYears,
  validateTaxRules,
} from "../rules";
import { calculateIncomeTaxFromPolicy } from "../utils/taxPolicy";

describe("annual tax rules", () => {
  it("loads every supported year as a complete, valid rules object", () => {
    expect(validateTaxRules()).toBe(true);
    expect(supportedTaxYears).toEqual([2026, 2025, 2024, 2023, 2022, 2021]);
    expect(latestTaxYear).toBe(2026);

    supportedTaxYears.forEach((year) => {
      const rules = getTaxRules(year);
      expect(rules.year).toBe(year);
      expect(rules.sources.length).toBeGreaterThan(0);
      rules.sources.forEach((source) => {
        expect(source.name).toEqual(expect.any(String));
        expect(source.url).toMatch(/^https:\/\//);
      });
      expect(rules.employee.insurance).toBeDefined();
      expect(rules.employee.incomeTax).toBeDefined();
      expect(rules.business.insurance.monthlyAmounts.length).toBeGreaterThan(0);
      expect(rules.business.incomeTax).toBeDefined();
      expect(rules.ui.employee).toBeDefined();
      expect(rules.ui.business).toBeDefined();
    });
  });

  it("contains the corrected 2025 and 2026 contribution values", () => {
    expect(getEmployeeRules(2025).insurance).toEqual({
      employeeRate: 0.1337,
      employerRate: 0.2179,
      monthlyContributionCap: 7572.62,
    });
    expect(getEmployeeRules(2026).insurance).toEqual({
      employeeRate: 0.1333,
      employerRate: 0.2179,
      monthlyContributionCap: 7761.94,
    });
    expect(getBusinessRules(2026).insurance.monthlyAmounts).toEqual([
      150.46, 250.77, 300.93, 360.63, 433.47, 519.45, 675.87,
    ]);
  });

  it("uses the completed 2026 employee age and children tables", () => {
    const policy = getEmployeeRules(2026).incomeTax;
    const result = calculateIncomeTaxFromPolicy({
      taxableIncome: 25000,
      policy,
      ageGroup: "A26_30",
      children: 2,
    });

    expect(result.tax).toBe(2900);
    expect(result.brackets[1].rate).toBe(0.09);
    expect(result.brackets[2].rate).toBe(0.22);
  });

  it("rejects malformed yearly data before calculations run", () => {
    const malformedRules = JSON.parse(JSON.stringify(taxRulesByYear));
    malformedRules[2026].employee.insurance.employeeRate = 1.1;

    expect(() => validateTaxRules(malformedRules)).toThrow(
      "2026.employee.insurance.employeeRate",
    );
  });

  it("rejects a year without traceable official sources", () => {
    const malformedRules = JSON.parse(JSON.stringify(taxRulesByYear));
    malformedRules[2026].sources = [];

    expect(() => validateTaxRules(malformedRules)).toThrow("2026.sources");
  });

  it("rejects unsupported years with a useful error", () => {
    expect(() => getTaxRules(2027)).toThrow("Unsupported taxation year: 2027");
  });
});
