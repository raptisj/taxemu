import { useEffect } from "react";
import { useStore } from "store";

export const useEmployeeActions = () => {
  const userDetails = useStore((state) => state.userDetails.employee);
  const updateEmployee = useStore((state) => state.updateEmployee);
  const setHasError = useStore((state) => state.setHasError);

  const {
    grossIncomeYearly,
    grossMonthOrYear,
    taxationYear,
    taxationYearScales,
    finalMonthOrYear,
    salaryMonthCount,
    tableResults,
    dirtyFormState,
    finalIncomeYearly,
    numberOfChildren,
  } = userDetails;

  const isGrossMonthly = grossMonthOrYear === "month";
  const isFinalMonthly = finalMonthOrYear === "month";

  // for generic utils
  const findMonthlyAmount = (amount, months) => {
    return Math.round(Number(amount) / Number(months));
  };

  const findYearlyAmount = (amount, months) => {
    return Math.round(Number(amount) * Number(months));
  };

  const findInsurancePerMonth = (amount, months, insurancePercentage) => {
    return Math.round(findMonthlyAmount(amount, months) * insurancePercentage);
  };

  const onSelectSalaryMonthCount = (e) => {
    const value = Number(e.target.value);

    updateEmployee({
      salaryMonthCount: value,
      grossIncomeMonthly: findMonthlyAmount(grossIncomeYearly, value),
      insurancePerMonth: findInsurancePerMonth(
        grossIncomeYearly,
        value,
        taxationYearScales[taxationYear].insurancePercentage
      ),
    });
  };

  // dedicated function in store
  const onChangeGrossIncome = (value, count) => {
    // TODO: deprecate the first two
    updateEmployee({
      [isGrossMonthly ? "grossIncomeMonthly" : "grossIncomeYearly"]: Math.round(
        Number(value)
      ),
      [isGrossMonthly ? "grossIncomeYearly" : "grossIncomeMonthly"]:
        isGrossMonthly
          ? findYearlyAmount(value, count)
          : findMonthlyAmount(value, count),
      activeInput: "gross",
      // grossIncome: {
      //   month: isGrossMonthly
      //     ? Math.round(Number(value))
      //     : findMonthlyAmount(value, count),
      //   year: isGrossMonthly
      //     ? findYearlyAmount(value, count)
      //     : Math.round(Number(value)),
      // },
      // dirtyFormState:
      //   grossIncomeYearly !== grossIncome.year
      //     ? [...new Set([...dirtyFormState, "grossIncomeYearly"])]
      //     : dirtyFormState.filter((s) => s !== "grossIncomeYearly"),
    });

    setHasError({ entity: "employee", value: false });
  };

  const onSelectGrossMonthOrYear = (e) => {
    updateEmployee({
      grossMonthOrYear: e.target.value,
    });
  };

  const onChangeFinalIncome = (value, count) => {
    updateEmployee({
      [isFinalMonthly ? "finalIncomeMonthly" : "finalIncomeYearly"]: Math.round(
        Number(value)
      ),
      [isFinalMonthly ? "finalIncomeYearly" : "finalIncomeMonthly"]:
        isFinalMonthly
          ? findYearlyAmount(value, count)
          : findMonthlyAmount(value, count),
      activeInput: "final",
    });

    setHasError({ entity: "employee", value: false });
  };

  const spotFormChanges = () => {
    let dirty = dirtyFormState;

    if (grossIncomeYearly !== tableResults.grossIncome.year) {
      dirty = [...new Set([...dirty, "grossIncomeYearly"])];
    } else {
      dirty = dirty.filter((s) => s !== "grossIncomeYearly");
    }

    if (salaryMonthCount !== tableResults.salaryMonthCount) {
      dirty = [...new Set([...dirty, "salaryMonthCount"])];
    } else {
      dirty = dirty.filter((s) => s !== "salaryMonthCount");
    }

    if (finalIncomeYearly !== tableResults.finalIncome.year) {
      dirty = [...new Set([...dirty, "finalIncomeYearly"])];
    } else {
      dirty = dirty.filter((s) => s !== "finalIncomeYearly");
    }

    if (numberOfChildren !== tableResults.numberOfChildren) {
      dirty = [...new Set([...dirty, "numberOfChildren"])];
    } else {
      dirty = dirty.filter((s) => s !== "numberOfChildren");
    }

    return dirty;
  };

  // TODO: find a better way to do ths
  useEffect(() => {
    updateEmployee({
      dirtyFormState: spotFormChanges(),
    });
  }, [
    grossIncomeYearly,
    salaryMonthCount,
    finalIncomeYearly,
    numberOfChildren,
  ]);

  const onSelectFinalIncomeMonthOfYear = (e) => {
    updateEmployee({
      finalMonthOrYear: e.target.value,
    });
  };

  const onSelectTaxationYear = (e) => {
    updateEmployee({
      taxationYear: Number(e.target.value),
    });
  };

  const onSelectInsuranceCarrier = (e) => {
    updateEmployee({
      insuranceCarrier: e.target.value,
    });
  };

  const onChangeNumberOfChildren = (value) => {
    updateEmployee({
      numberOfChildren: Number(value),
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
