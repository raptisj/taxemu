import { useStore } from "../store";
import {
  getCalculationDirtyFields,
  isBusinessGrossIncomeMissing,
} from "../utils/formState";

const getEmployeeDirtyFields = () => {
  const employee = useStore.getState().userDetails.employee;
  return getCalculationDirtyFields("employee", employee);
};

const getBusinessDirtyFields = () => {
  const business = useStore.getState().userDetails.business;
  return getCalculationDirtyFields("business", business);
};

describe("calculation form state", () => {
  afterEach(() => {
    useStore.getState().removeUserDetails();
  });

  it("marks only an actually empty business gross-income pair as missing", () => {
    expect(isBusinessGrossIncomeMissing({ month: 5833, year: 70000 })).toBe(
      false,
    );
    expect(isBusinessGrossIncomeMissing({ month: 0, year: 0 })).toBe(true);
    expect(isBusinessGrossIncomeMissing({ month: 1000, year: 0 })).toBe(true);
  });

  it("starts clean and removes a field when its value is reverted", () => {
    expect(getEmployeeDirtyFields()).toEqual([]);
    expect(getBusinessDirtyFields()).toEqual([]);

    useStore.getState().updateEmployee({ numberOfChildren: 2 });
    expect(getEmployeeDirtyFields()).toEqual(["numberOfChildren"]);

    useStore.getState().updateEmployee({ numberOfChildren: 0 });
    expect(getEmployeeDirtyFields()).toEqual([]);
  });

  it("tracks the 2026 age and children inputs for both calculators", () => {
    useStore.getState().updateEmployee({ ageGroup: "U25" });
    useStore.getState().updateBusiness({
      ageGroup: "A26_30",
      numberOfChildren: 2,
    });

    expect(getEmployeeDirtyFields()).toContain("ageGroup");
    expect(getBusinessDirtyFields()).toEqual(
      expect.arrayContaining(["ageGroup", "numberOfChildren"]),
    );
  });

  it("ignores conditional values that cannot affect the calculation", () => {
    const { business } = useStore.getState().userDetails;

    useStore.getState().updateBusiness({
      discountOptions: {
        ...business.discountOptions,
        prePaidTaxDiscount: true,
      },
    });
    expect(getBusinessDirtyFields()).not.toContain("prePaidTaxDiscount");

    useStore.getState().updateBusiness({ prePaidNextYearTax: true });
    expect(getBusinessDirtyFields()).toEqual(
      expect.arrayContaining(["prePaidNextYearTax", "prePaidTaxDiscount"]),
    );
  });

  it("atomically updates the business baseline from raw inputs", () => {
    useStore.getState().updateBusiness({
      grossIncome: { month: 2000, year: 24000 },
      taxYearDuration: 6,
    });

    useStore.getState().commitBusinessCalculation({
      newState: { finalIncome: { month: 1500, year: 9000 } },
      tableResults: {
        grossIncome: { month: 2000, year: 12000 },
      },
    });
    expect(getBusinessDirtyFields()).toEqual([]);

    useStore.getState().updateBusiness({ withholdingTax: true });
    expect(getBusinessDirtyFields()).toEqual(["withholdingTax"]);
  });

  it("captures every employee input after a reverse-calculation commit", () => {
    useStore.getState().updateEmployee({
      activeInput: "final",
      finalIncomeMonthly: 1000,
      finalIncomeYearly: 14000,
      salaryMonthCount: 14,
      numberOfChildren: 2,
      ageGroup: "U25",
    });

    useStore.getState().commitEmployeeCalculation({
      newState: {
        grossIncomeMonthly: 1300,
        grossIncomeYearly: 18200,
      },
      tableResults: {
        grossIncome: { month: 1300, year: 18200 },
        finalIncome: { month: 1000, year: 14000 },
      },
    });

    expect(getEmployeeDirtyFields()).toEqual([]);

    useStore.getState().updateEmployee({ taxationYear: 2025 });
    expect(getEmployeeDirtyFields()).toEqual(["taxationYear"]);
  });
});
