import { useCallback } from "react";
import { useStore } from "store";
import { useToast } from "@chakra-ui/react";

export const useCalculateBusiness = () => {
  const userDetails = useStore((state) => state.userDetails.business);
  const hasError = useStore((state) => state.userDetails.business.hasError);
  const updateBusiness = useStore((state) => state.updateBusiness);
  const updateBusinessTable = useStore((state) => state.updateBusinessTable);
  const setHasError = useStore((state) => state.setHasError);
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
    prePaidNextYearTax,
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

  const showError = () => {
    toast({
      title: "Λείπουν απαιτούμενα πεδία!",
      position: "top",
      isClosable: true,
      status: "warning",
    });

    return setHasError({ entity: "business", value: true });
  };

  const centralCalculation = () => {
    const throwError = !grossIncomeYearly || !grossIncomeMonthly;

    if (throwError) {
      showError();
    }

    // const findAmountPerYear = (amount, duration) => (amount / 12) * duration;
    // const grossPerYear = findAmountPerYear(grossIncomeYearly, taxYearDuration);
    const grossPerYear = (grossIncomeYearly / 12) * taxYearDuration;

    const grossIncome = isGrossMonthly
      ? grossIncomeMonthly * taxYearDuration
      : grossPerYear;

    // console.log(grossIncome, "grossIncome");
    // const getInsuranceAmount = () => {
    //   const scale = discountOptions.specialInsuranceScale
    //     ? 0 // 0 means special scale
    //     : insuranceScaleSelection;

    //   return taxationYearScales[taxationYear].insuranceScales[scale].amount;
    // };
    // const insurancePerYear = findAmountPerYear(
    //   getInsuranceAmount(),
    //   taxYearDuration
    // );
    const insurancePerYear =
      taxationYearScales[taxationYear].insuranceScales[
        discountOptions.specialInsuranceScale ? 0 : insuranceScaleSelection
      ].amount * taxYearDuration;

    // const findTaxableIncome = (gross, insurance, expenses) =>
    //   gross - insurance - expenses;
    // const taxableIncome = findTaxableIncome(
    //   grossIncome,
    //   insurancePerYear,
    //   extraBusinessExpenses
    // );
    const taxableIncome =
      grossIncome - insurancePerYear - extraBusinessExpenses;

    const totalTax = calculateWithCurrentScales({
      toBeTaxed: taxableIncome,
    });

    updateBusiness({
      totalTax: {
        month: totalTax / taxYearDuration,
        year: totalTax,
      },
    });

    // const findTaxInAdvance = (tax) => {
    //   let t = tax * PRE_PAID_TAX_PERCENTAGE;

    //   if (discountOptions.prePaidTaxDiscount) {
    //     t * PRE_PAID_TAX_DISCOUNT;
    //   }
    //   return t;
    // };

    const _taxInAdvance =
      totalTax *
      PRE_PAID_TAX_PERCENTAGE *
      (discountOptions.prePaidTaxDiscount ? PRE_PAID_TAX_DISCOUNT : 1);

    const taxInAdvanceValue = {
      month: _taxInAdvance / taxYearDuration,
      year: _taxInAdvance,
    };

    if (prePaidNextYearTax) {
      console.log(taxInAdvance, "taxInAdvance");
      console.log(_taxInAdvance, "_taxInAdvance");

      updateBusiness({
        taxInAdvance: taxInAdvanceValue,
      });

      updateBusinessTable({
        taxInAdvance: {
          month: _taxInAdvance / taxYearDuration,
          year: _taxInAdvance,
        },
      });
    }

    // const findFinal = (arr) => {
    // }
    // const final = findFinal([
    //   grossPerYear,
    //   totalTax,
    //   taxInAdvance.year,
    //   extraBusinessExpenses,
    //   insurancePerYear,
    // ]);

    const nextYearTax = prePaidNextYearTax ? taxInAdvanceValue.year : 0;

    const final =
      grossPerYear -
      totalTax -
      nextYearTax -
      extraBusinessExpenses -
      insurancePerYear;

    updateBusinessTable({
      grossIncome: {
        month: grossIncomeMonthly,
        year: grossPerYear,
      },
      finalIncome: {
        month: final / taxYearDuration,
        year: final,
      },
      insurance: {
        month: insurancePerYear / taxYearDuration,
        year: insurancePerYear,
      },
      finalTax: {
        month: totalTax / taxYearDuration,
        year: totalTax,
      },
      businessExpenses: {
        month: extraBusinessExpenses / taxYearDuration,
        year: extraBusinessExpenses,
      },
    });

    updateBusiness({
      finalIncome: {
        month: final / taxYearDuration,
        year: final,
      },
    });
  };

  return { centralCalculation, getInsuranceTotal, hasError };
};
