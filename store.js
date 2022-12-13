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
    grossMonthOrYear: "year",
    finalMonthOrYear: "year",
    salaryMonthCount: 14,
    taxationYear: 2022,
    taxableIncome: 0,
    taxYearly: 0,
    taxMonthly: 0,
    ...taxScales2021,
    activeInput: "gross", // gross | final
    totalTax: 0,
    discountOptions: {
      returnBaseInland: false,
    },
    insurancePerYear: 0,
    insurancePerMonth: 0,
    insuranceCarrier: "efka", // efka | tsmede
    taxationYearScales: {
      2022: {
        insurancePercentage: 0.13867,
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
        limit: 8.633,
      },
      1: {
        discount: 810,
        limit: 9.0,
      },
      2: {
        discount: 900,
        limit: 10.0,
      },
      3: {
        discount: 1120,
        limit: 11.0,
      },
      4: {
        discount: 1340,
        limit: 12.0,
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
      // aboveLimit: {
      //   discount: 0.2,
      // },
    },
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
  changeCalculatorType: ({ value, field }) =>
    set((state) => ({
      userDetails: { ...state.userDetails, [field]: value },
    })),
  setBusinessHasError: ({ value }) =>
    set((state) => ({
      userDetails: { ...state.userDetails.business, hasError: value },
    })),
  setEmployeeHasError: ({ value }) =>
    set((state) => ({
      userDetails: { ...state.userDetails.employee, hasError: value },
    })),
  addEmployeeDetail: ({ value, field }) =>
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        employee: { ...state.userDetails.employee, [field]: value },
      },
    })),
  addBusinessDetail: ({ value, field }) =>
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        business: { ...state.userDetails.business, [field]: value },
      },
    })),
  removeUserDetails: () => set({ userDetails: initialState }),
}));
