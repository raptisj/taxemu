import { useStore } from "store";
import { getTaxRules } from "../rules";

export const useBusinessActions = () => {
  const userDetails = useStore((state) => state.userDetails.business);
  const updateBusiness = useStore((state) => state.updateBusiness);
  const setHasError = useStore((state) => state.setHasError);
  const isGrossMonthly = userDetails.grossMonthOrYear === "month";

  const onSelectTaxationYear = (e) => {
    const taxationYear = Number(e.target.value);
    const rules = getTaxRules(taxationYear);
    const invoiceRules = rules.business.invoice;
    const quickCalc = userDetails.calculateRealGrossWidget;
    updateBusiness({
      taxationYear,
      insuranceScaleSelection: Math.min(
        userDetails.insuranceScaleSelection,
        rules.business.insurance.monthlyAmounts.length - 1,
      ),
      numberOfChildren: Math.min(
        userDetails.numberOfChildren,
        rules.ui.business.maximumChildren,
      ),
      calculateRealGrossWidget: {
        ...quickCalc,
        currentAdditionalValueTax: invoiceRules.vatRates.includes(
          quickCalc.currentAdditionalValueTax,
        ) || quickCalc.currentAdditionalValueTax === 0
          ? quickCalc.currentAdditionalValueTax
          : invoiceRules.vatRates[0],
        currentWithholdingTax: invoiceRules.withholdingRates.includes(
          quickCalc.currentWithholdingTax,
        ) || quickCalc.currentWithholdingTax === 0
          ? quickCalc.currentWithholdingTax
          : invoiceRules.withholdingRates[0],
      },
    });
  };
  const onChangeTaxYearDuration = (value) =>
    updateBusiness({ taxYearDuration: Number(value) });

  const onChangeGrossIncome = (value, count) => {
    const grossIncome = {
      month: isGrossMonthly
        ? Math.round(Number(value))
        : Math.round(Number(value) / count),
      year: isGrossMonthly
        ? Math.round(Number(value) * count)
        : Math.round(Number(value)),
    };
    updateBusiness({ grossIncome });
    setHasError({ entity: "business", value: false });
  };

  const onSelectGrossIncomeMonthOfYear = (e) =>
    updateBusiness({ grossMonthOrYear: e.target.value });
  const onChangeBusinessExpensesMonthOrYear = (value) =>
    updateBusiness({ businessExpensesMonthOrYear: value });
  const onChangeInsuranceScales = (value) =>
    updateBusiness({ insuranceScaleSelection: Number(value) });
  const onChangeExtraBusinessExpenses = (value) =>
    updateBusiness({ extraBusinessExpenses: Number(value) });
  const onChangePreviousYearTaxInAdvance = (value) =>
    updateBusiness({ previousYearTaxInAdvance: Number(value) });
  const onChangeNumberOfChildren = (value) =>
    updateBusiness({ numberOfChildren: Number(value) });
  const onSelectAgeGroup = (e) =>
    updateBusiness({ ageGroup: e.target.value });
  const updateMinimumPresumedIncome = (newState) =>
    updateBusiness({
      minimumPresumedIncome: {
        ...userDetails.minimumPresumedIncome,
        ...newState,
      },
    });

  return {
    onSelectTaxationYear,
    onChangeTaxYearDuration,
    onChangeGrossIncome,
    onSelectGrossIncomeMonthOfYear,
    onChangeBusinessExpensesMonthOrYear,
    onChangeInsuranceScales,
    onChangeExtraBusinessExpenses,
    onChangePreviousYearTaxInAdvance,
    onChangeNumberOfChildren,
    onSelectAgeGroup,
    updateMinimumPresumedIncome,
  };
};
