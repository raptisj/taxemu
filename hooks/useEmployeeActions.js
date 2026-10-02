import { useStore } from "store";
import { isEngineer, moneyToCents } from "../utils/employeeContributions";
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
  const normalizeIncome = (amount) => isEngineer(userDetails) ? moneyToCents(Number(amount)) : Math.round(Number(amount));
  const findMonthlyAmount = (amount, months) => isEngineer(userDetails) ? Number(amount) / Number(months) : Math.round(Number(amount) / Number(months));
  const findYearlyAmount = (amount, months) =>
    normalizeIncome(Number(amount) * Number(months));
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
      [isGrossMonthly ? "grossIncomeMonthly" : "grossIncomeYearly"]: normalizeIncome(value),
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
      [isFinalMonthly ? "finalIncomeMonthly" : "finalIncomeYearly"]: normalizeIncome(value),
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
      numberOfChildren:
        rules.ui.employee.maximumChildren === null
          ? userDetails.numberOfChildren
          : Math.min(
              userDetails.numberOfChildren,
              rules.ui.employee.maximumChildren,
            ),
    });
  };
  const onChangeInsuranceOptions = (options) => {
    updateEmployee({
      ...options,
      ...(options.insuranceProfile === "engineer" && grossMonthOrYear === "year" ? {
        grossIncomeMonthly: grossIncomeYearly / userDetails.salaryMonthCount,
      } : {}),
    });
    setHasError({ entity: "employee", value: false });
  };
  const onSelectInsuranceCarrier = (e) =>
    updateEmployee({ insuranceCarrier: e.target.value });
  const onChangeNumberOfChildren = (value) =>
    updateEmployee({ numberOfChildren: Number(value) });
  const onSelectAgeGroup = (e) =>
    updateEmployee({ ageGroup: e.target.value });

  return {
    onChangeInsuranceOptions,
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
