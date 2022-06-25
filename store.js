import create from "zustand";

const initialState = {
  grossIncome: 0,
  grossIncomeAfterTax: 0,
  grossIncomeAfterBusinessExpenses: 0,
  accountantFees: 0,
  taxableIncome: 0,
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
  savings: 0,
  businessObligations: 0,
  additionalBusinessObligations: 0,
  isFullYear: true,
  taxYearDuration: 12,
  discountOptions: {
    firstScaleDiscount: false,
    prePaidNextYearTax: false,
    prePaidTaxDiscount: false,
  },
  prePaidTax: false,
};

export const useStore = create((set) => ({
  userDetails: initialState,
  addDetail: ({ value, field }) =>
    set((state) => ({
      userDetails: { ...state.userDetails, [field]: value },
    })),
  removeUserDetails: () => set({ userDetails: initialState }),
}));
