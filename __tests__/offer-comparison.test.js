import {
  COMPARISON_PERSPECTIVES,
  OFFER_TYPES,
  OFFER_PERIODS,
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

  test("removes the prepayment when withholding fully covers it", () => {
    const result = calculateFreelancerOffer(
      input({ prePaidNextYearTax: true, withholdingTax: true }),
      30000,
    );

    expect(result.withholding).toBe(6000);
    expect(result.taxPrepayment).toBe(0);
    expect(result.cashAfterTaxSettlements).toBeCloseTo(result.annualNet, 2);
  });

  test("a salary offer compares the same annual amount rather than matching net", () => {
    const result = calculateOfferComparison(input({ employeeOfferAmount: 28000 }));
    expect(result.basis).toBe("same-annual-offer");
    expect(result.employee.source).toBe("provided");
    expect(result.freelancer.source).toBe("assumed");
    expect(result.employee.annualGross).toBe(28000);
    expect(result.freelancer.annualRevenue).toBe(28000);
    expect(result.employee.annualNet).toBe(20785);
    expect(result.freelancer.annualNet).toBeCloseTo(18928.36, 2);
    expect(result.difference.annualNet).toBeLessThan(0);
    expect(result.employee.monthlyNet).toBe(result.employee.annualNet / 12);
    expect(result.freelancer.monthlyNet).toBe(result.freelancer.annualNet / 12);
    expect(result.benchmarks.requiredFreelancerRevenue).toBe(30509);
    expect(result.benchmarks.freelancerAtEmployeeCost.annualNet).toBeCloseTo(23445.32, 2);
  });

  test("a monthly freelancer offer annualizes leave before assuming employee gross", () => {
    const result = calculateOfferComparison(input({
      offerType: OFFER_TYPES.FREELANCER,
      freelancerOfferAmount: 3000,
      unpaidLeaveDays: 21.75,
    }));
    expect(result.freelancer.source).toBe("provided");
    expect(result.employee.source).toBe("assumed");
    expect(result.freelancer.annualRevenue).toBe(33000);
    expect(result.employee.annualGross).toBe(33000);
    expect(result.freelancer.invoicePerBillableMonth).toBe(3000);
    expect(result.employee.annualNet).not.toBe(result.freelancer.annualNet);
  });

  test("a monthly salary offer includes all 14 payments", () => {
    const result = calculateOfferComparison(input({
      employeeOfferAmount: 2000,
      employeeOfferPeriod: OFFER_PERIODS.MONTH,
    }));
    expect(result.employee.annualGross).toBe(28000);
    expect(result.freelancer.annualRevenue).toBe(28000);
    expect(result.employee.netPerSalary).not.toBe(result.employee.monthlyNet);
  });

  test("annual freelancer revenue already includes the leave adjustment", () => {
    const result = calculateOfferComparison(input({
      offerType: OFFER_TYPES.FREELANCER,
      freelancerOfferAmount: 28000,
      freelancerOfferPeriod: OFFER_PERIODS.YEAR,
      unpaidLeaveDays: 21.75,
    }));
    expect(result.freelancer.annualRevenue).toBe(28000);
    expect(result.freelancer.invoicePerBillableMonth).toBe(28000 / 11);
  });

  test("company perspective compares the same cost and can reverse the conclusion", () => {
    const result = calculateOfferComparison(input({
      perspective: COMPARISON_PERSPECTIVES.COMPANY,
      companyBudget: 34104,
    }));
    expect(result.basis).toBe("same-company-cost");
    expect(result.employee.companyCost).toBeCloseTo(34104, 0);
    expect(result.freelancer.companyCost).toBe(34104);
    expect(result.employee.annualNet).toBe(20785);
    expect(result.freelancer.annualNet).toBeCloseTo(23445.32, 2);
    expect(result.difference.annualNet).toBeGreaterThan(0);
  });

  test("a second actual offer replaces the assumption without changing either offer", () => {
    const details = input({
      hasSecondOffer: true,
      employeeOfferAmount: 28000,
      freelancerOfferAmount: 3500,
      leaveIsBillable: true,
    });
    const original = { ...details };
    const result = calculateOfferComparison(details);
    expect(details).toEqual(original);
    expect(result.basis).toBe("actual-offers");
    expect(result.employee.annualGross).toBe(28000);
    expect(result.freelancer.annualRevenue).toBe(42000);
    expect(result.employee.source).toBe("provided");
    expect(result.freelancer.source).toBe("provided");
    expect(result.difference.annualNet).toBeGreaterThan(0);
  });

  test.each([
    {},
    { employeeOfferAmount: 28000, hasSecondOffer: true },
    { perspective: COMPARISON_PERSPECTIVES.COMPANY },
    { employeeOfferAmount: 28000, billableMonths: 0 },
    { employeeOfferAmount: 28000, billableMonths: 11, unpaidLeaveDays: 260 },
    { employeeOfferAmount: 28000, salaryMonthCount: 0 },
  ])("incomplete or unbillable inputs have no comparison: %o", (overrides) => {
    expect(calculateOfferComparison(input(overrides))).toBeNull();
  });

  test("a freelancer loss is shown without inventing a positive net-equivalent salary", () => {
    const result = calculateOfferComparison(input({
      offerType: OFFER_TYPES.FREELANCER,
      freelancerOfferAmount: 1000,
      freelancerOfferPeriod: OFFER_PERIODS.YEAR,
    }));
    expect(result.freelancer.annualNet).toBeLessThan(0);
    expect(result.benchmarks.requiredEmployeeGross).toBeNull();
  });

  test("tax credits and advances change cash rather than recurring net", () => {
    const first = calculateFreelancerOffer(input(), 30000);
    const credited = calculateFreelancerOffer(input({ previousYearTaxInAdvance: 1000 }), 30000);
    expect(credited.annualNet).toBe(first.annualNet);
    expect(credited.cashAfterTaxSettlements).toBe(first.cashAfterTaxSettlements + 1000);
  });

  test("round-trips shareable inputs", () => {
    const original = input({
      hasSecondOffer: true,
      employeeOfferAmount: 32000,
      freelancerOfferAmount: 3500,
      leaveIsBillable: true,
    });
    expect(
      parseOfferComparisonInput(serializeOfferComparisonInput(original)),
    ).toEqual(original);
    expect(parseOfferComparisonInput("not-json")).toBeNull();
  });

  test.each([
    ["employee", COMPARISON_PERSPECTIVES.PERSONAL, OFFER_TYPES.EMPLOYEE, false],
    ["freelancer", COMPARISON_PERSPECTIVES.PERSONAL, OFFER_TYPES.FREELANCER, false],
    ["both", COMPARISON_PERSPECTIVES.PERSONAL, OFFER_TYPES.EMPLOYEE, true],
    ["budget", COMPARISON_PERSPECTIVES.COMPANY, OFFER_TYPES.EMPLOYEE, false],
  ])("migrates old %s links to the new perspective with their original amounts", (mode, perspective, offerType, hasSecondOffer) => {
    const parsed = parseOfferComparisonInput(JSON.stringify({
      version: 1,
      input: { mode, employeeOfferAmount: 28000, freelancerOfferAmount: 3500, companyBudget: 34104 },
    }));
    expect(parsed).toMatchObject({ perspective, offerType, hasSecondOffer, employeeOfferAmount: 28000, freelancerOfferAmount: 3500, companyBudget: 34104 });
    expect(calculateOfferComparison(parsed)).not.toBeNull();
  });

  test.each([
    { perspective: "unknown" },
    { offerType: "unknown" },
    { hasSecondOffer: "false" },
    { salaryMonthCount: 0 },
    { taxationYear: 9999 },
    { employeeOfferAmount: -1 },
    { employeeOfferAmount: "28000" },
    { businessAge: 0 },
    { ageGroup: "unknown" },
    { numberOfChildren: 0.5 },
    { insuranceScaleSelection: 99 },
    { billableMonths: 13 },
    { freelancerOfferPeriod: "week" },
  ])("rejects invalid shared inputs: %o", (overrides) => {
    expect(parseOfferComparisonInput(JSON.stringify({ version: 2, input: overrides }))).toBeNull();
  });

});
