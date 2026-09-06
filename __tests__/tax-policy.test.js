import { getBusinessRules, getEmployeeRules } from "../rules";
import { calculateIncomeTaxFromPolicy } from "../utils/taxPolicy";

describe("calculateIncomeTaxFromPolicy", () => {
  it("interprets the progressive policy used through 2025", () => {
    const policy = getBusinessRules(2025).incomeTax;

    expect(
      calculateIncomeTaxFromPolicy({ taxableIncome: 0, policy }).tax,
    ).toBe(0);
    expect(
      calculateIncomeTaxFromPolicy({ taxableIncome: 10000, policy }).tax,
    ).toBe(900);
    expect(
      calculateIncomeTaxFromPolicy({ taxableIncome: 50000, policy }).tax,
    ).toBe(13900);
  });

  it("selects exact employee demographics and caps unsupported larger families", () => {
    const policy = getEmployeeRules(2026).incomeTax;
    const exact = calculateIncomeTaxFromPolicy({
      taxableIncome: 25000,
      policy,
      ageGroup: "A26_30",
      children: 2,
    });
    const capped = calculateIncomeTaxFromPolicy({
      taxableIncome: 25000,
      policy,
      ageGroup: "A30P",
      children: 12,
    });

    expect(exact.tax).toBe(2900);
    expect(exact.brackets[2].rate).toBe(0.22);
    expect(capped.tax).toBe(800);
    expect(capped.brackets[1].rate).toBe(0.16);
  });

  it("rejects invalid employee demographic context", () => {
    const policy = getEmployeeRules(2026).incomeTax;

    expect(() =>
      calculateIncomeTaxFromPolicy({
        taxableIncome: 1000,
        policy,
        ageGroup: "",
      }),
    ).toThrow("invalid ageGroup");
    expect(() =>
      calculateIncomeTaxFromPolicy({
        taxableIncome: 1000,
        policy,
        ageGroup: "UNKNOWN",
      }),
    ).toThrow("invalid ageGroup");
    expect(() =>
      calculateIncomeTaxFromPolicy({
        taxableIncome: 1000,
        policy,
        ageGroup: "A30P",
        children: 1.5,
      }),
    ).toThrow("children must be a non-negative integer");
    expect(() =>
      calculateIncomeTaxFromPolicy({
        taxableIncome: -1,
        policy,
        ageGroup: "A30P",
      }),
    ).toThrow("taxableIncome must be non-negative");
  });

  it("rejects a missing intermediate employee child table", () => {
    const policy = {
      kind: "progressiveByAgeAndChildren",
      bracketsByAgeAndChildren: {
        adult: {
          0: [{ upTo: null, rate: 0.1 }],
          2: [{ upTo: null, rate: 0.05 }],
        },
      },
    };

    expect(() =>
      calculateIncomeTaxFromPolicy({
        taxableIncome: 1000,
        policy,
        ageGroup: "adult",
        children: 1,
      }),
    ).toThrow("No tax brackets configured for 1 children");
  });

  test.each([
    ["A30P", 0, 25000, 4200, 0.2, 0.26],
    ["A30P", 2, 25000, 3600, 0.16, 0.22],
    ["A30P", 4, 25000, 900, 0, 0.18],
    ["A30P", 5, 25000, 800, 0, 0.16],
    ["A30P", 20, 25000, 0, 0, 0],
    ["U25", 0, 20000, 0, 0, 0.26],
    ["A26_30", 0, 20000, 1800, 0.09, 0.26],
  ])(
    "applies 2026 business policy for %s, %s children and %s income",
    (ageGroup, children, taxableIncome, tax, secondRate, thirdRate) => {
      const result = calculateIncomeTaxFromPolicy({
        taxableIncome,
        policy: getBusinessRules(2026).incomeTax,
        ageGroup,
        children,
      });

      expect(result.tax).toBe(tax);
      expect(result.brackets[1].rate).toBe(secondRate);
      expect(result.brackets[2].rate).toBe(thirdRate);
    },
  );

  it("does not apply configured business age relief above its income cap", () => {
    const result = calculateIncomeTaxFromPolicy({
      taxableIncome: 20001,
      policy: getBusinessRules(2026).incomeTax,
      ageGroup: "U25",
      children: 0,
    });

    expect(result.tax).toBe(2900.26);
    expect(result.brackets[0].rate).toBe(0.09);
    expect(result.brackets[1].rate).toBe(0.2);
  });

  it("rejects unknown policy kinds", () => {
    expect(() =>
      calculateIncomeTaxFromPolicy({
        taxableIncome: 1000,
        policy: { kind: "unknown" },
      }),
    ).toThrow("Unknown income-tax policy: unknown");
  });
});
