import { useStore } from "store";

export const useBusinessActions = () => {
  const userDetails = useStore((state) => state.userDetails.business);
  const updateBusiness = useStore((state) => state.updateBusiness);
  const setHasError = useStore((state) => state.setHasError);

  const { grossMonthOrYear } = userDetails;

  const isGrossMonthly = grossMonthOrYear === "month";

  const onSelectTaxationYear = (e) => {
    updateBusiness({
      taxationYear: Number(e.target.value),
    });
  };

  const onChangeTaxYearDuration = (value) => {
    updateBusiness({
      taxYearDuration: Number(value),
    });
  };

  const onChangeGrossIncome = (value, count) => {
    updateBusiness({
      [isGrossMonthly ? "grossIncomeMonthly" : "grossIncomeYearly"]: Math.round(
        Number(value)
      ),
      [isGrossMonthly ? "grossIncomeYearly" : "grossIncomeMonthly"]:
        isGrossMonthly
          ? Math.round(Number(value) * count)
          : Math.round(Number(value) / count),
    });

    setHasError({ entity: "business", value: false });
  };

  const onSelectGrossIncomeMonthOfYear = (e) => {
    updateBusiness({
      grossMonthOrYear: e.target.value,
    });
  };

  const onChangeBusinessExpensesMonthOrYear = (value) => {
    updateBusiness({
      businessExpensesMonthOrYear: value,
    });
  };

  const onChangeInsuranceScales = (value) => {
    updateBusiness({
      insuranceScaleSelection: Number(value),
    });
  };

  const onChangeExtraBusinessExpenses = (value) => {
    updateBusiness({
      extraBusinessExpenses: Number(value),
    });
  };

  const onChangePreviousYearTaxInAdvance = (value) => {
    updateBusiness({
      previousYearTaxInAdvance: Number(value),
    });
  };

  return {
    onSelectTaxationYear,
    onChangeTaxYearDuration,
    onChangeGrossIncome,
    onSelectGrossIncomeMonthOfYear,
    onChangeBusinessExpensesMonthOrYear,
    onChangeInsuranceScales,
    onChangeExtraBusinessExpenses,
    onChangePreviousYearTaxInAdvance,
  };
};
