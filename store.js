import create from "zustand";

const initialState = {
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
  addDetail: ({ value, field }) =>
    set((state) => ({
      userDetails: { ...state.userDetails, [field]: value },
    })),
  removeUserDetails: () => set({ userDetails: initialState }),
}));
