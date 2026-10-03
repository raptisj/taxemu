import { useStore } from "../store";

describe("calculator store", () => {
  afterEach(() => {
    useStore.getState().removeUserDetails();
  });

  it("updates top-level, employee, and business state without losing siblings", () => {
    const actions = useStore.getState();
    actions.update({ calculatorType: "business" });
    actions.updateEmployee({ grossIncomeMonthly: 1500 });
    actions.updateBusiness({ taxYearDuration: 6 });

    const state = useStore.getState().userDetails;
    expect(state.calculatorType).toBe("business");
    expect(state.employee.grossIncomeMonthly).toBe(1500);
    expect(state.employee.taxationYear).toBe(2026);
    expect(state.business.taxYearDuration).toBe(6);
    expect(state.business.taxationYear).toBe(2026);
    expect(state.business.minimumPresumedIncome).toEqual(
      expect.objectContaining({
        businessAge: 1,
        hasAdjustments: false,
      }),
    );
  });

  it("merges quick-calculation values", () => {
    useStore.getState().updateBusinessQuickCalc({
      grossIncomeMonthly: 3000,
    });

    expect(
      useStore.getState().userDetails.business.calculateRealGrossWidget,
    ).toEqual({
      grossIncomeMonthly: 3000,
      currentAdditionalValueTax: 0.24,
      applyIslandVatReduction: false,
      currentWithholdingTax: 0.2,
    });
  });

  it("sets calculator validation errors independently", () => {
    useStore.getState().setHasError({ entity: "employee", value: true });

    const { employee, business } = useStore.getState().userDetails;
    expect(employee.hasError).toBe(true);
    expect(business.hasError).toBe(false);
  });

  it("resets all calculator data", () => {
    useStore.getState().updateEmployee({ grossIncomeMonthly: 1500 });
    useStore.getState().updateBusiness({ taxYearDuration: 3 });
    useStore.getState().removeUserDetails();

    const { employee, business } = useStore.getState().userDetails;
    expect(employee.grossIncomeMonthly).toBe(0);
    expect(business.taxYearDuration).toBe(12);
    expect(business.minimumPresumedIncome.businessAge).toBe(1);
    expect(business.minimumPresumedIncome.hasAdjustments).toBe(false);
  });

  it("switches calculators with fresh inputs and results while preserving unrelated state", () => {
    const defaults = useStore.getState().userDetails;
    const deferredPrompt = { prompt: jest.fn() };
    useStore.getState().update({ canInstallPWA: true, deferredPrompt });
    useStore.getState().updateEmployee({
      grossIncomeMonthly: 2000,
      hasError: true,
      contributionBreakdown: { employee: { year: 3000 } },
      tableResults: { finalIncome: { year: 22000 }, calculationInput: { grossIncomeMonthly: 2000 } },
    });
    useStore.getState().updateBusiness({
      extraBusinessExpenses: 500,
      query: "previous calculation",
      minimumPresumedIncome: { businessAge: 8, annualPayrollCost: 12000 },
    });
    useStore.getState().updateBusinessQuickCalc({ grossIncomeMonthly: 3500 });

    useStore.getState().switchCalculator("business");

    const state = useStore.getState().userDetails;
    expect(state.calculatorType).toBe("business");
    expect(state.employee).toEqual(defaults.employee);
    expect(state.business).toEqual(defaults.business);
    expect(state.employee.tableResults).not.toBe(defaults.employee.tableResults);
    expect(state.business.minimumPresumedIncome).not.toBe(defaults.business.minimumPresumedIncome);
    expect(state.canInstallPWA).toBe(true);
    expect(state.deferredPrompt).toBe(deferredPrompt);
  });
});
