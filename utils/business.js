import { AGE_GROUPS } from "../constants";
import { roundMoney, toFixedNumber } from "./employee";

const PRE_PAID_TAX_DISCOUNT = 0.5;
const FIRST_SCALE_TAX_DISCOUNT = 0.5;
const SCALE_THRESHOLD = 10000;

const SECOND_BRACKET_BY_CHILDREN = Object.freeze({
  0: 0.2,
  1: 0.18,
  2: 0.16,
  3: 0.09,
  // 4+ handled as full exemption 0–20k
});

const thirdBracketRate = (children) => {
  if (children <= 0) return 0.26;
  if (children === 1) return 0.24;
  if (children === 2) return 0.22;
  if (children === 3) return 0.2;
  // 4 children: 18%, then −2% for each extra child above 4
  return Math.max(0, 0.18 - 0.02 * (children - 4));
};

const applyChildrenRules = (rates, children) => {
  if (children >= 4) {
    return {
      ...rates,
      r1: 0.0,
      r2: 0.0,
      r3: Math.min(rates.r3, thirdBracketRate(children)),
    };
  }

  if (!(children in SECOND_BRACKET_BY_CHILDREN)) {
    return {
      ...rates,
      r3: Math.min(rates.r3, thirdBracketRate(children)),
    };
  }

  return {
    ...rates,
    r2: Math.min(rates.r2, SECOND_BRACKET_BY_CHILDREN[children]),
    r3: Math.min(rates.r3, thirdBracketRate(children)),
  };
};

const applyAgeRules = (rates, taxableIncome, ageGroup) => {
  if (taxableIncome > 20_000) return rates;

  if (ageGroup === AGE_GROUPS.U25) {
    return {
      ...rates,
      r1: Math.min(rates.r1, 0.0),
      r2: Math.min(rates.r2, 0.0),
    };
  }

  if (ageGroup === AGE_GROUPS.A26_30) {
    return {
      ...rates,
      r1: Math.min(rates.r1, 0.09),
      r2: Math.min(rates.r2, 0.09),
    };
  }

  return rates;
};

const assertInputs = (income, ageGroup, children) => {
  if (!Number.isFinite(income) || income < 0) {
    throw new Error("taxableIncome must be non-negative");
  }
  if (!Object.values(AGE_GROUPS).includes(ageGroup)) {
    throw new Error("invalid ageGroup");
  }
  if (!Number.isInteger(children) || children < 0) {
    throw new Error("children must be a non-negative integer");
  }
};

/**
 * Age relief applies ONLY if taxableIncome <= 20,000.
 * If taxableIncome > 20,000 => no age relief at all (even for the first 20k).
 *
 * Children rules still apply as described (including 4+ => 0–20k exemption),
 * because those are not stated as conditional on total income.
 */
export const calculateTax2026Entrepreneur = ({
  taxableIncome,
  ageGroup,
  children,
}) => {
  assertInputs(taxableIncome, ageGroup, children);

  // Base rates (first 3 brackets affected by rules)
  const baseRates = { r1: 0.09, r2: 0.2, r3: 0.26 };

  const childrenRates = applyChildrenRules(baseRates, children);

  const { r1, r2, r3 } = applyAgeRules(childrenRates, taxableIncome, ageGroup);

  const brackets = [
    { from: 0, to: 10_000, rate: r1 },
    { from: 10_000, to: 20_000, rate: r2 },
    { from: 20_000, to: 30_000, rate: r3 },
    { from: 30_000, to: 40_000, rate: 0.34 },
    { from: 40_000, to: 60_000, rate: 0.39 },
    { from: 60_000, to: Infinity, rate: 0.44 },
  ];

  const breakdown = [];

  const tax = brackets.reduce((total, b) => {
    if (taxableIncome <= b.from) return total;

    const upper = Math.min(taxableIncome, b.to);
    const amount = Math.max(0, upper - b.from);
    const t = amount * b.rate;

    if (amount > 0) {
      breakdown.push({
        from: b.from,
        to: b.to === Infinity ? null : b.to,
        amount: toFixedNumber(amount, 2),
        rate: b.rate,
        tax: toFixedNumber(t, 2),
      });
    }

    return total + t;
  }, 0);

  return {
    taxableIncome,
    ageGroup,
    children,
    tax: toFixedNumber(tax, 2),
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
};

export const getInsuranceTotal = ({
  taxationYearScales,
  taxationYear,
  taxYearDuration,
  businessExpensesMonthOrYear,
  insuranceScaleSelection,
  specialInsuranceScale,
  type = "month",
}) => {
  const insuranceScale = specialInsuranceScale ? 0 : insuranceScaleSelection;
  const insurancePerMonth =
    taxationYearScales[taxationYear].insuranceScales[insuranceScale].amount;
  const isYear = businessExpensesMonthOrYear === "year" || type === "year";

  return isYear ? taxYearDuration * insurancePerMonth : insurancePerMonth;
};

export const applyPrePaidDiscount = (value, prePaidTaxDiscount) => {
  return toFixedNumber(
    prePaidTaxDiscount ? value * PRE_PAID_TAX_DISCOUNT : value,
    2,
  );
};

export const applyFirstScaleDiscount = (value, firstScaleDiscount) => {
  return toFixedNumber(
    firstScaleDiscount ? value * FIRST_SCALE_TAX_DISCOUNT : value,
    2,
  );
};

export const calculateBusinessScalesTax = ({
  toBeTaxed,
  firstScaleDiscount,
  scaleThreshold = SCALE_THRESHOLD,
}) => {
  let amount = toBeTaxed;
  let scaleResult = 0;

  if (amount > scaleThreshold) {
    amount -= scaleThreshold;
    scaleResult = scaleResult + 900;
  } else {
    return applyFirstScaleDiscount(
      amount * 0.09 + scaleResult,
      firstScaleDiscount,
    );
  }

  if (amount > scaleThreshold) {
    amount -= scaleThreshold;
    scaleResult = scaleResult + 2200;
  } else {
    return amount * 0.22 + scaleResult;
  }

  if (amount > scaleThreshold) {
    amount -= scaleThreshold;
    scaleResult = scaleResult + 2800;
  } else {
    return amount * 0.28 + scaleResult;
  }

  if (amount > scaleThreshold) {
    amount -= scaleThreshold;
    scaleResult = scaleResult + 3600;
  } else {
    return amount * 0.36 + scaleResult;
  }

  return amount * 0.44 + scaleResult;
};

export const calculateBusinessResults = ({
  userDetails,
  prePaidTaxPercentage = 0.55,
  withholdingTaxPercentage = 0.2,
}) => {
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

  const findYearAmount = (value) => value * taxYearDuration;
  const findMonthAmount = (value) => value / taxYearDuration;

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

  const taxableIncome = _grossIncome - insurancePerYear - extraBusinessExpenses;

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

  const totalTaxValue = {
    month: findMonthAmount(totalTax),
    year: totalTax,
  };

  const _taxInAdvance = applyPrePaidDiscount(
    totalTax * prePaidTaxPercentage,
    prePaidTaxDiscount,
  );

  const taxInAdvanceValue = {
    month: findMonthAmount(_taxInAdvance),
    year: _taxInAdvance,
  };

  const nextYearTax = prePaidNextYearTax ? taxInAdvanceValue.year : 0;

  const final =
    grossPerYear -
    (totalTax - previousYearTaxInAdvance) -
    nextYearTax -
    extraBusinessExpenses -
    insurancePerYear;

  const prePaidTaxAmount = withholdingTax
    ? grossIncome.month * withholdingTaxPercentage
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

  return {
    totalTax: totalTaxValue,
    taxInAdvanceValue,
    finalIncome: {
      month: findMonthAmount(final),
      year: final,
    },
    nextBusinessTable,
  };
};
