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
});
