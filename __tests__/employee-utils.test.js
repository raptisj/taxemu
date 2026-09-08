import {
  applyReturnBaseInland,
  assertFiniteNonNegative,
  calcProgressiveTax,
  calculateChildrenDiscount,
  calculateEmployeeScalesTax,
  calculateIncomeTax,
  ceilMoney,
  getBrackets,
  omitDiscountIfNegative,
  roundMoney,
  toFixedNumber,
} from "../utils/employee";

const brackets = [
  { upTo: 10000, rate: 0.09 },
  { upTo: 20000, rate: 0.22 },
  { upTo: null, rate: 0.44 },
];

describe("employee calculation utilities", () => {
  test.each([0, 1, 123.45])(
    "accepts finite non-negative input %s",
    (value) => {
      expect(() => assertFiniteNonNegative(value, "income")).not.toThrow();
    },
  );

  test.each([-1, NaN, Infinity, -Infinity])(
    "rejects invalid numeric input %s",
    (value) => {
      expect(() => assertFiniteNonNegative(value, "income")).toThrow(
        "income must be a finite non-negative number",
      );
    },
  );

  it("selects exact, capped, and default demographic brackets", () => {
    const exact = [{ upTo: null, rate: 0.1 }];
    const capped = [{ upTo: null, rate: 0.2 }];
    const fallback = [{ upTo: null, rate: 0.3 }];
    const scales = {
      exact: { 2: exact, 5: capped, default: fallback },
      fallback: { default: fallback },
    };

    expect(getBrackets(scales, "exact", 2)).toBe(exact);
    expect(getBrackets(scales, "exact", 8)).toBe(capped);
    expect(getBrackets(scales, "fallback", 1)).toBe(fallback);
  });

  it("rejects unknown age groups and missing child scales", () => {
    expect(() => getBrackets({}, "missing", 0)).toThrow(
      "Unknown ageGroup: missing",
    );
    expect(() => getBrackets({ adult: { 0: brackets } }, "adult", 1)).toThrow(
      "No scale found for ageGroup=adult, children=1",
    );
  });

  test.each([
    [0, 0],
    [10000, 900],
    [15000, 2000],
    [20000, 3100],
    [25000, 5300],
  ])("calculates progressive tax for income %s", (income, expected) => {
    expect(calcProgressiveTax(income, brackets)).toBeCloseTo(expected, 8);
  });

  it("validates rates and increasing bracket caps", () => {
    expect(() =>
      calcProgressiveTax(1000, [{ upTo: null, rate: -0.1 }]),
    ).toThrow("Invalid rate: -0.1");
    expect(() =>
      calcProgressiveTax(15000, [
        { upTo: 10000, rate: 0.1 },
        { upTo: 9000, rate: 0.2 },
      ]),
    ).toThrow("Invalid bracket cap: 9000");
  });

  it("calculates and rounds income tax from a demographic scale", () => {
    const result = calculateIncomeTax({
      taxableIncome: 12345.67,
      ageGroup: "adult",
      children: 0,
      scalesByAgeGroup: { adult: { 0: brackets } },
    });

    expect(result).toEqual({
      taxableIncome: 12345.67,
      ageGroup: "adult",
      children: 0,
      grossTax: 1416.05,
    });
  });

  test.each([-1, 1.5])("rejects invalid child count %s", (children) => {
    expect(() =>
      calculateIncomeTax({
        taxableIncome: 1000,
        ageGroup: "adult",
        children,
        scalesByAgeGroup: { adult: { 0: brackets } },
      }),
    ).toThrow("children must be a non-negative integer");
  });

  it("calculates fixed employee scales at and above every threshold", () => {
    const currentScales = [0.1, 0.2, 0.3, 0.4, 0.5].map((multiplier) => ({
      multiplier,
    }));

    expect(
      calculateEmployeeScalesTax({ currentScales, sumToBeTaxed: 0 }),
    ).toBe(0);
    expect(
      calculateEmployeeScalesTax({ currentScales, sumToBeTaxed: 40000 }),
    ).toBe(10000);
    expect(
      calculateEmployeeScalesTax({ currentScales, sumToBeTaxed: 45000 }),
    ).toBe(12500);
    expect(
      calculateEmployeeScalesTax({
        currentScales,
        sumToBeTaxed: 12500,
        threshold: 5000,
      }),
    ).toBe(2250);
  });

  it("reduces the child credit only above its configured threshold", () => {
    expect(
      calculateChildrenDiscount({ amount: 12000, childDiscountAmount: 900 }),
    ).toEqual({ discount: 900 });
    expect(
      calculateChildrenDiscount({ amount: 17000, childDiscountAmount: 900 }),
    ).toEqual({ discount: 800 });
    expect(
      calculateChildrenDiscount({
        amount: 12000,
        childDiscountAmount: 900,
        reductionStartsAbove: 10000,
        reductionRate: 0.05,
      }),
    ).toEqual({ discount: 800 });
    expect(
      calculateChildrenDiscount({ amount: 70000, childDiscountAmount: 777 }),
    ).toEqual({ discount: 0 });
  });

  it("applies returning-resident and rounding policies", () => {
    expect(applyReturnBaseInland(20000, false)).toBe(20000);
    expect(applyReturnBaseInland(20000, true)).toBe(10000);
    expect(applyReturnBaseInland(20000, true, 0.25)).toBe(5000);
    expect(omitDiscountIfNegative(1000.1, -1)).toBe(1001);
    expect(omitDiscountIfNegative(1000.1, 100.1)).toBe(900);
    expect(roundMoney(10.5)).toBe(11);
    expect(ceilMoney(10.01)).toBe(11);
    expect(toFixedNumber(10.456, 2)).toBe(10.46);
  });
});
