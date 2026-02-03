import { useStore } from "store";
import { useToast } from "@chakra-ui/react";
import {
  roundMoney,
  calculateTax2026Entrepreneur,
  getInsuranceTotal,
  applyPrePaidDiscount,
  calculateBusinessScalesTax,
} from "utils";

// TODO: make these dynamic depending the year
const WITHHOLDING_TAX_PERCENTAGE = 0.2;
const PRE_PAID_TAX_PERCENTAGE = 0.55;

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
    numberOfChildren,
    ageGroup,
  } = userDetails;
  const { specialInsuranceScale, prePaidTaxDiscount, firstScaleDiscount } =
    discountOptions;
  const isGrossMonthly = grossMonthOrYear === "month";

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
      return showError();
    }

    const grossPerYear = findYearAmount(grossIncome.year / 12);
    const _grossIncome = isGrossMonthly
      ? findYearAmount(grossIncome.month)
      : grossPerYear;

    const insurancePerYear = getInsuranceTotal({
      taxationYearScales,
      taxationYear,
      taxYearDuration,
      businessExpensesMonthOrYear,
      insuranceScaleSelection,
      specialInsuranceScale,
      type: "year",
    });

    const taxableIncome =
      _grossIncome - insurancePerYear - extraBusinessExpenses;

    // Calculate tax based on taxation year
    const taxByYear = {
      2021: () =>
        calculateBusinessScalesTax({
          toBeTaxed: taxableIncome,
          firstScaleDiscount,
        }),
      2022: () =>
        calculateBusinessScalesTax({
          toBeTaxed: taxableIncome,
          firstScaleDiscount,
        }),
      2023: () =>
        calculateBusinessScalesTax({
          toBeTaxed: taxableIncome,
          firstScaleDiscount,
        }),
      2024: () =>
        calculateBusinessScalesTax({
          toBeTaxed: taxableIncome,
          firstScaleDiscount,
        }),
      2025: () =>
        calculateBusinessScalesTax({
          toBeTaxed: taxableIncome,
          firstScaleDiscount,
        }),
      2026: () =>
        calculateTax2026Entrepreneur({
          taxableIncome: taxableIncome,
          ageGroup: ageGroup,
          children: numberOfChildren,
        }).tax,
    };

    const totalTax = taxByYear[taxationYear]?.();
    if (totalTax === undefined) {
      throw new Error(
        `Unsupported taxation year: ${taxationYear}. Please add configuration for this year.`,
      );
    }

    const nextBusinessState = {
      totalTax: {
        month: findMonthAmount(totalTax),
        year: totalTax,
      },
    };

    updateBusiness(nextBusinessState);

    const _taxInAdvance = applyPrePaidDiscount(
      totalTax * PRE_PAID_TAX_PERCENTAGE,
      prePaidTaxDiscount,
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
      (totalTax - previousYearTaxInAdvance) -
      nextYearTax -
      extraBusinessExpenses -
      insurancePerYear;

    const prePaidTaxAmount = withholdingTax
      ? grossIncome.month * WITHHOLDING_TAX_PERCENTAGE
      : 0;

    const roundedPrePaidTaxAmount = roundMoney(prePaidTaxAmount);

    const finalTaxAmount = {
      month: withholdingTax
        ? findMonthAmount(totalTax) - roundedPrePaidTaxAmount
        : findMonthAmount(totalTax),
      year: withholdingTax
        ? totalTax - findYearAmount(roundedPrePaidTaxAmount)
        : totalTax,
    };

    const finalTaxAmountWithPrePaid = {
      month: finalTaxAmount.month - findMonthAmount(previousYearTaxInAdvance),
      year: finalTaxAmount.year - previousYearTaxInAdvance,
    };

    const nextBusinessTable = {
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
        month: roundedPrePaidTaxAmount,
        year: findYearAmount(roundedPrePaidTaxAmount),
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
    };

    updateBusinessTable(nextBusinessTable);

    updateBusiness({
      finalIncome: {
        month: findMonthAmount(final),
        year: final,
      },
      dirtyFormState: [],
    });
  };

  const getInsuranceTotalForUI = (type = "month") =>
    getInsuranceTotal({
      taxationYearScales,
      taxationYear,
      taxYearDuration,
      businessExpensesMonthOrYear,
      insuranceScaleSelection,
      specialInsuranceScale,
      type,
    });

  return {
    centralCalculation,
    getInsuranceTotal: getInsuranceTotalForUI,
    hasError,
  };
};
