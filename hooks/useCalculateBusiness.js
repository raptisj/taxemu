import { useCallback } from "react";
import { useStore } from "store";
import { useToast } from "@chakra-ui/react";
import { roundNumberWithFixed } from "utils";

export const useCalculateBusiness = () => {
  const userDetails = useStore((state) => state.userDetails.business);
  const hasError = useStore((state) => state.userDetails.business.hasError);
  const updateBusiness = useStore((state) => state.updateBusiness);
  const updateBusinessTable = useStore((state) => state.updateBusinessTable);
  const setHasError = useStore((state) => state.setHasError);
  const toast = useToast();

  const {
    grossIncome,
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
  const { specialInsuranceScale, prePaidTaxDiscount, firstScaleDiscount } =
    discountOptions;
  const isGrossMonthly = grossMonthOrYear === "month";

  const getInsuranceTotal = (type = "month") => {
    const insuranceScale = specialInsuranceScale ? 0 : insuranceScaleSelection;
    const insurancePerMonth =
      taxationYearScales[taxationYear].insuranceScales[insuranceScale].amount;
    const isYear = businessExpensesMonthOrYear === "year" || type === "year";

    return isYear ? taxYearDuration * insurancePerMonth : insurancePerMonth;
  };

  const withPrePaidDiscount = (value) => {
    if (prePaidTaxDiscount) {
      return roundNumberWithFixed(value * PRE_PAID_TAX_DISCOUNT);
    }

    return roundNumberWithFixed(value);
  };

  const withFirstScaleDiscount = (value) => {
    if (firstScaleDiscount) {
      return roundNumberWithFixed(value * FIRST_SCALE_TAX_DISCOUNT);
    }

    return roundNumberWithFixed(value);
  };

  // TODO: make these dynamic depending the year
  const WITHHOLDING_TAX_PERCENTAGE = 0.2;
  const PRE_PAID_TAX_DISCOUNT = 0.5;
  const FIRST_SCALE_TAX_DISCOUNT = 0.5;
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
        return withFirstScaleDiscount(amount * 0.09 + scaleResult);
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
    [firstScaleDiscount]
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

  const findYearAmount = (value) => value * taxYearDuration;
  const findMonthAmount = (value) => value / taxYearDuration;

  const centralCalculation = () => {
    const throwError = !grossIncome.year || !grossIncome.month;

    if (throwError) {
      showError();
    }

    const grossPerYear = findYearAmount(grossIncome.year / 12);
    const _grossIncome = isGrossMonthly
      ? findYearAmount(grossIncome.month)
      : grossPerYear;

    const insurancePerYear = getInsuranceTotal("year");

    const taxableIncome =
      _grossIncome - insurancePerYear - extraBusinessExpenses;

    const totalTax = calculateWithCurrentScales({
      toBeTaxed: taxableIncome,
    });

    updateBusiness({
      totalTax: {
        month: findMonthAmount(totalTax),
        year: totalTax,
      },
    });

    const _taxInAdvance = withPrePaidDiscount(
      totalTax * PRE_PAID_TAX_PERCENTAGE
    );

    const taxInAdvanceValue = {
      month: findMonthAmount(_taxInAdvance),
      year: _taxInAdvance,
    };

    if (prePaidNextYearTax) {
      updateBusiness({
        taxInAdvance: taxInAdvanceValue,
      });

      updateBusinessTable({
        taxInAdvance: taxInAdvanceValue,
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
      ? grossIncome.month * WITHHOLDING_TAX_PERCENTAGE
      : 0;

    const finalTaxAmount = {
      month: withholdingTax
        ? findMonthAmount(totalTax) - Math.round(prePaidTaxAmount)
        : findMonthAmount(totalTax),
      year: withholdingTax
        ? totalTax - findYearAmount(Math.round(prePaidTaxAmount))
        : totalTax,
    };

    const finalTaxAmountWithPrePaid = {
      month: finalTaxAmount.month - findMonthAmount(previousYearTaxInAdvance),
      year: finalTaxAmount.year - previousYearTaxInAdvance,
    };

    updateBusinessTable({
      grossIncome: {
        month: grossIncome.month,
        year: grossPerYear,
      },
      finalIncome: {
        month: findMonthAmount(final),
        year: final,
      },
      insurance: {
        month: findMonthAmount(insurancePerYear),
        year: insurancePerYear,
      },
      finalTax: finalTaxAmountWithPrePaid,
      businessExpenses: {
        month: findMonthAmount(extraBusinessExpenses),
        year: extraBusinessExpenses,
      },
      withholdingTaxAmount: {
        month: Math.round(prePaidTaxAmount),
        year: findYearAmount(Math.round(prePaidTaxAmount)),
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
        month: findMonthAmount(previousYearTaxInAdvance),
        year: previousYearTaxInAdvance,
      },
      prePaidNextYearTax,
    });

    updateBusiness({
      finalIncome: {
        month: findMonthAmount(final),
        year: final,
      },
      dirtyFormState: [],
    });
  };

  return { centralCalculation, getInsuranceTotal, hasError };
};
