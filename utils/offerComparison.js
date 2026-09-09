import { getTaxRules, latestTaxYear, supportedTaxYears } from "../rules";
import { calculateBusinessResults } from "./business";
import { calculateEmployeeForGrossMonth } from "./employeeCalculation";
import { roundMoney } from "./employee";

export const OFFER_COMPARISON_MODES = Object.freeze({
  BUDGET: "budget",
  EMPLOYEE: "employee",
  FREELANCER: "freelancer",
  BOTH: "both",
});

export const OFFER_PERIODS = Object.freeze({
  MONTH: "month",
  YEAR: "year",
});

export const AVERAGE_WORKING_DAYS_PER_MONTH = 21.75;

export const createDefaultOfferComparisonInput = () => ({
  mode: OFFER_COMPARISON_MODES.EMPLOYEE,
  taxationYear: latestTaxYear,
  companyBudget: 0,
  employeeOfferAmount: 0,
  employeeOfferPeriod: OFFER_PERIODS.YEAR,
  salaryMonthCount: 14,
  freelancerOfferAmount: 0,
  freelancerOfferPeriod: OFFER_PERIODS.MONTH,
  billableMonths: 12,
  unpaidLeaveDays: 20,
  leaveIsBillable: false,
  businessExpensesAnnual: 2400,
  insuranceScaleSelection: 1,
  numberOfChildren: 0,
  ageGroup: "A30P",
  returnBaseInland: false,
  firstScaleDiscount: false,
  specialInsuranceScale: false,
  prePaidNextYearTax: true,
  prePaidTaxDiscount: false,
  previousYearTaxInAdvance: 0,
  withholdingTax: false,
  vatRate: getTaxRules(latestTaxYear).business.invoice.vatRates[0],
});

const finiteNonNegative = (value) =>
  Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;

export const getEffectiveBillableMonths = ({
  billableMonths,
  unpaidLeaveDays,
  leaveIsBillable,
}) => {
  const months = finiteNonNegative(billableMonths);
  const leaveAdjustment = leaveIsBillable
    ? 0
    : finiteNonNegative(unpaidLeaveDays) / AVERAGE_WORKING_DAYS_PER_MONTH;
  return Math.max(0, months - leaveAdjustment);
};

export const getAnnualEmployeeOffer = (input) => {
  const amount = finiteNonNegative(input.employeeOfferAmount);
  return input.employeeOfferPeriod === OFFER_PERIODS.MONTH
    ? amount * finiteNonNegative(input.salaryMonthCount)
    : amount;
};

export const getAnnualFreelancerOffer = (input) => {
  const amount = finiteNonNegative(input.freelancerOfferAmount);
  return input.freelancerOfferPeriod === OFFER_PERIODS.MONTH
    ? amount * getEffectiveBillableMonths(input)
    : amount;
};

const employeeDetails = (input) => ({
  salaryMonthCount: finiteNonNegative(input.salaryMonthCount),
  taxationYear: Number(input.taxationYear),
  numberOfChildren: Math.trunc(finiteNonNegative(input.numberOfChildren)),
  ageGroup: input.ageGroup,
  discountOptions: { returnBaseInland: Boolean(input.returnBaseInland) },
});

export const calculateEmployeeOffer = (input, annualGross) => {
  const salaryMonthCount = finiteNonNegative(input.salaryMonthCount);
  if (!salaryMonthCount) return null;
  const grossIncome = finiteNonNegative(annualGross);
  const calculation = calculateEmployeeForGrossMonth(
    employeeDetails(input),
    grossIncome / salaryMonthCount,
  );
  const state = calculation.calculatedState;

  return {
    annualGross: grossIncome,
    grossPerSalary: grossIncome / salaryMonthCount,
    salaryMonthCount,
    employeeInsurance: state.insurance.year,
    employerInsurance: state.employerObligations.year,
    incomeTax: state.finalTax.year,
    taxableIncome: state.taxableIncome.year,
    annualNet: calculation.finalIncomeYearly,
    monthlyNet: calculation.finalIncomeYearly / 12,
    netPerSalary: calculation.finalIncomeMonthly,
    companyCost: state.totalEmployerCost.year,
  };
};

const businessDetails = (input, annualRevenue) => ({
  grossIncome: {
    month: finiteNonNegative(annualRevenue) / 12,
    year: finiteNonNegative(annualRevenue),
  },
  taxationYear: Number(input.taxationYear),
  taxYearDuration: 12,
  grossMonthOrYear: "year",
  businessExpensesMonthOrYear: "year",
  insuranceScaleSelection: Number(input.insuranceScaleSelection),
  discountOptions: {
    firstScaleDiscount: Boolean(input.firstScaleDiscount),
    prePaidTaxDiscount: Boolean(input.prePaidTaxDiscount),
    specialInsuranceScale: Boolean(input.specialInsuranceScale),
  },
  prePaidNextYearTax: Boolean(input.prePaidNextYearTax),
  withholdingTax: Boolean(input.withholdingTax),
  extraBusinessExpenses: finiteNonNegative(input.businessExpensesAnnual),
  previousYearTaxInAdvance: finiteNonNegative(
    input.previousYearTaxInAdvance,
  ),
  numberOfChildren: Math.trunc(finiteNonNegative(input.numberOfChildren)),
  ageGroup: input.ageGroup,
});

export const calculateFreelancerOffer = (input, annualRevenue) => {
  const revenue = finiteNonNegative(annualRevenue);
  const details = businessDetails(input, revenue);
  const calculation = calculateBusinessResults({ userDetails: details });
  const table = calculation.nextBusinessTable;
  const taxPrepayment = details.prePaidNextYearTax
    ? calculation.taxInAdvanceValue.year
    : 0;
  const annualNet =
    revenue -
    table.businessExpenses.year -
    table.insurance.year -
    calculation.totalTax.year;
  const effectiveBillableMonths = getEffectiveBillableMonths(input);

  return {
    annualRevenue: revenue,
    invoicePerBillableMonth:
      effectiveBillableMonths > 0 ? revenue / effectiveBillableMonths : null,
    effectiveBillableMonths,
    businessExpenses: table.businessExpenses.year,
    insurance: table.insurance.year,
    taxableIncome: calculation.taxableIncome.year,
    incomeTax: calculation.totalTax.year,
    taxPrepayment,
    previousYearTaxInAdvance: finiteNonNegative(
      input.previousYearTaxInAdvance,
    ),
    withholding: table.withholdingTaxAmount.year,
    taxBalanceAfterWithholding:
      calculation.totalTax.year - table.withholdingTaxAmount.year,
    annualNet,
    monthlyNet: annualNet / 12,
    cashAfterTaxSettlements: calculation.finalIncome.year,
    companyCost: revenue,
    vat: revenue * finiteNonNegative(input.vatRate),
  };
};

const solveMinimum = ({ target, calculate, select }) => {
  const wanted = finiteNonNegative(target);
  if (!wanted) return 0;

  let low = 0;
  let high = Math.max(1000, wanted);
  let attempts = 0;
  while (select(calculate(high)) < wanted && attempts < 40) {
    high *= 2;
    attempts += 1;
  }
  if (attempts === 40) throw new Error("Could not bracket comparison target");

  for (let index = 0; index < 80; index += 1) {
    const middle = (low + high) / 2;
    if (select(calculate(middle)) >= wanted) high = middle;
    else low = middle;
  }

  return roundMoney(high);
};

export const solveEmployeeGrossForCompanyCost = (input, companyBudget) =>
  solveMinimum({
    target: companyBudget,
    calculate: (annualGross) => calculateEmployeeOffer(input, annualGross),
    select: (result) => result.companyCost,
  });

export const solveEmployeeGrossForNet = (input, annualNet) =>
  solveMinimum({
    target: annualNet,
    calculate: (annualGross) => calculateEmployeeOffer(input, annualGross),
    select: (result) => result.annualNet,
  });

export const solveFreelancerRevenueForNet = (input, annualNet) =>
  solveMinimum({
    target: annualNet,
    calculate: (annualRevenue) =>
      calculateFreelancerOffer(input, annualRevenue),
    select: (result) => result.annualNet,
  });

const hasPositive = (value) => finiteNonNegative(value) > 0;

export const calculateOfferComparison = (input) => {
  const mode = input.mode;
  const employeeAnnualOffer = getAnnualEmployeeOffer(input);
  const freelancerAnnualOffer = getAnnualFreelancerOffer(input);
  const companyBudget = finiteNonNegative(input.companyBudget);
  const effectiveBillableMonths = getEffectiveBillableMonths(input);

  if (
    (mode === OFFER_COMPARISON_MODES.BUDGET && !hasPositive(companyBudget)) ||
    (mode === OFFER_COMPARISON_MODES.EMPLOYEE &&
      !hasPositive(employeeAnnualOffer)) ||
    (mode === OFFER_COMPARISON_MODES.FREELANCER &&
      (!hasPositive(freelancerAnnualOffer) || !effectiveBillableMonths)) ||
    (mode === OFFER_COMPARISON_MODES.BOTH &&
      (!hasPositive(employeeAnnualOffer) ||
        !hasPositive(freelancerAnnualOffer) ||
        !effectiveBillableMonths))
  ) {
    return null;
  }

  let employee;
  let freelancer;
  let employeeSource = "provided";
  let freelancerSource = "provided";

  if (mode === OFFER_COMPARISON_MODES.BUDGET) {
    employee = calculateEmployeeOffer(
      input,
      solveEmployeeGrossForCompanyCost(input, companyBudget),
    );
    freelancer = calculateFreelancerOffer(input, companyBudget);
    employeeSource = "budget";
    freelancerSource = "budget";
  } else if (mode === OFFER_COMPARISON_MODES.EMPLOYEE) {
    employee = calculateEmployeeOffer(input, employeeAnnualOffer);
    freelancer = calculateFreelancerOffer(
      input,
      solveFreelancerRevenueForNet(input, employee.annualNet),
    );
    freelancerSource = "generated-net-match";
  } else if (mode === OFFER_COMPARISON_MODES.FREELANCER) {
    freelancer = calculateFreelancerOffer(input, freelancerAnnualOffer);
    employee = calculateEmployeeOffer(
      input,
      solveEmployeeGrossForNet(input, freelancer.annualNet),
    );
    employeeSource = "generated-net-match";
  } else {
    employee = calculateEmployeeOffer(input, employeeAnnualOffer);
    freelancer = calculateFreelancerOffer(input, freelancerAnnualOffer);
  }

  const requiredFreelancerRevenue = solveFreelancerRevenueForNet(
    input,
    employee.annualNet,
  );
  const requiredEmployeeGross = solveEmployeeGrossForNet(
    input,
    freelancer.annualNet,
  );
  const freelancerAtEmployeeCost = calculateFreelancerOffer(
    input,
    employee.companyCost,
  );
  const employeeAtFreelancerCost = calculateEmployeeOffer(
    input,
    solveEmployeeGrossForCompanyCost(input, freelancer.companyCost),
  );

  return {
    mode,
    employee: { ...employee, source: employeeSource },
    freelancer: { ...freelancer, source: freelancerSource },
    difference: {
      annualNet: freelancer.annualNet - employee.annualNet,
      companyCost: freelancer.companyCost - employee.companyCost,
    },
    benchmarks: {
      requiredFreelancerRevenue,
      requiredFreelancerInvoice:
        requiredFreelancerRevenue / effectiveBillableMonths,
      requiredEmployeeGross,
      freelancerAtEmployeeCost,
      employeeAtFreelancerCost,
    },
  };
};

const serializedFields = Object.keys(createDefaultOfferComparisonInput());

export const serializeOfferComparisonInput = (input) =>
  JSON.stringify({
    version: 1,
    input: Object.fromEntries(
      serializedFields.map((field) => [field, input[field]]),
    ),
  });

export const parseOfferComparisonInput = (value) => {
  if (typeof value !== "string") return null;
  try {
    const payload = JSON.parse(value);
    if (
      payload?.version !== 1 ||
      !payload.input ||
      typeof payload.input !== "object" ||
      Array.isArray(payload.input)
    ) {
      return null;
    }

    const defaults = createDefaultOfferComparisonInput();
    const parsed = Object.fromEntries(
      serializedFields
        .filter((field) =>
          Object.prototype.hasOwnProperty.call(payload.input, field),
        )
        .map((field) => [field, payload.input[field]]),
    );
    const result = { ...defaults, ...parsed };

    if (!Object.values(OFFER_COMPARISON_MODES).includes(result.mode)) return null;
    if (!Object.values(OFFER_PERIODS).includes(result.employeeOfferPeriod)) return null;
    if (!Object.values(OFFER_PERIODS).includes(result.freelancerOfferPeriod)) return null;
    if (!supportedTaxYears.includes(Number(result.taxationYear))) return null;

    return result;
  } catch {
    return null;
  }
};
