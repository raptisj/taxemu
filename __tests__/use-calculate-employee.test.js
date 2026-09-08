import { act, renderHook } from "@testing-library/react";
import { useStore } from "store";
import { useCalculateEmployee } from "../hooks/useCalculateEmployee";

const mockToast = jest.fn();
const originalConsoleError = console.error;

jest.mock("@chakra-ui/react", () => ({
  useToast: () => mockToast,
}));

jest.mock("store", () => ({
  useStore: jest.fn(),
}));

const createEmployee = (overrides = {}) => ({
  activeInput: "gross",
  ageGroup: "A30P",
  discountOptions: { returnBaseInland: false },
  finalIncomeMonthly: 0,
  finalIncomeYearly: 0,
  finalMonthOrYear: "year",
  grossIncomeMonthly: 2000,
  grossIncomeYearly: 28000,
  grossMonthOrYear: "year",
  hasError: false,
  numberOfChildren: 0,
  salaryMonthCount: 14,
  taxationYear: 2025,
  ...overrides,
});

describe("useCalculateEmployee", () => {
  let commitEmployeeCalculation;
  let employee;
  let setHasError;

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

  beforeEach(() => {
    jest.clearAllMocks();
    commitEmployeeCalculation = jest.fn();
    setHasError = jest.fn();
    employee = createEmployee();
    useStore.mockImplementation((selector) =>
      selector({
        userDetails: { employee },
        commitEmployeeCalculation,
        setHasError,
      }),
    );
  });

  it("exposes error state and reports missing gross inputs", () => {
    employee = createEmployee({ grossIncomeMonthly: 0, hasError: true });
    const { result } = renderHook(() => useCalculateEmployee());

    act(() => result.current.centralCalculation());

    expect(result.current.hasError).toBe(true);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Λείπουν απαιτούμενα πεδία!",
      position: "top",
      isClosable: true,
      status: "warning",
    });
    expect(setHasError).toHaveBeenCalledWith({
      entity: "employee",
      value: true,
    });
    expect(commitEmployeeCalculation).not.toHaveBeenCalled();
  });

  it("calculates and commits a gross-income result", () => {
    const { result } = renderHook(() => useCalculateEmployee());

    act(() => result.current.centralCalculation());

    expect(commitEmployeeCalculation).toHaveBeenCalledTimes(1);
    expect(commitEmployeeCalculation).toHaveBeenCalledWith(
      expect.objectContaining({
        newState: expect.objectContaining({
          grossIncomeMonthly: 2000,
          grossIncomeYearly: 28000,
          finalIncomeMonthly: 1464,
          finalIncomeYearly: 20500,
          finalMonthOrYear: "year",
          grossMonthOrYear: "year",
        }),
        tableResults: expect.objectContaining({
          grossIncome: { month: 2000, year: 28000 },
          finalIncome: { month: 1464, year: 20500 },
          finalTax: { month: expect.any(Number), year: 3762 },
          childrenDiscountAmount: {
            month: expect.any(Number),
            year: expect.any(Number),
          },
          salaryMonthCount: 14,
          numberOfChildren: 0,
          discountOptions: { returnBaseInland: false },
          calculationInput: expect.objectContaining({
            grossIncomeMonthly: 2000,
            grossIncomeYearly: 28000,
          }),
        }),
      }),
    );
  });

  it("reports missing reverse-calculation inputs", () => {
    employee = createEmployee({
      activeInput: "final",
      finalIncomeMonthly: 1000,
      finalIncomeYearly: 0,
    });
    const { result } = renderHook(() => useCalculateEmployee());

    act(() => result.current.reverseCentralCalculation());

    expect(setHasError).toHaveBeenCalledWith({
      entity: "employee",
      value: true,
    });
    expect(commitEmployeeCalculation).not.toHaveBeenCalled();
  });

  it("finds and commits the gross income for a requested final income", () => {
    employee = createEmployee({
      activeInput: "final",
      finalIncomeMonthly: 1464,
      finalIncomeYearly: 20500,
      finalMonthOrYear: "month",
      grossIncomeMonthly: 0,
      grossIncomeYearly: 0,
      grossMonthOrYear: "year",
    });
    const { result } = renderHook(() => useCalculateEmployee());

    act(() => result.current.reverseCentralCalculation());

    expect(commitEmployeeCalculation).toHaveBeenCalledWith(
      expect.objectContaining({
        newState: expect.objectContaining({
          grossIncomeMonthly: 2001,
          grossIncomeYearly: 28014,
          finalIncomeMonthly: 1464,
          finalIncomeYearly: 20500,
          finalMonthOrYear: "month",
          grossMonthOrYear: "month",
        }),
        tableResults: expect.objectContaining({
          grossIncome: { month: 2001, year: 28014 },
          finalIncome: { month: 1464, year: 20500 },
        }),
      }),
    );
  });

  it("commits a zero gross fallback when the reverse search range is empty", () => {
    employee = createEmployee({
      activeInput: "final",
      finalIncomeMonthly: -1,
      finalIncomeYearly: -14,
      grossIncomeMonthly: 0,
      grossIncomeYearly: 0,
    });
    const { result } = renderHook(() => useCalculateEmployee());

    act(() => result.current.reverseCentralCalculation());

    expect(commitEmployeeCalculation).toHaveBeenCalledWith(
      expect.objectContaining({
        newState: expect.objectContaining({
          grossIncomeMonthly: 0,
          grossIncomeYearly: 0,
          finalIncomeMonthly: -1,
          finalIncomeYearly: -14,
        }),
      }),
    );
  });
});
