import { useStore } from "store";

export const useBusinessActions = () => {
  const userDetails = useStore((state) => state.userDetails.business);
  const addBusinessDetail = useStore((state) => state.addBusinessDetail);

  const { grossMonthOrYear } = userDetails;

  const isGrossMonthly = grossMonthOrYear === "month";

  const onSelectTaxationYear = (e) => {
    addBusinessDetail({
      value: Number(e.target.value),
      field: "taxationYear",
    });
  };

  const onChangeTaxYearDuration = (value) => {
    addBusinessDetail({
      value: Number(value),
      field: "taxYearDuration",
    });
  };

  const onChangeGrossIncome = (value, count) => {
    addBusinessDetail({
      value: Math.round(Number(value)),
      field: isGrossMonthly ? "grossIncomeMonthly" : "grossIncomeYearly",
    });

    // to upate the opposite.
    addBusinessDetail({
      value: isGrossMonthly
        ? Math.round(Number(value) * count)
        : Math.round(Number(value) / count),
      field: isGrossMonthly ? "grossIncomeYearly" : "grossIncomeMonthly",
    });
  };

  const onSelectGrossIncomeMonthOfYear = (e) => {
    addBusinessDetail({
      value: e.target.value,
      field: "grossMonthOrYear",
    });
  };

  const onChangeBusinessExpensesMonthOrYear = (value) => {
    addBusinessDetail({
      value,
      field: "businessExpensesMonthOrYear",
    });
  };

  const onChangeInsuranceScales = (value) => {
    addBusinessDetail({
      value: Number(value),
      field: "insuranceScaleSelection",
    });
  };

  const onChangeExtraBusinessExpenses = (value) => {
    addBusinessDetail({
      value: Number(value),
      field: "extraBusinessExpenses",
    });
  };

  const onChangePreviousYearTaxInAdvance = (value) => {
    addBusinessDetail({
      value: Number(value),
      field: "previousYearTaxInAdvance",
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
