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
});
