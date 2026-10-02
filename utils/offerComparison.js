import { getTaxRules, latestTaxYear, supportedTaxYears } from "../rules";
import { calculateBusinessResults } from "./business";
import { calculateEmployeeForGrossMonth } from "./employeeCalculation";
import { employeeInsuranceDefaults, isEngineer, supportsEngineer, validateEmployeeInsuranceInput, moneyToCents } from "./employeeContributions";
import { roundMoney } from "./employee";

export const COMPARISON_PERSPECTIVES = Object.freeze({
  PERSONAL: "personal",
  COMPANY: "company",
});

export const OFFER_TYPES = Object.freeze({
  EMPLOYEE: "employee",
  FREELANCER: "freelancer",
});

export const OFFER_PERIODS = Object.freeze({
  MONTH: "month",
  YEAR: "year",
});

export const AVERAGE_WORKING_DAYS_PER_MONTH = 21.75;

export const createDefaultOfferComparisonInput = () => ({
  ...employeeInsuranceDefaults,
  perspective: COMPARISON_PERSPECTIVES.PERSONAL,
  offerType: OFFER_TYPES.EMPLOYEE,
  hasSecondOffer: false,
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
  businessAge: 6,
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
  ...employeeInsuranceDefaults,
  insuranceProfile: input.insuranceProfile ?? "general",
  supplementaryCategory: input.supplementaryCategory ?? 1,
  lumpSumCategory: input.lumpSumCategory ?? 1,
  supplementaryFund: input.supplementaryFund ?? "efka",
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
    contributionBreakdown: state.contributionBreakdown,
    monthlyAmountsAreAverages: state.monthlyAmountsAreAverages,
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
  minimumPresumedIncome: {
    businessAge: Math.max(1, Math.trunc(finiteNonNegative(input.businessAge))),
    hasAdjustments: false,
  },
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

const solveMinimum = ({ target, calculate, select, cents = false }) => {
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

  // Keep the minimum solution on or above the target after currency rounding.
  return cents ? Math.ceil(high * 100) / 100 : roundMoney(high);
};

export const solveEmployeeGrossForCompanyCost = (input, companyBudget) =>
  solveMinimum({
    target: companyBudget,
    cents: isEngineer(input),
    calculate: (annualGross) => calculateEmployeeOffer(input, annualGross),
    select: (result) => result.companyCost,
  });

export const solveEmployeeGrossForNet = (input, annualNet) =>
  solveMinimum({
    target: annualNet,
    cents: isEngineer(input),
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

export const getEngineerMinimumEmployerCost = (input) => {
  if (!isEngineer(input) || !supportsEngineer(input.taxationYear)) return 0;
  const rules = getTaxRules(input.taxationYear).employee.insurance.engineer;
  return moneyToCents(
    rules.supplementaryMonthlyAmounts[(input.supplementaryCategory ?? rules.defaultCategory) - 1] *
    (1 - rules.supplementaryEmployeeShare) * rules.insuredMonths,
  );
};

export const calculateOfferComparison = (input) => {
  if (isEngineer(input) && !supportsEngineer(input.taxationYear)) return null;
  const { perspective, offerType, hasSecondOffer } = input;
  const employeeAnnualOffer = getAnnualEmployeeOffer(input);
  const freelancerAnnualOffer = getAnnualFreelancerOffer(input);
  const companyBudget = finiteNonNegative(input.companyBudget);
  const effectiveBillableMonths = getEffectiveBillableMonths(input);
  const company = perspective === COMPARISON_PERSPECTIVES.COMPANY;
  // A full-year engineer salary must cover the fixed employer contributions.
  if (isEngineer(input) && company &&
      companyBudget <= getEngineerMinimumEmployerCost(input)) return null;
  const knownOffer = offerType === OFFER_TYPES.EMPLOYEE
    ? employeeAnnualOffer
    : freelancerAnnualOffer;

  if (
    !Object.values(COMPARISON_PERSPECTIVES).includes(perspective) ||
    !Object.values(OFFER_TYPES).includes(offerType) ||
    !hasPositive(input.salaryMonthCount) ||
    !effectiveBillableMonths ||
    !Number.isFinite(knownOffer) ||
    (company ? !hasPositive(companyBudget) : !hasPositive(knownOffer)) ||
    (!company && hasSecondOffer &&
      (!hasPositive(employeeAnnualOffer) || !hasPositive(freelancerAnnualOffer)))
  ) return null;

  const employee = calculateEmployeeOffer(
    input,
    company
      ? solveEmployeeGrossForCompanyCost(input, companyBudget)
      : hasSecondOffer ? employeeAnnualOffer : knownOffer,
  );
  const freelancer = calculateFreelancerOffer(
    input,
    company ? companyBudget : hasSecondOffer ? freelancerAnnualOffer : knownOffer,
  );
  const basis = company ? "same-company-cost" : hasSecondOffer ? "actual-offers" : "same-annual-offer";
  const employeeSource = company ? "budget" : !hasSecondOffer && offerType !== OFFER_TYPES.EMPLOYEE ? "assumed" : "provided";
  const freelancerSource = company ? "budget" : !hasSecondOffer && offerType !== OFFER_TYPES.FREELANCER ? "assumed" : "provided";

  const requiredFreelancerRevenue = employee.annualNet > 0
    ? solveFreelancerRevenueForNet(input, employee.annualNet)
    : null;
  const requiredEmployeeGross = freelancer.annualNet > 0
    ? solveEmployeeGrossForNet(input, freelancer.annualNet)
    : null;
  const freelancerAtEmployeeCost = calculateFreelancerOffer(
    input,
    employee.companyCost,
  );
  const employeeAtFreelancerCost = isEngineer(input) &&
      freelancer.companyCost <= getEngineerMinimumEmployerCost(input)
    ? null
    : calculateEmployeeOffer(
      input,
      solveEmployeeGrossForCompanyCost(input, freelancer.companyCost),
    );

  return {
    perspective,
    basis,
    employee: { ...employee, source: employeeSource },
    freelancer: { ...freelancer, source: freelancerSource },
    difference: {
      annualNet: freelancer.annualNet - employee.annualNet,
      companyCost: freelancer.companyCost - employee.companyCost,
    },
    benchmarks: {
      requiredFreelancerRevenue,
      requiredFreelancerInvoice:
        requiredFreelancerRevenue === null ? null : requiredFreelancerRevenue / effectiveBillableMonths,
      requiredEmployeeGross,
      freelancerAtEmployeeCost,
      employeeAtFreelancerCost,
    },
  };
};

const serializedFields = Object.keys(createDefaultOfferComparisonInput());

export const serializeOfferComparisonInput = (input) =>
  JSON.stringify({
    version: 2,
    input: Object.fromEntries(
      serializedFields.map((field) => [field, input[field]]),
    ),
  });

export const parseOfferComparisonInput = (value) => {
  if (typeof value !== "string") return null;
  try {
    const payload = JSON.parse(value);
    if (
      ![1, 2].includes(payload?.version) ||
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
    if (payload.version === 1) {
      const mode = payload.input.mode;
      if (!["budget", "employee", "freelancer", "both"].includes(mode)) return null;
      result.perspective = mode === "budget" ? COMPARISON_PERSPECTIVES.COMPANY : COMPARISON_PERSPECTIVES.PERSONAL;
      result.offerType = mode === "freelancer" ? OFFER_TYPES.FREELANCER : OFFER_TYPES.EMPLOYEE;
      result.hasSecondOffer = mode === "both";
    }

    if (!Object.values(COMPARISON_PERSPECTIVES).includes(result.perspective)) return null;
    if (!Object.values(OFFER_TYPES).includes(result.offerType)) return null;
    for (const [field, defaultValue] of Object.entries(defaults)) {
      if (typeof defaultValue === "boolean" && typeof result[field] !== "boolean") return null;
      if (typeof defaultValue === "number" &&
        (typeof result[field] !== "number" || !Number.isFinite(result[field]) || result[field] < 0)) return null;
    }
    const rules = getTaxRules(result.taxationYear);
    if (!rules.ui.employee.salaryMonthOptions.includes(result.salaryMonthCount)) return null;
    if (!Number.isInteger(result.numberOfChildren) ||
      (rules.ui.employee.maximumChildren !== null && result.numberOfChildren > rules.ui.employee.maximumChildren)) return null;
    if (!Number.isInteger(result.businessAge) || result.businessAge < 1 || result.businessAge > 60) return null;
    if (!Number.isInteger(result.insuranceScaleSelection) || result.insuranceScaleSelection < 1 ||
      result.insuranceScaleSelection >= rules.business.insurance.monthlyAmounts.length) return null;
    if (result.billableMonths > 12 || result.unpaidLeaveDays > 260) return null;
    if (rules.ui.ageGroups?.length && !rules.ui.ageGroups.some((group) => group.value === result.ageGroup)) return null;
    if (!rules.business.invoice.vatRates.includes(result.vatRate)) return null;
    if (!Object.values(OFFER_PERIODS).includes(result.employeeOfferPeriod)) return null;
    if (!Object.values(OFFER_PERIODS).includes(result.freelancerOfferPeriod)) return null;
    if (!supportedTaxYears.includes(Number(result.taxationYear))) return null;

    validateEmployeeInsuranceInput(result);
    return result;
  } catch {
    return null;
  }
};
