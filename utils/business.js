import { AGE_GROUPS } from "../constants";
import { getBusinessRules } from "../rules";
import { roundMoney, toFixedNumber } from "./employee";
import {
  buildTaxBreakdown,
  calculateIncomeTaxFromPolicy,
} from "./taxPolicy";

const DEFAULT_BUSINESS_RULES = getBusinessRules(2026);

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
    breakdown: buildTaxBreakdown(taxableIncome, brackets),
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
  const insurancePerMonth = getInsuranceMonthlyAmounts({
    rules: businessRules,
  })[insuranceScale];

  if (insurancePerMonth === undefined) {
    throw new Error(
      `Insurance scale ${insuranceScale} is not configured for ${taxationYear}`,
    );
  }

  const isYear = businessExpensesMonthOrYear === "year" || type === "year";
  return isYear ? taxYearDuration * insurancePerMonth : insurancePerMonth;
};

export const getInsuranceMonthlyAmounts = ({ rules, taxationYear }) => {
  const businessRules = rules ?? getBusinessRules(taxationYear);
  const unemploymentContribution =
    businessRules.insurance.monthlyUnemploymentContribution ?? 0;

  return businessRules.insurance.monthlyAmounts.map((amount) =>
    toFixedNumber(amount + unemploymentContribution, 2),
  );
};

export const applyPrePaidDiscount = (
  value,
  prePaidTaxDiscount,
  multiplier = DEFAULT_BUSINESS_RULES.taxPrepayment.discountMultiplier,
) =>
  toFixedNumber(prePaidTaxDiscount ? value * multiplier : value, 2);

export const calculateTaxPrepayment = ({
  incomeTax,
  withholdingTax,
  rate,
  prePaidTaxDiscount,
  discountMultiplier,
  minimumAssessmentAmount,
}) => {
  const advanceAfterWithholding = Math.max(
    0,
    incomeTax * rate - withholdingTax,
  );
  const discountedAdvance = applyPrePaidDiscount(
    advanceAfterWithholding,
    prePaidTaxDiscount,
    discountMultiplier,
  );

  return discountedAdvance <= minimumAssessmentAmount
    ? 0
    : discountedAdvance;
};

export const applyFirstScaleDiscount = (
  value,
  firstScaleDiscount,
  multiplier = DEFAULT_BUSINESS_RULES.firstYearsDiscount.taxMultiplier,
) =>
  toFixedNumber(firstScaleDiscount ? value * multiplier : value, 2);

export const calculateBusinessScalesTax = ({
  toBeTaxed,
  grossIncome = toBeTaxed,
  firstScaleDiscount,
  policy = getBusinessRules(2025).incomeTax,
  discountRules = getBusinessRules(2025).firstYearsDiscount,
  ageGroup = AGE_GROUPS.A30P,
  children = 0,
}) => {
  const { brackets } = calculateIncomeTaxFromPolicy({
    taxableIncome: toBeTaxed,
    policy,
    ageGroup,
    children,
  });
  const canApplyDiscount =
    discountRules.enabled &&
    firstScaleDiscount &&
    grossIncome <= discountRules.maximumGrossIncome;
  const effectiveBrackets = canApplyDiscount
    ? brackets.map((bracket, index) =>
        index === 0
          ? {
              ...bracket,
              rate: bracket.rate * discountRules.taxMultiplier,
            }
          : bracket,
      )
    : brackets;
  const { tax } = calculateIncomeTaxFromPolicy({
    taxableIncome: toBeTaxed,
    policy: { kind: "progressive", brackets: effectiveBrackets },
  });

  return toFixedNumber(tax, 2);
};

const getBusinessAgeFactor = (businessAge) => {
  if (businessAge <= 3) return 0;
  if (businessAge === 4) return 1 / 3;
  if (businessAge === 5) return 2 / 3;
  return 1;
};

const getExperienceFactor = (businessAge) => {
  if (businessAge <= 6) return 1;
  if (businessAge <= 9) return 1.1;
  if (businessAge <= 12) return 1.21;
  return 1.331;
};

export const calculateMinimumPresumedBusinessIncome = ({
  taxationYear,
  annualTurnover,
  minimumPresumedIncome,
  rules,
}) => {
  const businessRules = rules ?? getBusinessRules(taxationYear);
  const policy = businessRules.minimumPresumedIncome;

  if (!policy?.enabled) {
    return {
      applies: false,
      amount: 0,
      breakdown: null,
    };
  }

  const details = minimumPresumedIncome ?? {};
  const businessAge = Number(details.businessAge);
  if (!Number.isInteger(businessAge) || businessAge < 1) {
    throw new Error("businessAge must be a positive integer");
  }

  const hasAdjustments = details.hasAdjustments === true;
  const employee = hasAdjustments && details.employeeAdjustment;
  const turnover = hasAdjustments && details.turnoverAdjustment;
  const otherIncome = hasAdjustments && details.otherIncomeAdjustment;
  const relief = hasAdjustments && details.reliefAdjustment;
  const reliefType = relief ? details.reliefType : "none";

  const annualMinimumSalary =
    policy.monthlyMinimumSalary * policy.salaryPaymentsPerYear;
  const experienceFactor = getExperienceFactor(businessAge);
  const wageComponent = annualMinimumSalary * experienceFactor;
  const annualPayrollCost = employee
    ? Math.max(0, Number(details.annualPayrollCost) || 0)
    : 0;
  const payrollComponent = Math.min(
    annualPayrollCost * policy.payrollRate,
    policy.payrollAdditionCap,
  );
  const highestPaidEmployeeGross = employee
    ? Math.max(0, Number(details.highestPaidEmployeeGross) || 0)
    : 0;
  const employeeComparisonAmount = Math.min(
    highestPaidEmployeeGross,
    policy.highestEmployeeCap,
  );
  const kadAverageTurnover = turnover
    ? Math.max(0, Number(details.kadAverageTurnover) || 0)
    : 0;
  const turnoverComponent = turnover
    ? Math.max(0, annualTurnover - kadAverageTurnover) * policy.turnoverRate
    : 0;

  let article28AAmount;
  if (policy.highestEmployeeComparison === "baseComponent") {
    article28AAmount =
      Math.max(wageComponent, employeeComparisonAmount) +
      payrollComponent +
      turnoverComponent;
  } else {
    const componentTotal =
      wageComponent + payrollComponent + turnoverComponent;
    article28AAmount = Math.max(componentTotal, employeeComparisonAmount);
  }
  article28AAmount = Math.min(article28AAmount, policy.overallCap);

  const eligibleOperatingDays =
    reliefType === "limited"
      ? Math.min(365, Math.max(0, Number(details.eligibleOperatingDays) || 0))
      : 365;
  const durationFactor = eligibleOperatingDays / 365;
  const businessAgeFactor = getBusinessAgeFactor(businessAge);
  const reliefFactor =
    reliefType === "exempt" ? 0 : reliefType === "half" ? 0.5 : 1;
  const incomeOffsets = otherIncome
    ? Math.max(0, Number(details.otherIncome) || 0)
    : 0;
  const money = (value) => toFixedNumber(value, 2);
  // The E1 calculation applies Article 28B income offsets before the
  // exemptions/reductions of Article 28C paragraphs 2 and 3.
  const adjustedBeforeOffsets =
    article28AAmount * durationFactor * businessAgeFactor;
  const afterIncomeOffsets = Math.max(0, adjustedBeforeOffsets - incomeOffsets);
  const amount = money(afterIncomeOffsets * reliefFactor);

  return {
    applies: amount > 0,
    amount,
    breakdown: {
      annualMinimumSalary: money(annualMinimumSalary),
      experienceFactor,
      wageComponent: money(wageComponent),
      payrollComponent: money(payrollComponent),
      turnoverComponent: money(turnoverComponent),
      employeeComparisonAmount: money(employeeComparisonAmount),
      article28AAmount: money(article28AAmount),
      durationFactor,
      businessAgeFactor,
      reliefFactor,
      incomeOffsets: money(incomeOffsets),
      afterIncomeOffsets: money(afterIncomeOffsets),
    },
  };
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
    minimumPresumedIncome,
  } = userDetails;
  const businessRules = rules ?? getBusinessRules(taxationYear);
  const { specialInsuranceScale, prePaidTaxDiscount, firstScaleDiscount } =
    discountOptions;
  const isGrossMonthly = grossMonthOrYear === "month";
  const findPeriodAmount = (value) => value * taxYearDuration;
  const findMonthAmount = (value) => value / taxYearDuration;
  const periodGrossIncome = isGrossMonthly
    ? findPeriodAmount(grossIncome.month)
    : grossIncome.year;
  const grossPerMonth = findMonthAmount(periodGrossIncome);
  const insurancePerYear = getInsuranceTotal({
    rules: businessRules,
    taxationYear,
    taxYearDuration,
    businessExpensesMonthOrYear,
    insuranceScaleSelection,
    specialInsuranceScale,
    type: "year",
  });
  const accountingProfit = Math.max(
    0,
    periodGrossIncome - insurancePerYear - extraBusinessExpenses,
  );
  const presumedIncomeResult = calculateMinimumPresumedBusinessIncome({
    taxationYear,
    annualTurnover: periodGrossIncome,
    minimumPresumedIncome,
    rules: businessRules,
  });
  const taxableIncome = Math.max(accountingProfit, presumedIncomeResult.amount);

  const totalTax = calculateBusinessScalesTax({
    toBeTaxed: taxableIncome,
    grossIncome: periodGrossIncome,
    firstScaleDiscount,
    policy: businessRules.incomeTax,
    discountRules: businessRules.firstYearsDiscount,
    ageGroup,
    children: numberOfChildren,
  });
  const totalTaxValue = {
    month: findMonthAmount(totalTax),
    year: totalTax,
  };
  const prePaidTaxAmount = withholdingTax
    ? grossPerMonth * businessRules.withholding.rate
    : 0;
  const roundedPrePaidTaxAmount = roundMoney(prePaidTaxAmount);
  const annualWithholdingTax = findPeriodAmount(roundedPrePaidTaxAmount);
  const taxInAdvance = calculateTaxPrepayment({
    incomeTax: totalTax,
    withholdingTax: annualWithholdingTax,
    rate: businessRules.taxPrepayment.rate,
    prePaidTaxDiscount,
    discountMultiplier: businessRules.taxPrepayment.discountMultiplier,
    minimumAssessmentAmount:
      businessRules.taxPrepayment.minimumAssessmentAmount,
  });
  const taxInAdvanceValue = {
    month: findMonthAmount(taxInAdvance),
    year: taxInAdvance,
  };
  const nextYearTax = prePaidNextYearTax ? taxInAdvanceValue.year : 0;
  const final =
    periodGrossIncome -
    (totalTax - previousYearTaxInAdvance) -
    nextYearTax -
    extraBusinessExpenses -
    insurancePerYear;
  const finalTaxAmount = {
    month: withholdingTax
      ? findMonthAmount(totalTax) - roundedPrePaidTaxAmount
      : findMonthAmount(totalTax),
    year: withholdingTax
      ? totalTax - annualWithholdingTax
      : totalTax,
  };
  const finalTaxAmountWithPrePaid = {
    month: finalTaxAmount.month - findMonthAmount(previousYearTaxInAdvance),
    year: finalTaxAmount.year - previousYearTaxInAdvance,
  };
  const nextBusinessTable = {
    grossIncome: { month: grossPerMonth, year: periodGrossIncome },
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
    taxableIncome: {
      month: findMonthAmount(taxableIncome),
      year: taxableIncome,
    },
    accountingProfit: {
      month: findMonthAmount(accountingProfit),
      year: accountingProfit,
    },
    presumedIncome: {
      month: findMonthAmount(presumedIncomeResult.amount),
      year: presumedIncomeResult.amount,
    },
    presumedIncomeBreakdown: presumedIncomeResult.breakdown,
    withholdingTaxAmount: {
      month: roundedPrePaidTaxAmount,
      year: annualWithholdingTax,
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
    taxableIncome: {
      month: findMonthAmount(taxableIncome),
      year: taxableIncome,
    },
    accountingProfit: {
      month: findMonthAmount(accountingProfit),
      year: accountingProfit,
    },
    presumedIncome: {
      month: findMonthAmount(presumedIncomeResult.amount),
      year: presumedIncomeResult.amount,
    },
    presumedIncomeBreakdown: presumedIncomeResult.breakdown,
    nextBusinessTable,
  };
};
