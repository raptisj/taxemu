import {
  buildBusinessExplanation,
  buildEmployeeExplanation,
} from "../features/wiki/explanations";

const employeeDetails = (taxationYear) => ({
  taxationYear,
  grossIncomeMonthly: 2000,
  salaryMonthCount: 14,
  numberOfChildren: 0,
  ageGroup: "A30P",
  discountOptions: { returnBaseInland: false },
});

const businessDetails = (taxationYear) => ({
  taxationYear,
  grossIncome: { month: 3000, year: 36000 },
  taxYearDuration: 12,
  grossMonthOrYear: "year",
  businessExpensesMonthOrYear: "year",
  insuranceScaleSelection: 1,
  discountOptions: {
    firstScaleDiscount: false,
    prePaidTaxDiscount: false,
    specialInsuranceScale: false,
  },
  prePaidNextYearTax: true,
  withholdingTax: false,
  extraBusinessExpenses: 3000,
  previousYearTaxInAdvance: 0,
  numberOfChildren: 0,
  ageGroup: "A30P",
});

describe("dynamic calculation explanations", () => {
  it("uses the selected employee year's rates and current form values", () => {
    const explanation2025 = buildEmployeeExplanation(employeeDetails(2025));
    const explanation2026 = buildEmployeeExplanation(employeeDetails(2026));
    const brackets2025 = explanation2025.sections.find(
      ({ title }) => title === "Κλίμακα φόρου εισοδήματος",
    );
    const brackets2026 = explanation2026.sections.find(
      ({ title }) => title === "Κλίμακα φόρου εισοδήματος",
    );

    expect(explanation2025.intro).toContain("2025");
    expect(explanation2026.intro).toContain("2026");
    expect(brackets2025.rules).toContain("10.000 € – 20.000 €: 22%");
    expect(brackets2026.rules).toContain("10.000 € – 20.000 €: 20%");
    expect(brackets2026.example.length).toBeGreaterThan(0);
    expect(
      explanation2026.sections
        .flatMap(({ items = [] }) => items)
        .some((item) => item.includes("Συνολικό ετήσιο εργοδοτικό κόστος")),
    ).toBe(true);
  });

  it("uses the business rules and exposes official sources", () => {
    const explanation = buildBusinessExplanation(businessDetails(2026));
    const insurance = explanation.sections.find(
      ({ title }) => title === "Ασφαλιστική κατηγορία",
    );

    expect(insurance.description).toContain("250,77 €");
    expect(explanation.hasCalculation).toBe(true);
    expect(explanation.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: expect.stringContaining("e-EFKA Circular 6/2026"),
          url: expect.stringMatching(/^https:\/\//),
        }),
      ]),
    );
  });

  it("still explains the selected rules before an amount is entered", () => {
    const explanation = buildEmployeeExplanation({
      ...employeeDetails(2026),
      grossIncomeMonthly: 0,
    });

    expect(explanation.hasCalculation).toBe(false);
    expect(explanation.sections[1].description).toContain("13,33%");
    expect(explanation.sources.length).toBeGreaterThan(0);
  });
});
