import create from "zustand";
import { getTaxRules, latestTaxYear } from "./rules";
import {
  getBusinessCalculationInput,
  getEmployeeCalculationInput,
} from "./utils/formState";

const latestRules = getTaxRules(latestTaxYear);

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
    taxationYear: latestTaxYear,
    taxableIncome: {
      month: 0,
      year: 0,
    },
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
    employerObligations: {
      month: 0,
      year: 0,
    },
    insuranceCarrier: "efka",
    servicesFMY: 0,
    numberOfChildren: 0,
    childrenDiscountAmount: {
      month: 0,
      year: 0,
    },
    ageGroup: "A30P",
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
    lastCalculatedInput: null,
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
    finalIncome: {
      month: 0,
      year: 0,
    },
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
    finalIncomeYearly: 0,
    finalIncomeMonthly: 0,
    grossMonthOrYear: "year",
    businessExpensesMonthOrYear: "month",
    extraBusinessExpenses: 0,
    totalBusinessExpenses: 0,
    taxableIncome: 0,
    previousYearTaxInAdvance: 0,
    taxationYear: latestTaxYear,
    insuranceScaleSelection: 1,
    taxYearDuration: 12,
    numberOfChildren: 0,
    ageGroup: "A30P",
    discountOptions: {
      firstScaleDiscount: false,
      prePaidTaxDiscount: false,
      specialInsuranceScale: false,
    },
    prePaidNextYearTax: false,
    withholdingTax: false,
    calculateRealGrossWidget: {
      grossIncomeYearly: 0,
      currentAdditionalValueTax: latestRules.business.invoice.vatRates[0],
      currentWithholdingTax:
        latestRules.business.invoice.withholdingRates[0],
    },
    tableResults: {
      grossIncome: {
        month: 0,
        year: 0,
      },
      finalIncome: {
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
      taxationYear: latestTaxYear,
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
    lastCalculatedInput: null,
    query: "",
  },
};

initialState.employee.lastCalculatedInput =
  getEmployeeCalculationInput(initialState.employee);
initialState.business.lastCalculatedInput =
  getBusinessCalculationInput(initialState.business);

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

  commitEmployeeCalculation: ({ newState, tableResults }) =>
    set((state) => {
      const employee = {
        ...state.userDetails.employee,
        ...newState,
        tableResults: {
          ...state.userDetails.employee.tableResults,
          ...tableResults,
        },
      };

      return {
        userDetails: {
          ...state.userDetails,
          employee: {
            ...employee,
            lastCalculatedInput: getEmployeeCalculationInput(employee),
          },
        },
      };
    }),

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
          calculateRealGrossWidget: {
            ...state.userDetails.business.calculateRealGrossWidget,
            ...newState,
          },
        },
      },
    })),

  commitBusinessCalculation: ({ newState, tableResults }) =>
    set((state) => {
      const business = {
        ...state.userDetails.business,
        ...newState,
        tableResults: {
          ...state.userDetails.business.tableResults,
          ...tableResults,
        },
      };

      return {
        userDetails: {
          ...state.userDetails,
          business: {
            ...business,
            lastCalculatedInput: getBusinessCalculationInput(business),
          },
        },
      };
    }),

  setHasError: ({ entity, value }) =>
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        [entity]: { ...state.userDetails[entity], hasError: value },
      },
    })),

  removeUserDetails: () => set({ userDetails: initialState }),
}));
