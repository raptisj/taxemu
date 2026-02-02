import { useEffect } from "react";
import { useStore } from "store";

export const useBusinessActions = () => {
  const userDetails = useStore((state) => state.userDetails.business);
  const updateBusiness = useStore((state) => state.updateBusiness);
  const setHasError = useStore((state) => state.setHasError);

  const {
    grossMonthOrYear,
    grossIncome,
    tableResults,
    dirtyFormState,
    taxationYear,
    taxYearDuration,
    discountOptions,
    insuranceScaleSelection,
    extraBusinessExpenses,
    previousYearTaxInAdvance,
    prePaidNextYearTax,
    withholdingTax,
  } = userDetails;

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

  const onChangeNumberOfChildren = (value) => {
    updateBusiness({
      numberOfChildren: Number(value),
    });
  };

  const onSelectAgeGroup = (e) => {
    updateBusiness({
      ageGroup: e.target.value,
    });
  };

  // TODO: find a better way to do ths
  const spotFormChanges = () => {
    let dirty = dirtyFormState;

    if (grossIncome.year !== tableResults.grossIncome.year) {
      dirty = [...new Set([...dirty, "grossIncome.year"])];
    } else {
      dirty = dirty.filter((s) => s !== "grossIncome.year");
    }

    if (taxationYear !== tableResults.taxationYear) {
      dirty = [...new Set([...dirty, "taxationYear"])];
    } else {
      dirty = dirty.filter((s) => s !== "taxationYear");
    }

    if (taxYearDuration !== tableResults.taxYearDuration) {
      dirty = [...new Set([...dirty, "taxYearDuration"])];
    } else {
      dirty = dirty.filter((s) => s !== "taxYearDuration");
    }

    if (grossMonthOrYear !== tableResults.grossMonthOrYear) {
      dirty = [...new Set([...dirty, "grossMonthOrYear"])];
    } else {
      dirty = dirty.filter((s) => s !== "grossMonthOrYear");
    }

    if (
      discountOptions.firstScaleDiscount !==
      tableResults.discountOptions.firstScaleDiscount
    ) {
      dirty = [...new Set([...dirty, "discountOptions.firstScaleDiscount"])];
    } else {
      dirty = dirty.filter((s) => s !== "discountOptions.firstScaleDiscount");
    }

    if (insuranceScaleSelection !== tableResults.insuranceScaleSelection) {
      dirty = [...new Set([...dirty, "insuranceScaleSelection"])];
    } else {
      dirty = dirty.filter((s) => s !== "insuranceScaleSelection");
    }

    if (
      discountOptions.specialInsuranceScale !==
      tableResults.discountOptions.specialInsuranceScale
    ) {
      dirty = [...new Set([...dirty, "discountOptions.specialInsuranceScale"])];
    } else {
      dirty = dirty.filter(
        (s) => s !== "discountOptions.specialInsuranceScale",
      );
    }

    if (extraBusinessExpenses !== tableResults.extraBusinessExpenses) {
      dirty = [...new Set([...dirty, "extraBusinessExpenses"])];
    } else {
      dirty = dirty.filter((s) => s !== "extraBusinessExpenses");
    }

    if (
      previousYearTaxInAdvance !== tableResults.previousYearTaxInAdvance.year
    ) {
      dirty = [...new Set([...dirty, "previousYearTaxInAdvance"])];
    } else {
      dirty = dirty.filter((s) => s !== "previousYearTaxInAdvance");
    }

    if (prePaidNextYearTax !== tableResults.prePaidNextYearTax) {
      dirty = [...new Set([...dirty, "prePaidNextYearTax"])];
    } else {
      dirty = dirty.filter((s) => s !== "prePaidNextYearTax");
    }

    if (
      discountOptions.prePaidTaxDiscount !==
      tableResults.discountOptions.prePaidTaxDiscount
    ) {
      dirty = [...new Set([...dirty, "discountOptions.prePaidTaxDiscount"])];
    } else {
      dirty = dirty.filter((s) => s !== "discountOptions.prePaidTaxDiscount");
    }

    if (withholdingTax !== tableResults.withholdingTax) {
      dirty = [...new Set([...dirty, "withholdingTax"])];
    } else {
      dirty = dirty.filter((s) => s !== "withholdingTax");
    }

    return dirty;
  };

  // TODO: find a better way to do ths
  useEffect(() => {
    updateBusiness({
      dirtyFormState: spotFormChanges(),
    });
  }, [
    grossIncome.year,
    taxationYear,
    taxYearDuration,
    grossMonthOrYear,
    discountOptions.firstScaleDiscount,
    discountOptions.specialInsuranceScale,
    discountOptions.prePaidTaxDiscount,
    insuranceScaleSelection,
    extraBusinessExpenses,
    previousYearTaxInAdvance,
    prePaidNextYearTax,
    withholdingTax,
  ]);

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
  };
};
