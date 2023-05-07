import create from "zustand";
import {
  insuranceScales2021,
  insuranceScales2023,
  taxScales2021,
} from "./constants";

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
      discountOptions: {
        returnBaseInland: false,
      },
    },
    dirtyFormState: [],
  },
  business: {
    hasError: false,
    grossIncomeYearly: 0,
    grossIncomeMonthly: 0,
    finalIncomeYearly: 0,
    finalIncomeMonthly: 0,
    grossMonthOrYear: "year",
    businessExpensesMonthOrYear: "month",
    extraBusinessExpenses: 0,
    totalBusinessExpenses: 0,
    taxableIncome: 0,
    previousYearTaxInAdvance: 0,
    taxationYear: 2022,
    taxationYearScales: {
      2023: {
        value: 0,
        ...insuranceScales2023,
        ...taxScales2021,
      },
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
      prePaidTaxDiscount: false,
      specialInsuranceScale: false,
    },
    prePaidNextYearTax: false,
    withholdingTax: false,
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
      insurance: {
        month: 0,
        year: 0,
      },
      businessExpenses: {
        month: 0,
        year: 0,
      },
      taxInAdvance: {
        month: 0,
        year: 0,
      },
      withholdingTaxAmount: {
        month: 0,
        year: 0,
      },
      withholdingTax: false,
      taxationYear: 2022,
      taxYearDuration: 12,
      grossMonthOrYear: "year",
      discountOptions: {
        firstScaleDiscount: false,
        prePaidTaxDiscount: false,
        specialInsuranceScale: false,
      },
      insuranceScaleSelection: 1,
      extraBusinessExpenses: 0,
      previousYearTaxInAdvance: {
        month: 0,
        year: 0,
      },
      prePaidNextYearTax: false,
    },
    dirtyFormState: [],
  },
  ////////////   /////////////   ///////////
  ///// TO BE DEPRECATED AFTER V2 /////////
  //////////   /////////////   ///////////
  // grossIncome: 0,
  // accountantFees: 0,
  // healthInsuranceFees: 0,
  // extraBusinessExpenses: 0,
  // totalBusinessExpenses: 0,
  // taxableIncome: 0,
  // previousYearTaxInAdvance: 0,
  // taxScales: [
  //   {
  //     multiplier: 0.09,
  //     amount: 0,
  //   },
  //   {
  //     multiplier: 0.22,
  //     amount: 0,
  //   },
  //   {
  //     multiplier: 0.28,
  //     amount: 0,
  //   },
  //   {
  //     multiplier: 0.36,
  //     amount: 0,
  //   },
  //   {
  //     multiplier: 0.44,
  //     amount: 0,
  //   },
  // ],
  // totalTax: 0,
  // isFullYear: true,
  // taxYearDuration: 12,
  // discountOptions: {
  //   firstScaleDiscount: false,
  //   prePaidNextYearTax: false,
  //   prePaidTaxDiscount: false,
  // },
  // withholdingTax: false,
};

export const useStore = create((set) => ({
  userDetails: initialState,
  // TODO: to be depricated with v2
  addDetail: ({ value, field }) =>
    set((state) => ({
      userDetails: { ...state.userDetails, [field]: value },
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

  updateBusinessTable: (newState) =>
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        business: {
          ...state.userDetails.business,
          tableResults: {
            ...state.userDetails.business.tableResults,
            ...newState,
          },
        },
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
