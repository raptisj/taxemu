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
    prePaidNextYearTax,
    withholdingTax,
    extraBusinessExpenses,
    previousYearTaxInAdvance,
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

  const WITHHOLDING_TAX_PERCENTAGE = 0.2;
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

    const grossPerYear = (grossIncomeYearly / 12) * taxYearDuration;

    const grossIncome = isGrossMonthly
      ? grossIncomeMonthly * taxYearDuration
      : grossPerYear;

    const insurancePerYear =
      taxationYearScales[taxationYear].insuranceScales[
        discountOptions.specialInsuranceScale ? 0 : insuranceScaleSelection
      ].amount * taxYearDuration;

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

    const _taxInAdvance =
      totalTax *
      PRE_PAID_TAX_PERCENTAGE *
      (discountOptions.prePaidTaxDiscount ? PRE_PAID_TAX_DISCOUNT : 1);

    const taxInAdvanceValue = {
      month: _taxInAdvance / taxYearDuration,
      year: _taxInAdvance,
    };

    if (prePaidNextYearTax) {
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

    const nextYearTax = prePaidNextYearTax ? taxInAdvanceValue.year : 0;

    const final =
      grossPerYear -
      totalTax -
      nextYearTax -
      extraBusinessExpenses -
      insurancePerYear;

    const prePaidTaxAmount = withholdingTax
      ? grossIncomeMonthly * WITHHOLDING_TAX_PERCENTAGE
      : 0;

    const finalTaxAmount = {
      month: withholdingTax
        ? totalTax / taxYearDuration - Math.round(prePaidTaxAmount)
        : totalTax / taxYearDuration,
      year: withholdingTax
        ? totalTax - Math.round(prePaidTaxAmount) * taxYearDuration
        : totalTax,
    };

    const finalTaxAmountWithPrePaid = {
      month: finalTaxAmount.month - previousYearTaxInAdvance / taxYearDuration,
      year: finalTaxAmount.year - previousYearTaxInAdvance,
    };

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
      finalTax: finalTaxAmountWithPrePaid,
      businessExpenses: {
        month: extraBusinessExpenses / taxYearDuration,
        year: extraBusinessExpenses,
      },
      withholdingTaxAmount: {
        month: Math.round(prePaidTaxAmount),
        year: Math.round(prePaidTaxAmount) * taxYearDuration,
      },
      withholdingTax,
      taxationYear,
      taxYearDuration,
      grossMonthOrYear,
      discountOptions: {
        ...discountOptions,
      },
      insuranceScaleSelection,
      extraBusinessExpenses,
      previousYearTaxInAdvance: {
        month: previousYearTaxInAdvance / taxYearDuration,
        year: previousYearTaxInAdvance,
      },
      prePaidNextYearTax,
    });

    updateBusiness({
      finalIncome: {
        month: final / taxYearDuration,
        year: final,
      },
      dirtyFormState: [],
    });
  };

  return { centralCalculation, getInsuranceTotal, hasError };
};
