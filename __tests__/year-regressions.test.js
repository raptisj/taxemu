import { calculateEmployeeForGrossMonth } from "../hooks/useCalculateEmployee";
import { calculateBusinessResults } from "../utils/business";

const createEmployeeInput = (taxationYear, overrides = {}) => ({
  salaryMonthCount: 14,
  taxationYear,
  numberOfChildren: 0,
  ageGroup: "A30P",
  discountOptions: { returnBaseInland: false },
  ...overrides,
});

const createBusinessInput = (taxationYear, overrides = {}) => ({
  grossIncome: { month: 2000, year: 24000 },
  taxationYear,
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
  ...overrides,
});

describe("year-by-year calculation regressions", () => {
  // Official contribution references retained with the fixtures:
  // 2023: https://www.e-efka.gov.gr/sites/default/files/2023-02/egk_11_2023.pdf
  // 2024: https://www.e-efka.gov.gr/sites/default/files/2024-02/EGK_5_24.pdf
  // 2025: https://www.e-efka.gov.gr/sites/default/files/2025-02/EGK_3_2025.pdf
  // 2026: https://www.e-efka.gov.gr/el/egkyklioi-kai-genika-eggrapha/egkyklios-62026
  test.each([
    [2021, 282, 4235, 3699, 1454, 20353],
    [2022, 277, 4255, 3720, 1457, 20402],
    [2023, 277, 4255, 3720, 1457, 20402],
    [2024, 277, 4255, 3720, 1457, 20402],
    [2025, 267, 4294, 3762, 1464, 20500],
    [2026, 267, 4009, 3477, 1485, 20785],
  ])(
    "keeps the %s employee result stable",
    (
      taxationYear,
      insuranceMonth,
      initialTaxYear,
      finalTaxYear,
      finalIncomeMonth,
      finalIncomeYear,
    ) => {
      const result = calculateEmployeeForGrossMonth(
        createEmployeeInput(taxationYear),
        2000,
      );

      expect(result.calculatedState.insurance.month).toBe(insuranceMonth);
      expect(result.calculatedState.initialTax.year).toBe(initialTaxYear);
      expect(result.calculatedState.finalTax.year).toBe(finalTaxYear);
      expect(result.finalIncomeMonthly).toBe(finalIncomeMonth);
      expect(result.finalIncomeYearly).toBe(finalIncomeYear);
    },
  );

  test.each([
    [2021, 2640, 3480.8, 17879.2],
    [2022, 2640, 3480.8, 17879.2],
    [2023, 2763, 3446.36, 17790.64],
    [2024, 2858.64, 3419.58, 17721.78],
    [2025, 2935.8, 3397.98, 17666.22],
    [2026, 3129.24, 3126.4, 17744.36],
  ])(
    "keeps the %s business result stable",
    (taxationYear, insuranceYear, taxYear, finalIncomeYear) => {
      const result = calculateBusinessResults({
        userDetails: createBusinessInput(taxationYear),
      });

      expect(result.nextBusinessTable.insurance.year).toBeCloseTo(
        insuranceYear,
        2,
      );
      expect(result.totalTax.year).toBeCloseTo(taxYear, 2);
      expect(result.finalIncome.year).toBeCloseTo(finalIncomeYear, 2);
      expect(result.totalTax.month * 12).toBeCloseTo(result.totalTax.year, 8);
      expect(result.finalIncome.month * 12).toBeCloseTo(
        result.finalIncome.year,
        8,
      );
    },
  );

  it("applies the returning-resident multiplier from the selected year", () => {
    const regular = calculateEmployeeForGrossMonth(
      createEmployeeInput(2025),
      3000,
    );
    const returning = calculateEmployeeForGrossMonth(
      createEmployeeInput(2025, {
        discountOptions: { returnBaseInland: true },
      }),
      3000,
    );

    expect(returning.calculatedState.taxableIncome.year).toBe(
      regular.calculatedState.taxableIncome.year / 2,
    );
    expect(returning.calculatedState.finalTax.year).toBeLessThan(
      regular.calculatedState.finalTax.year,
    );
  });

  it("uses the contribution cap for both employee and employer dues", () => {
    const result = calculateEmployeeForGrossMonth(
      createEmployeeInput(2025),
      10000,
    );

    expect(result.calculatedState.insurance.month).toBe(1012);
    expect(result.calculatedState.employerObligations.month).toBe(1650);
    expect(result.calculatedState.totalEmployerCost.month).toBe(11650);
  });

  it("rejects an employee child count with no configured tax credit", () => {
    expect(() =>
      calculateEmployeeForGrossMonth(
        createEmployeeInput(2025, { numberOfChildren: 5 }),
        2000,
      ),
    ).toThrow("No employee tax credit configured for 5 children in 2025");
  });
});
