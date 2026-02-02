import { useCallback } from "react";
import { useStore } from "store";
import { useToast } from "@chakra-ui/react";
import { roundNumberWithFixed } from "utils";
import { AGE_GROUPS } from "../constants";

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

  const SECOND_BRACKET_BY_CHILDREN = Object.freeze({
    0: 0.2,
    1: 0.18,
    2: 0.16,
    3: 0.09,
    // 4+ handled as full exemption 0–20k
  });

  function thirdBracketRate(children) {
    if (children <= 0) return 0.26;
    if (children === 1) return 0.24;
    if (children === 2) return 0.22;
    if (children === 3) return 0.2;
    // 4 children: 18%, then −2% for each extra child above 4
    return Math.max(0, 0.18 - 0.02 * (children - 4));
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function assertInputs(income, ageGroup, children) {
    if (!Number.isFinite(income) || income < 0) {
      throw new Error("taxableIncome must be non-negative");
    }
    if (!Object.values(AGE_GROUPS).includes(ageGroup)) {
      throw new Error("invalid ageGroup");
    }
    if (!Number.isInteger(children) || children < 0) {
      throw new Error("children must be a non-negative integer");
    }
  }

  /**
   * Age relief applies ONLY if taxableIncome <= 20,000.
   * If taxableIncome > 20,000 => no age relief at all (even for the first 20k).
   *
   * Children rules still apply as described (including 4+ => 0–20k exemption),
   * because those are not stated as conditional on total income in your screenshot.
   */
  function calculateTax2026Entrepreneur({ taxableIncome, ageGroup, children }) {
    assertInputs(taxableIncome, ageGroup, children);

    // Base rates (first 3 brackets affected by rules)
    let r1 = 0.09; // 0–10k
    let r2 = 0.2; // 10–20k
    let r3 = 0.26; // 20–30k

    // ---- Children rules ----
    if (children >= 4) {
      r1 = 0.0;
      r2 = 0.0;
    } else if (children in SECOND_BRACKET_BY_CHILDREN) {
      r2 = Math.min(r2, SECOND_BRACKET_BY_CHILDREN[children]);
    }
    r3 = Math.min(r3, thirdBracketRate(children));

    // ---- Age rules (STRICT on the 20k mark) ----
    if (taxableIncome <= 20_000) {
      if (ageGroup === AGE_GROUPS.U25) {
        r1 = Math.min(r1, 0.0);
        r2 = Math.min(r2, 0.0);
      } else if (ageGroup === AGE_GROUPS.A26_30) {
        r1 = Math.min(r1, 0.09);
        r2 = Math.min(r2, 0.09);
      }
      // A30P: no reduction
    }

    const brackets = [
      { from: 0, to: 10_000, rate: r1 },
      { from: 10_000, to: 20_000, rate: r2 },
      { from: 20_000, to: 30_000, rate: r3 },
      { from: 30_000, to: 40_000, rate: 0.34 },
      { from: 40_000, to: 60_000, rate: 0.39 },
      { from: 60_000, to: Infinity, rate: 0.44 },
    ];

    let tax = 0;
    const breakdown = [];

    for (const b of brackets) {
      if (taxableIncome <= b.from) break;
      const upper = Math.min(taxableIncome, b.to);
      const amount = Math.max(0, upper - b.from);
      const t = amount * b.rate;
      tax += t;

      if (amount > 0) {
        breakdown.push({
          from: b.from,
          to: b.to === Infinity ? null : b.to,
          amount: round2(amount),
          rate: b.rate,
          tax: round2(t),
        });
      }
    }

    return {
      taxableIncome,
      ageGroup,
      children,
      tax: round2(tax),
      appliedRates: {
        "0-10k": r1,
        "10-20k": r2,
        "20-30k": r3,
        "30-40k": 0.34,
        "40-60k": 0.39,
        "60k+": 0.44,
      },
      breakdown,
    };
  }

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
    [firstScaleDiscount],
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

    // Calculate tax based on taxation year
    let totalTax;

    switch (taxationYear) {
      case 2021:
      case 2022:
      case 2023:
      case 2024:
      case 2025:
        totalTax = calculateWithCurrentScales({
          toBeTaxed: taxableIncome,
        });
        break;

      case 2026:
        const { tax } = calculateTax2026Entrepreneur({
          taxableIncome: taxableIncome,
          ageGroup: ageGroup,
          children: numberOfChildren,
        });
        totalTax = tax;
        break;

      // Future years can be easily added:
      // case 2027:
      //   // Handle 2027's specific calculation
      //   break;
      // case 2028:
      //   // Handle 2028's specific calculation
      //   break;

      default:
        throw new Error(
          `Unsupported taxation year: ${taxationYear}. Please add configuration for this year.`,
        );
    }

    updateBusiness({
      totalTax: {
        month: findMonthAmount(totalTax),
        year: totalTax,
      },
    });

    const _taxInAdvance = withPrePaidDiscount(
      totalTax * PRE_PAID_TAX_PERCENTAGE,
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
