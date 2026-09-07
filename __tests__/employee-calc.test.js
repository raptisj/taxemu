import { calculateEmployeeForGrossMonth } from "../hooks/useCalculateEmployee";

const createEmployeeInput = (overrides = {}) => ({
  salaryMonthCount: 14,
  taxationYear: 2025,
  numberOfChildren: 0,
  ageGroup: "A30P",
  discountOptions: { returnBaseInland: false },
  ...overrides,
});

describe("calculateEmployeeForGrossMonth", () => {
  it("uses the selected year's insurance, brackets, and credit", () => {
    const result = calculateEmployeeForGrossMonth(createEmployeeInput(), 2000);

    expect(result.calculatedState.insurance).toEqual({
      month: 267,
      year: 3738,
    });
    expect(result.calculatedState.initialTax.year).toBe(4294);
    expect(result.calculatedState.taxAfterDiscount).toBe(3762);
    expect(result.finalIncomeMonthly).toBe(1464);
    expect(result.finalIncomeYearly).toBe(20500);
  });

  it("uses the 2026 age and children policy from JSON", () => {
    const result = calculateEmployeeForGrossMonth(
      createEmployeeInput({
        taxationYear: 2026,
        numberOfChildren: 2,
        ageGroup: "A26_30",
      }),
      2000,
    );

    expect(result.calculatedState.initialTax.year).toBe(2738);
    expect(result.calculatedState.taxAfterDiscount).toBe(1863);
    expect(result.finalIncomeMonthly).toBe(1600);
    expect(result.finalIncomeYearly).toBe(22399);
  });

  test.each([12, 14, 14.5])(
    "calculates employer cost and tax wedge for %s salaries",
    (salaryMonthCount) => {
      const result = calculateEmployeeForGrossMonth(
        createEmployeeInput({ salaryMonthCount }),
        2000,
      );
      const { calculatedState } = result;

      expect(calculatedState.employerObligations.month).toBe(436);
      expect(calculatedState.employerObligations.year).toBe(
        436 * salaryMonthCount,
      );
      expect(calculatedState.totalEmployerCost).toEqual({
        month: 2436,
        year: 2436 * salaryMonthCount,
      });
      expect(calculatedState.taxWedge.month).toBe(
        2436 - result.finalIncomeMonthly,
      );
      expect(calculatedState.taxWedge.year).toBe(
        2436 * salaryMonthCount - result.finalIncomeYearly,
      );
      expect(calculatedState.taxWedgePercentage.month).toBeCloseTo(
        (calculatedState.taxWedge.month / 2436) * 100,
        2,
      );
      expect(calculatedState.taxWedgePercentage.year).toBeCloseTo(
        (calculatedState.taxWedge.year / (2436 * salaryMonthCount)) * 100,
        2,
      );
    },
  );
});
