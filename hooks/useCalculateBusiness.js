import { useCallback, useEffect } from "react";
import { useStore } from "store";
import { useToast } from "@chakra-ui/react";

export const useCalculateBusiness = () => {
  const userDetails = useStore((state) => state.userDetails.business);
  const hasError = useStore((state) => state.userDetails.business.hasError);
  const addBusinessDetail = useStore((state) => state.addBusinessDetail);
  const setBusinessHasError = useStore((state) => state.setBusinessHasError);
  const toast = useToast();

  const {
    grossIncomeYearly,
    grossIncomeMonthly,
    taxationYearScales,
    taxationYear,
    taxYearDuration,
    grossMonthOrYear,
    businessExpensesMonthOrYear,
    insuranceScaleSelection,
    discountOptions,
    taxInAdvance,
    extraBusinessExpenses,
  } = userDetails;
  const isGrossMonthly = grossMonthOrYear === "month";

  const getInsuranceTotal = () => {
    const insurancePerMonth =
      taxationYearScales[taxationYear].insuranceScales[
        discountOptions.specialInsuranceScale ? 0 : insuranceScaleSelection
      ].amount;
    const isYear = businessExpensesMonthOrYear === "year";

    return isYear ? taxYearDuration * insurancePerMonth : insurancePerMonth;
  };

  const PRE_PAID_TAX_DISCOUNT = 0.5;
  const PRE_PAID_TAX_PERCENTAGE = 0.55;
  const SCALE_THRESHOLD = 10000;

  const calculateWithCurrentScales = useCallback(
    ({ toBeTaxed }) => {
      let amount = toBeTaxed;
      let scaleResult = 0;

      if (amount > SCALE_THRESHOLD) {
        amount -= SCALE_THRESHOLD;
        scaleResult = scaleResult + 900;
      } else {
        return (
          (amount * 0.09 + scaleResult) *
          (discountOptions.firstScaleDiscount ? 0.5 : 1)
        );
      }

      if (amount > SCALE_THRESHOLD) {
        amount -= SCALE_THRESHOLD;
        scaleResult = scaleResult + 2200;
      } else {
        return amount * 0.22 + scaleResult;
      }

      if (amount > SCALE_THRESHOLD) {
        amount -= SCALE_THRESHOLD;
        scaleResult = scaleResult + 2800;
      } else {
        return amount * 0.28 + scaleResult;
      }

      if (amount > SCALE_THRESHOLD) {
        amount -= SCALE_THRESHOLD;
        scaleResult = scaleResult + 3600;
      } else {
        return amount * 0.36 + scaleResult;
      }

      return amount * 0.44 + scaleResult;
    },
    [discountOptions.firstScaleDiscount]
  );

  useEffect(() => {
    if (hasError && (grossIncomeYearly || grossIncomeMonthly)) {
      return setBusinessHasError({ value: false });
    }
  }, [grossIncomeYearly, grossIncomeMonthly, hasError, setBusinessHasError]);

  const centralCalculation = () => {
    // setBusinessHasError({ value: false });
    // if (!grossIncomeYearly || !grossIncomeMonthly) {
    //   toast({
    //     title: "Λείπουν απαιτούμενα πεδία!",
    //     position: "top",
    //     isClosable: true,
    //     status: "warning",
    //   });
    //   return setBusinessHasError({ value: true });
    // }

    const grossPerYear = (grossIncomeYearly / 12) * taxYearDuration;

    const grossIncome = isGrossMonthly
      ? grossIncomeMonthly * taxYearDuration
      : grossPerYear;

    const insurancePerYear =
      taxationYearScales[taxationYear].insuranceScales[
        discountOptions.specialInsuranceScale ? 0 : insuranceScaleSelection
      ].amount * taxYearDuration;

    const insuranceValue = {
      month: insurancePerYear / taxYearDuration,
      year: insurancePerYear,
    };

    addBusinessDetail({
      value: insuranceValue,
      field: "insurance",
    });

    const taxableIncome =
      grossIncome - insurancePerYear - extraBusinessExpenses;

    const totalTax = calculateWithCurrentScales({
      toBeTaxed: taxableIncome,
    });

    const value = {
      month: totalTax / taxYearDuration,
      year: totalTax,
    };

    addBusinessDetail({
      value,
      field: "totalTax",
    });

    if (discountOptions.prePaidNextYearTax) {
      const taxInAdvance =
        totalTax *
        PRE_PAID_TAX_PERCENTAGE *
        (discountOptions.prePaidTaxDiscount ? PRE_PAID_TAX_DISCOUNT : 1);

      const taxInAdvanceValue = {
        month: taxInAdvance / taxYearDuration,
        year: taxInAdvance,
      };

      addBusinessDetail({
        value: taxInAdvanceValue,
        field: "taxInAdvance",
      });
    }

    const final =
      grossPerYear -
      totalTax -
      taxInAdvance.year -
      extraBusinessExpenses -
      insurancePerYear;

    const finalValue = {
      month: final / taxYearDuration,
      year: final,
    };

    addBusinessDetail({
      value: finalValue,
      field: "finalIncome",
    });
  };

  return { centralCalculation, getInsuranceTotal, hasError };
};
