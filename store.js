import create from "zustand";
import { insuranceScales2021, taxScales2021 } from "./constants";

const initialState = {
  calculatorType: "employee",
  employee: {
    hasError: false,
    grossIncomeYearly: 0,
    finalIncomeYearly: 0,
    grossIncomeMonthly: 0,
    finalIncomeMonthly: 0,
    grossIncome: {
      month: 0,
      year: 0,
    },
    grossMonthOrYear: "year",
    finalMonthOrYear: "year",
    salaryMonthCount: 14,
    taxationYear: 2022,
    taxableIncome: 0,
    ...taxScales2021,
    activeInput: "gross", // gross | final
    taxAfterDiscount: 0,
    discountOptions: {
      returnBaseInland: false,
    },
    currentInsuranceDiscount: 0,
    insurance: {
      month: 0,
      year: 0,
    },
    // initial means before discount
    initialTax: {
      month: 0,
      year: 0,
    },
    // final means after discount
    finalTax: {
      month: 0,
      year: 0,
    },
    insuranceCarrier: "efka", // efka | tsmede
    taxationYearScales: {
      2022: {
        insurancePercentage: 0.1387,
      },
      2021: {
        insurancePercentage: 0.1412,
      },
    },
    servicesFMY: 0,
    numberOfChildren: 0,
    numberOfChildrenScales: {
      0: {
        discount: 777,
      },
      1: {
        discount: 810,
      },
      2: {
        discount: 900,
      },
      3: {
        discount: 1120,
      },
      4: {
        discount: 1340,
      },
      // 5: {
      //   discount: 1560,
      // },
      // 6: {
      //   discount: 1780,
      // },
      // 7: {
      //   discount: 2000,
      // },
    },
    tableResults: {
      finalIncome: {
        month: 0,
        year: 0,
      },
      grossIncome: {
        month: 0,
        year: 0,
      },
      finalTax: {
        month: 0,
        year: 0,
      },
      salaryMonthCount: 14,
      numberOfChildren: 0,
    },
    dirtyFormState: [],
  },
  ////////
  business: {
    hasError: false,
    grossIncomeYearly: 0,
    grossIncomeMonthly: 0,
    finalIncomeYearly: 0,
    finalIncomeMonthly: 0,
    grossMonthOrYear: "year",
    businessExpensesMonthOrYear: "month",
    // accountantFees: 0, // deprecate
    // healthInsuranceFees: 0, // deprecate
    extraBusinessExpenses: 0,
    totalBusinessExpenses: 0,
    taxableIncome: 0,
    previousYearTaxInAdvance: 0,
    taxationYear: 2022,
    taxationYearScales: {
      2022: {
        value: 0,
        ...insuranceScales2021,
        ...taxScales2021,
      },
      2021: {
        value: 0,
        ...insuranceScales2021,
        ...taxScales2021,
      },
    },
    insuranceScaleSelection: 1,
    insurance: {
      month: 0,
      year: 0,
    },
    totalTax: {
      month: 0,
      year: 0,
    },
    finalIncome: {
      month: 0,
      year: 0,
    },
    taxInAdvance: {
      month: 0,
      year: 0,
    },
    isFullYear: true,
    taxYearDuration: 12,
    discountOptions: {
      firstScaleDiscount: false,
      prePaidNextYearTax: false,
      prePaidTaxDiscount: false,
      specialInsuranceScale: false,
    },
    withholdingTax: false,
  },
  ////////////   /////////////   ///////////
  ///// TO BE DEPRECATED AFTER V2 /////////
  //////////   /////////////   ///////////
  grossIncome: 0,
  accountantFees: 0,
  healthInsuranceFees: 0,
  extraBusinessExpenses: 0,
  totalBusinessExpenses: 0,
  taxableIncome: 0,
  previousYearTaxInAdvance: 0,
  taxScales: [
    {
      multiplier: 0.09,
      amount: 0,
    },
    {
      multiplier: 0.22,
      amount: 0,
    },
    {
      multiplier: 0.28,
      amount: 0,
    },
    {
      multiplier: 0.36,
      amount: 0,
    },
    {
      multiplier: 0.44,
      amount: 0,
    },
  ],
  totalTax: 0,
  isFullYear: true,
  taxYearDuration: 12,
  discountOptions: {
    firstScaleDiscount: false,
    prePaidNextYearTax: false,
    prePaidTaxDiscount: false,
  },
  withholdingTax: false,
};

export const useStore = create((set) => ({
  userDetails: initialState,
  // TODO: to be depricated with v2
  addDetail: ({ value, field }) =>
    set((state) => ({
      userDetails: { ...state.userDetails, [field]: value },
    })),

  // TODO: to be depricated with v2
  changeCalculatorType: ({ value, field }) =>
    set((state) => ({
      userDetails: { ...state.userDetails, [field]: value },
    })),

  // TODO: to be depricated with v2
  addEmployeeDetail: ({ value, field }) =>
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        employee: { ...state.userDetails.employee, [field]: value },
      },
    })),

  // TODO: to be depricated with v2
  addBusinessDetail: ({ value, field }) =>
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        business: { ...state.userDetails.business, [field]: value },
      },
    })),

  // TODO: to be depricated with v2
  setBusinessHasError: ({ value }) =>
    set((state) => ({
      userDetails: { ...state.userDetails.business, hasError: value },
    })),

  // TODO: to be depricated with v2
  setEmployeeHasError: ({ value }) =>
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        employee: { ...state.userDetails.employee, hasError: value },
      },
    })),

  update: (newState) =>
    set((state) => ({
      userDetails: { ...state.userDetails, ...newState },
    })),

  updateEmployee: (newState) =>
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        employee: { ...state.userDetails.employee, ...newState },
      },
    })),

  updateEmployeeTable: (newState) =>
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        employee: {
          ...state.userDetails.employee,
          tableResults: {
            ...state.userDetails.employee.tableResults,
            ...newState,
          },
        },
      },
    })),

  updateBusiness: (newState) =>
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        business: { ...state.userDetails.business, ...newState },
      },
    })),

  setHasError: ({ entity, value }) =>
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        [entity]: { ...state.userDetails[entity], hasError: value },
      },
    })),

  removeUserDetails: () => set({ userDetails: initialState }),
}));
