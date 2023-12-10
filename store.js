import create from "zustand";
import {
  insuranceScales2021,
  insuranceScales2022,
  insuranceScales2023,
  taxScales2021,
  taxScales2022,
  taxScales2023,
} from "./constants";

const initialState = {
  calculatorType: "employee",
  // canInstallPWA and deferredPrompt are for PWA installation state //
  canInstallPWA: false, //////////////////////////////////////////////
  deferredPrompt: null, /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////
  //////// Employee ///////////////////
  ////////////////////////////////////
  //
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
    insuranceCarrier: "efka",
    taxationYearScales: {
      2023: {
        insurancePercentage: 0.1387,
        maxTaxableSalary: 7126.94,
      },
      2022: {
        insurancePercentage: 0.1387,
        maxTaxableSalary: 6500,
      },
      2021: {
        insurancePercentage: 0.1412,
        maxTaxableSalary: 6500,
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
  //
  //////////////////////////////////////
  //////// Business ///////////////////
  ////////////////////////////////////
  //
  business: {
    hasError: false,
    grossIncome: {
      month: 0,
      year: 0,
    },
    finalIncomeYearly: 0,
    finalIncomeMonthly: 0,
    grossMonthOrYear: "year",
    businessExpensesMonthOrYear: "month",
    extraBusinessExpenses: 0,
    totalBusinessExpenses: 0,
    taxableIncome: 0,
    previousYearTaxInAdvance: 0,
    taxationYear: 2023,
    taxationYearScales: {
      2023: {
        value: 0,
        ...insuranceScales2023,
        ...taxScales2023,
      },
      2022: {
        value: 0,
        ...insuranceScales2022,
        ...taxScales2022,
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
    quickCalc: {
      grossIncomeYearly: 0,
      currentAdditionalValueTax: 0.24,
      currentWithholdingTax: 0.2,
      additionalValueTax: {
        24: {
          text: "24%",
          value: 0.24,
        },
      },
      withholdingTax: {
        20: {
          text: "20%",
          value: 0.2,
        },
      },
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
      taxationYear: 2023,
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
};

export const useStore = create((set) => ({
  userDetails: initialState,

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

  updateBusiness: (newState) => {
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        business: {
          ...state.userDetails.business,
          ...newState,
        },
      },
    }));
  },

  updateBusinessQuickCalc: (newState) =>
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        business: {
          ...state.userDetails.business,
          quickCalc: {
            ...state.userDetails.business.quickCalc,
            ...newState,
          },
        },
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
