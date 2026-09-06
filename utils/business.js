import { AGE_GROUPS } from "../constants";
import { getBusinessRules } from "../rules";
import { roundMoney, toFixedNumber } from "./employee";
import { calculateIncomeTaxFromPolicy } from "./taxPolicy";

const DEFAULT_BUSINESS_RULES = getBusinessRules(2026);

const buildBreakdown = (taxableIncome, brackets) => {
  let previousLimit = 0;
  return brackets.flatMap((bracket) => {
    if (taxableIncome <= previousLimit) return [];
    const upperLimit = bracket.upTo ?? Infinity;
    const amount = Math.max(
      0,
      Math.min(taxableIncome, upperLimit) - previousLimit,
    );
    const from = previousLimit;
    previousLimit = upperLimit;
    return amount
      ? [
          {
            from,
            to: bracket.upTo,
            amount: toFixedNumber(amount, 2),
            rate: bracket.rate,
            tax: toFixedNumber(amount * bracket.rate, 2),
          },
        ]
      : [];
  });
};

export const calculateTax2026Entrepreneur = ({
  taxableIncome,
  ageGroup,
  children,
}) => {
  if (!Object.values(AGE_GROUPS).includes(ageGroup)) {
    throw new Error("invalid ageGroup");
  }

  const { tax, brackets } = calculateIncomeTaxFromPolicy({
    taxableIncome,
    policy: DEFAULT_BUSINESS_RULES.incomeTax,
    ageGroup,
    children,
  });
  const rateLabels = [
    "0-10k",
    "10-20k",
    "20-30k",
    "30-40k",
    "40-60k",
    "60k+",
  ];

  return {
    taxableIncome,
    ageGroup,
    children,
    tax,
    appliedRates: Object.fromEntries(
      brackets.map((bracket, index) => [rateLabels[index], bracket.rate]),
    ),
    breakdown: buildBreakdown(taxableIncome, brackets),
  };
};

export const getInsuranceTotal = ({
  rules,
  taxationYear,
  taxYearDuration,
  businessExpensesMonthOrYear,
  insuranceScaleSelection,
  specialInsuranceScale,
  type = "month",
}) => {
  const businessRules = rules ?? getBusinessRules(taxationYear);
  const insuranceScale = specialInsuranceScale
    ? businessRules.insurance.specialScale
    : insuranceScaleSelection;
  const insurancePerMonth =
    businessRules.insurance.monthlyAmounts[insuranceScale];

  if (insurancePerMonth === undefined) {
    throw new Error(
      `Insurance scale ${insuranceScale} is not configured for ${taxationYear}`,
    );
  }

  const isYear = businessExpensesMonthOrYear === "year" || type === "year";
  return isYear ? taxYearDuration * insurancePerMonth : insurancePerMonth;
};

export const applyPrePaidDiscount = (
  value,
  prePaidTaxDiscount,
  multiplier = DEFAULT_BUSINESS_RULES.taxPrepayment.discountMultiplier,
) =>
  toFixedNumber(prePaidTaxDiscount ? value * multiplier : value, 2);

export const applyFirstScaleDiscount = (
  value,
  firstScaleDiscount,
  multiplier = DEFAULT_BUSINESS_RULES.firstYearsDiscount.taxMultiplier,
) =>
  toFixedNumber(firstScaleDiscount ? value * multiplier : value, 2);

export const calculateBusinessScalesTax = ({
  toBeTaxed,
  firstScaleDiscount,
  policy = getBusinessRules(2025).incomeTax,
  discountRules = getBusinessRules(2025).firstYearsDiscount,
}) => {
  const { tax } = calculateIncomeTaxFromPolicy({
    taxableIncome: toBeTaxed,
    policy,
  });
  const canApplyDiscount =
    discountRules.enabled &&
    firstScaleDiscount &&
    toBeTaxed <= discountRules.maximumTaxableIncome;

  return applyFirstScaleDiscount(
    tax,
    canApplyDiscount,
    discountRules.taxMultiplier,
  );
};

export const calculateBusinessResults = ({ userDetails, rules }) => {
  const {
    grossIncome,
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
  const businessRules = rules ?? getBusinessRules(taxationYear);
  const { specialInsuranceScale, prePaidTaxDiscount, firstScaleDiscount } =
    discountOptions;
  const isGrossMonthly = grossMonthOrYear === "month";
  const findYearAmount = (value) => value * taxYearDuration;
  const findMonthAmount = (value) => value / taxYearDuration;
  const grossPerYear = findYearAmount(grossIncome.year / 12);
  const calculationGrossIncome = isGrossMonthly
    ? findYearAmount(grossIncome.month)
    : grossPerYear;
  const insurancePerYear = getInsuranceTotal({
    rules: businessRules,
    taxationYear,
    taxYearDuration,
    businessExpensesMonthOrYear,
    insuranceScaleSelection,
    specialInsuranceScale,
    type: "year",
  });
  const taxableIncome =
    calculationGrossIncome - insurancePerYear - extraBusinessExpenses;

  const totalTax =
    businessRules.incomeTax.kind === "progressive"
      ? calculateBusinessScalesTax({
          toBeTaxed: taxableIncome,
          firstScaleDiscount,
          policy: businessRules.incomeTax,
          discountRules: businessRules.firstYearsDiscount,
        })
      : calculateIncomeTaxFromPolicy({
          taxableIncome,
          policy: businessRules.incomeTax,
          ageGroup,
          children: numberOfChildren,
        }).tax;
  const totalTaxValue = {
    month: findMonthAmount(totalTax),
    year: totalTax,
  };
  const taxInAdvance = applyPrePaidDiscount(
    totalTax * businessRules.taxPrepayment.rate,
    prePaidTaxDiscount,
    businessRules.taxPrepayment.discountMultiplier,
  );
  const taxInAdvanceValue = {
    month: findMonthAmount(taxInAdvance),
    year: taxInAdvance,
  };
  const nextYearTax = prePaidNextYearTax ? taxInAdvanceValue.year : 0;
  const final =
    grossPerYear -
    (totalTax - previousYearTaxInAdvance) -
    nextYearTax -
    extraBusinessExpenses -
    insurancePerYear;
  const prePaidTaxAmount = withholdingTax
    ? grossIncome.month * businessRules.withholding.rate
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
    grossIncome: { month: grossIncome.month, year: grossPerYear },
    finalIncome: { month: findMonthAmount(final), year: final },
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
    discountOptions: { ...discountOptions },
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
    finalIncome: { month: findMonthAmount(final), year: final },
    nextBusinessTable,
  };
};
