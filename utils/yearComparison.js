import { supportedTaxYears } from "../rules";
import { calculateBusinessResults } from "./business";
import { calculateEmployeeForGrossMonth } from "./employeeCalculation";

const isSupportedYear = (year) => supportedTaxYears.includes(Number(year));

export const getDefaultComparisonYears = (selectedYear) => {
  const year = isSupportedYear(selectedYear)
    ? Number(selectedYear)
    : supportedTaxYears[0];
  const index = supportedTaxYears.indexOf(year);
  const otherYear = supportedTaxYears[index + 1] ?? supportedTaxYears[index - 1];
  return [otherYear, year].sort((a, b) => a - b);
};

export const parseComparisonYears = (value, selectedYear) => {
  const parsed = typeof value === "string"
    ? value.split(",").map(Number)
    : [];

  return parsed.length === 2 && parsed.every(isSupportedYear)
    ? parsed
    : getDefaultComparisonYears(selectedYear);
};

export const removeComparisonParams = (query = {}) => {
  const nextQuery = { ...query };
  delete nextQuery.compare;
  delete nextQuery.compareInput;
  return nextQuery;
};

const sharedFields = {
  employee: [
    "activeInput",
    "grossIncomeMonthly",
    "grossIncomeYearly",
    "finalIncomeMonthly",
    "finalIncomeYearly",
    "salaryMonthCount",
    "numberOfChildren",
    "ageGroup",
    "discountOptions",
  ],
  business: [
    "grossIncome",
    "taxYearDuration",
    "grossMonthOrYear",
    "businessExpensesMonthOrYear",
    "insuranceScaleSelection",
    "discountOptions",
    "prePaidNextYearTax",
    "withholdingTax",
    "extraBusinessExpenses",
    "previousYearTaxInAdvance",
    "numberOfChildren",
    "ageGroup",
    "minimumPresumedIncome",
  ],
};

export const getComparisonInput = (entity, details) => Object.fromEntries(
  sharedFields[entity].map((field) => [field, details[field]]),
);

export const serializeComparisonInput = (entity, details) => JSON.stringify({
  version: 1,
  entity,
  input: getComparisonInput(entity, details),
});

export const parseComparisonInput = (entity, value) => {
  if (typeof value !== "string") return null;
  try {
    const payload = JSON.parse(value);
    if (
      payload?.version !== 1 ||
      payload?.entity !== entity ||
      !payload.input ||
      typeof payload.input !== "object" ||
      Array.isArray(payload.input)
    ) return null;

    return Object.fromEntries(
      sharedFields[entity]
        .filter((field) => Object.prototype.hasOwnProperty.call(payload.input, field))
        .map((field) => [field, payload.input[field]]),
    );
  } catch {
    return null;
  }
};

export const getDifference = (from, to) => {
  const annual = to.year - from.year;
  const monthly = to.month - from.month;
  return {
    annual,
    monthly,
    percentage: from.year === 0 ? (to.year === 0 ? 0 : null) : annual / Math.abs(from.year) * 100,
  };
};

const employeeResultForYear = (details, year) => {
  const input = { ...details, taxationYear: year };
  let grossMonth = details.grossIncomeMonthly;
  let result;

  if (details.activeInput === "final") {
    for (let candidate = details.finalIncomeMonthly * 2; candidate >= 0; candidate--) {
      const candidateResult = calculateEmployeeForGrossMonth(input, candidate);
      if (candidateResult.finalIncomeMonthly === details.finalIncomeMonthly) {
        grossMonth = candidate;
        result = candidateResult;
        break;
      }
    }
  }

  result ??= calculateEmployeeForGrossMonth(input, grossMonth);
  const state = result.calculatedState;
  const months = details.salaryMonthCount;
  const gross = { month: grossMonth, year: grossMonth * months };
  const credit = {
    month: state.childrenDiscountAmount.year / months,
    year: state.childrenDiscountAmount.year,
  };

  return {
    year,
    metrics: {
      insurance: state.insurance,
      taxableIncome: state.taxableIncome,
      tax: state.finalTax,
      adjustment: credit,
      netIncome: {
        month: result.finalIncomeMonthly,
        year: result.finalIncomeYearly,
      },
    },
    grossIncome: gross,
  };
};

const businessResultForYear = (details, year) => {
  const result = calculateBusinessResults({
    userDetails: { ...details, taxationYear: year },
  });

  return {
    year,
    metrics: {
      insurance: result.nextBusinessTable.insurance,
      taxableIncome: result.taxableIncome,
      accountingProfit: result.accountingProfit,
      presumedIncome: result.presumedIncome,
      tax: result.totalTax,
      adjustment: details.prePaidNextYearTax
        ? result.taxInAdvanceValue
        : { month: 0, year: 0 },
      netIncome: result.finalIncome,
    },
    grossIncome: result.nextBusinessTable.grossIncome,
  };
};

export const calculateYearComparison = (entity, details, years) => {
  const calculator = entity === "employee"
    ? employeeResultForYear
    : businessResultForYear;
  const results = years.map((year) => calculator(details, Number(year)));
  const differences = Object.fromEntries(
    Object.keys(results[0].metrics).map((key) => [
      key,
      getDifference(results[0].metrics[key], results[1].metrics[key]),
    ]),
  );

  return { results, differences };
};
