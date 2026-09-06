import { useStore } from "store";
import { getEmployeeRules, getTaxRules } from "../rules";

export const useEmployeeActions = () => {
  const userDetails = useStore((state) => state.userDetails.employee);
  const updateEmployee = useStore((state) => state.updateEmployee);
  const setHasError = useStore((state) => state.setHasError);

  const {
    grossIncomeYearly,
    grossMonthOrYear,
    taxationYear,
    finalMonthOrYear,
  } = userDetails;

  const isGrossMonthly = grossMonthOrYear === "month";
  const isFinalMonthly = finalMonthOrYear === "month";
  const findMonthlyAmount = (amount, months) =>
    Math.round(Number(amount) / Number(months));
  const findYearlyAmount = (amount, months) =>
    Math.round(Number(amount) * Number(months));
  const findInsurancePerMonth = (amount, months, insurancePercentage) =>
    Math.round(findMonthlyAmount(amount, months) * insurancePercentage);

  const onSelectSalaryMonthCount = (e) => {
    const value = Number(e.target.value);
    const rules = getEmployeeRules(taxationYear);
    updateEmployee({
      salaryMonthCount: value,
      grossIncomeMonthly: findMonthlyAmount(grossIncomeYearly, value),
      insurancePerMonth: findInsurancePerMonth(
        grossIncomeYearly,
        value,
        rules.insurance.employeeRate,
      ),
    });
  };

  const onChangeGrossIncome = (value, count) => {
    updateEmployee({
      [isGrossMonthly ? "grossIncomeMonthly" : "grossIncomeYearly"]: Math.round(
        Number(value),
      ),
      [isGrossMonthly ? "grossIncomeYearly" : "grossIncomeMonthly"]:
        isGrossMonthly
          ? findYearlyAmount(value, count)
          : findMonthlyAmount(value, count),
      activeInput: "gross",
    });
    setHasError({ entity: "employee", value: false });
  };

  const onSelectGrossMonthOrYear = (e) =>
    updateEmployee({ grossMonthOrYear: e.target.value });

  const onChangeFinalIncome = (value, count) => {
    updateEmployee({
      [isFinalMonthly ? "finalIncomeMonthly" : "finalIncomeYearly"]: Math.round(
        Number(value),
      ),
      [isFinalMonthly ? "finalIncomeYearly" : "finalIncomeMonthly"]:
        isFinalMonthly
          ? findYearlyAmount(value, count)
          : findMonthlyAmount(value, count),
      activeInput: "final",
    });
    setHasError({ entity: "employee", value: false });
  };

  const onSelectFinalIncomeMonthOfYear = (e) =>
    updateEmployee({ finalMonthOrYear: e.target.value });
  const onSelectTaxationYear = (e) => {
    const taxationYear = Number(e.target.value);
    const rules = getTaxRules(taxationYear);
    updateEmployee({
      taxationYear,
      numberOfChildren: Math.min(
        userDetails.numberOfChildren,
        rules.ui.employee.maximumChildren,
      ),
    });
  };
  const onSelectInsuranceCarrier = (e) =>
    updateEmployee({ insuranceCarrier: e.target.value });
  const onChangeNumberOfChildren = (value) =>
    updateEmployee({ numberOfChildren: Number(value) });
  const onSelectAgeGroup = (e) =>
    updateEmployee({ ageGroup: e.target.value });

  return {
    onSelectSalaryMonthCount,
    onChangeGrossIncome,
    onSelectGrossMonthOrYear,
    onChangeFinalIncome,
    onSelectFinalIncomeMonthOfYear,
    onSelectTaxationYear,
    onSelectInsuranceCarrier,
    onChangeNumberOfChildren,
    onSelectAgeGroup,
  };
};
