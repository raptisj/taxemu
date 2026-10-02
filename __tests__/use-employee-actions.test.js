import { act, renderHook } from "@testing-library/react";
import { useStore } from "store";
import { useEmployeeActions } from "../hooks/useEmployeeActions";

const originalConsoleError = console.error;

describe("useEmployeeActions child-count limits", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation((message, ...args) => {
      if (!String(message).includes("ReactDOMTestUtils.act")) {
        originalConsoleError(message, ...args);
      }
    });
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  afterEach(() => {
    act(() => useStore.getState().removeUserDetails());
  });

  it("preserves an uncapped 2026 child count and clamps it for older years", () => {
    useStore.getState().updateEmployee({
      taxationYear: 2026,
      numberOfChildren: 6,
    });
    const { result } = renderHook(() => useEmployeeActions());

    act(() => result.current.onSelectTaxationYear({ target: { value: 2026 } }));
    expect(useStore.getState().userDetails.employee.numberOfChildren).toBe(6);

    act(() => result.current.onSelectTaxationYear({ target: { value: 2025 } }));
    expect(useStore.getState().userDetails.employee.numberOfChildren).toBe(4);
  });

  it("preserves cents and the annual gross input for an engineer", () => {
    useStore.getState().updateEmployee({ insuranceProfile: "engineer", grossMonthOrYear: "year" });
    const { result } = renderHook(() => useEmployeeActions());
    act(() => result.current.onChangeGrossIncome("28000.14", 14));
    const details = useStore.getState().userDetails.employee;
    expect(details.grossIncomeYearly).toBe(28000.14);
    expect(details.grossIncomeMonthly).toBeCloseTo(2000.01, 6);
    act(() => result.current.onChangeInsuranceOptions({ supplementaryCategory: 3 }));
    expect(useStore.getState().userDetails.employee.supplementaryCategory).toBe(3);
  });
});
