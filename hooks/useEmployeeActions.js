import { useStore } from "store";

export const useEmployeeActions = () => {
  const userDetails = useStore((state) => state.userDetails.employee);
  const addEmployeeDetail = useStore((state) => state.addEmployeeDetail);

  const {
    grossIncomeYearly,
    grossMonthOrYear,
    taxationYear,
    taxationYearScales,
    finalMonthOrYear,
  } = userDetails;

  const isGrossMonthly = grossMonthOrYear === "month";
  const isFinalMonthly = finalMonthOrYear === "month";

  const onSelectSalaryMonthCount = (e) => {
    addEmployeeDetail({
      value: Number(e.target.value),
      field: "salaryMonthCount",
    });

    addEmployeeDetail({
      value: Math.round(Number(grossIncomeYearly) / Number(e.target.value)),
      field: "grossIncomeMonthly",
    });

    addEmployeeDetail({
      value: Math.round(
        (grossIncomeYearly / Number(e.target.value)) *
          taxationYearScales[taxationYear].insurancePercentage
      ),
      field: "insurancePerMonth",
    });
  };

  // dedicated function in store
  const onChangeGrossIncome = (value, count) => {
    addEmployeeDetail({
      value: Math.round(Number(value)),
      field: isGrossMonthly ? "grossIncomeMonthly" : "grossIncomeYearly",
    });

    // to upate the opposite.
    addEmployeeDetail({
      value: isGrossMonthly
        ? Math.round(Number(value) * count)
        : Math.round(Number(value) / count),
      field: isGrossMonthly ? "grossIncomeYearly" : "grossIncomeMonthly",
    });

    addEmployeeDetail({
      value: "gross",
      field: "activeInput",
    });
  };

  const onSelectGrossMonthOrYear = (e) => {
    addEmployeeDetail({
      value: e.target.value,
      field: "grossMonthOrYear",
    });
  };

  const onChangeFinalIncome = (value, count) => {
    addEmployeeDetail({
      value: Math.round(Number(value)),
      field: isFinalMonthly ? "finalIncomeMonthly" : "finalIncomeYearly",
    });

    // to upate the opposite.
    addEmployeeDetail({
      value: isFinalMonthly
        ? Math.round(Number(value) * count)
        : Math.round(Number(value) / count),
      field: isFinalMonthly ? "finalIncomeYearly" : "finalIncomeMonthly",
    });

    addEmployeeDetail({
      value: "final",
      field: "activeInput",
    });
  };

  const onSelectFinalIncomeMonthOfYear = (e) => {
    addEmployeeDetail({
      value: e.target.value,
      field: "finalMonthOrYear",
    });
  };

  const onSelectTaxationYear = (e) => {
    addEmployeeDetail({
      value: Number(e.target.value),
      field: "taxationYear",
    });
  };

  const onSelectInsuranceCarrier = (e) => {
    addEmployeeDetail({
      value: e.target.value,
      field: "insuranceCarrier",
    });
  };

  const onChangeNumberOfChildren = (value) => {
    addEmployeeDetail({
      value: Number(value),
      field: "numberOfChildren",
    });
  };

  return {
    onSelectSalaryMonthCount,
    onChangeGrossIncome,
    onSelectGrossMonthOrYear,
    onChangeFinalIncome,
    onSelectFinalIncomeMonthOfYear,
    onSelectTaxationYear,
    onSelectInsuranceCarrier,
    onChangeNumberOfChildren,
  };
};
