import {
  OFFER_COMPARISON_MODES,
  calculateFreelancerOffer,
  calculateOfferComparison,
  createDefaultOfferComparisonInput,
  getEffectiveBillableMonths,
  parseOfferComparisonInput,
  serializeOfferComparisonInput,
} from "../utils/offerComparison";

const input = (overrides = {}) => ({
  ...createDefaultOfferComparisonInput(),
  taxationYear: 2026,
  ...overrides,
});

describe("offer comparison", () => {
  test("converts unpaid leave to a reduced effective billing period", () => {
    expect(
      getEffectiveBillableMonths(
        input({ billableMonths: 12, unpaidLeaveDays: 21.75 }),
      ),
    ).toBe(11);
    expect(
      getEffectiveBillableMonths(
        input({
          billableMonths: 12,
          unpaidLeaveDays: 21.75,
          leaveIsBillable: true,
        }),
      ),
    ).toBe(12);
  });

  test("distinguishes economic net from cash after tax prepayment", () => {
    const result = calculateFreelancerOffer(
      input({ prePaidNextYearTax: true }),
      30000,
    );
    expect(result.taxPrepayment).toBeGreaterThan(0);
    expect(result.annualNet - result.cashAfterTaxSettlements).toBeCloseTo(
      result.taxPrepayment,
      2,
    );
  });

  test("an employee-only offer generates a net-equivalent freelancer offer", () => {
    const result = calculateOfferComparison(
      input({
        mode: OFFER_COMPARISON_MODES.EMPLOYEE,
        employeeOfferAmount: 28000,
      }),
    );
    expect(result.employee.source).toBe("provided");
    expect(result.freelancer.source).toBe("generated-net-match");
    expect(result.freelancer.annualNet).toBeCloseTo(
      result.employee.annualNet,
      0,
    );
    expect(result.benchmarks.requiredFreelancerInvoice).toBeGreaterThan(0);
  });

  test("a freelancer-only offer generates a net-equivalent employee offer", () => {
    const result = calculateOfferComparison(
      input({
        mode: OFFER_COMPARISON_MODES.FREELANCER,
        freelancerOfferAmount: 3000,
      }),
    );
    expect(result.freelancer.source).toBe("provided");
    expect(result.employee.source).toBe("generated-net-match");
    expect(result.employee.annualNet).toBeCloseTo(
      result.freelancer.annualNet,
      0,
    );
  });

  test("the budget mode keeps both arrangements at the same company cost", () => {
    const result = calculateOfferComparison(
      input({
        mode: OFFER_COMPARISON_MODES.BUDGET,
        companyBudget: 50000,
      }),
    );
    expect(result.employee.companyCost).toBeCloseTo(50000, 0);
    expect(result.freelancer.companyCost).toBe(50000);
  });

  test("round-trips shareable inputs", () => {
    const original = input({
      mode: OFFER_COMPARISON_MODES.BOTH,
      employeeOfferAmount: 32000,
      freelancerOfferAmount: 3500,
      leaveIsBillable: true,
    });
    expect(
      parseOfferComparisonInput(serializeOfferComparisonInput(original)),
    ).toEqual(original);
    expect(parseOfferComparisonInput("not-json")).toBeNull();
  });
});
