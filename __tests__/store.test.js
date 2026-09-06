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
  });

  it("merges quick-calculation values", () => {
    useStore.getState().updateBusinessQuickCalc({
      grossIncomeYearly: 36000,
    });

    expect(
      useStore.getState().userDetails.business.calculateRealGrossWidget,
    ).toEqual({
      grossIncomeYearly: 36000,
      currentAdditionalValueTax: 0.24,
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
  });
});
