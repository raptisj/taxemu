import { act, renderHook } from "@testing-library/react";
import { useStore } from "store";
import { useBusinessActions } from "../hooks/useBusinessActions";

const originalConsoleError = console.error;

describe("useBusinessActions partial-year income", () => {
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

  it("preserves monthly income and updates the period total when duration changes", () => {
    useStore.getState().updateBusiness({
      grossIncome: { month: 2000, year: 24000 },
      grossMonthOrYear: "month",
      taxYearDuration: 12,
    });
    const { result } = renderHook(() => useBusinessActions());

    act(() => result.current.onChangeTaxYearDuration(6));

    const business = useStore.getState().userDetails.business;
    expect(business.taxYearDuration).toBe(6);
    expect(business.grossIncome).toEqual({ month: 2000, year: 12000 });
  });

  it("preserves period-total income and updates its monthly equivalent when duration changes", () => {
    useStore.getState().updateBusiness({
      grossIncome: { month: 2000, year: 12000 },
      grossMonthOrYear: "year",
      taxYearDuration: 6,
    });
    const { result } = renderHook(() => useBusinessActions());

    act(() => result.current.onChangeTaxYearDuration(3));

    const business = useStore.getState().userDetails.business;
    expect(business.taxYearDuration).toBe(3);
    expect(business.grossIncome).toEqual({ month: 4000, year: 12000 });
  });
});
