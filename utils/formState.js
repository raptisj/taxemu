import { getTaxRules } from "../rules";

const serializeIncome = (source, amount) => `${source}:${Number(amount)}`;

export const isBusinessGrossIncomeMissing = (grossIncome) =>
  !grossIncome?.month || !grossIncome?.year;

const getMinimumPresumedIncomeInput = (details = {}) => {
  const result = {
    businessAge: details.businessAge,
    hasAdjustments: details.hasAdjustments,
  };
  if (!details.hasAdjustments) return result;

  result.employeeAdjustment = Boolean(details.employeeAdjustment);
  if (result.employeeAdjustment) {
    result.annualPayrollCost = details.annualPayrollCost;
    result.highestPaidEmployeeGross = details.highestPaidEmployeeGross;
  }
  result.turnoverAdjustment = Boolean(details.turnoverAdjustment);
  if (result.turnoverAdjustment) {
    result.kadAverageTurnover = details.kadAverageTurnover;
  }
  result.otherIncomeAdjustment = Boolean(details.otherIncomeAdjustment);
  if (result.otherIncomeAdjustment) result.otherIncome = details.otherIncome;
  result.reliefAdjustment = Boolean(details.reliefAdjustment);
  if (result.reliefAdjustment) {
    result.reliefType = details.reliefType;
    if (details.reliefType === "limited") {
      result.eligibleOperatingDays = details.eligibleOperatingDays;
    }
  }
  return result;
};

export const getEmployeeCalculationInput = (employee) => ({
  income: serializeIncome(
    employee.activeInput,
    employee.activeInput === "gross"
      ? employee.grossIncomeYearly
      : employee.finalIncomeYearly,
  ),
  salaryMonthCount: employee.salaryMonthCount,
  taxationYear: employee.taxationYear,
  numberOfChildren: employee.numberOfChildren,
  ageGroup: employee.ageGroup,
  returnBaseInland: employee.discountOptions.returnBaseInland,
});

export const getBusinessCalculationInput = (business) => ({
  grossIncome: serializeIncome(
    business.grossMonthOrYear,
    business.grossMonthOrYear === "month"
      ? business.grossIncome.month
      : business.grossIncome.year,
  ),
  taxationYear: business.taxationYear,
  taxYearDuration: business.taxYearDuration,
  insuranceScaleSelection: business.insuranceScaleSelection,
  specialInsuranceScale: business.discountOptions.specialInsuranceScale,
  extraBusinessExpenses: business.extraBusinessExpenses,
  previousYearTaxInAdvance: business.previousYearTaxInAdvance,
  prePaidNextYearTax: business.prePaidNextYearTax,
  prePaidTaxDiscount: business.discountOptions.prePaidTaxDiscount,
  firstScaleDiscount: business.discountOptions.firstScaleDiscount,
  withholdingTax: business.withholdingTax,
  numberOfChildren: business.numberOfChildren,
  ageGroup: business.ageGroup,
  minimumPresumedIncome: JSON.stringify(
    getMinimumPresumedIncomeInput(business.minimumPresumedIncome),
  ),
});

export const getDirtyFields = (currentInput, lastCalculatedInput) => {
  if (!lastCalculatedInput) {
    return Object.keys(currentInput);
  }

  return Object.keys(currentInput).filter(
    (field) => !Object.is(currentInput[field], lastCalculatedInput[field]),
  );
};

export const getCalculationInput = (entity, details) => {
  if (entity === "employee") {
    return getEmployeeCalculationInput(details);
  }

  if (entity === "business") {
    return getBusinessCalculationInput(details);
  }

  throw new Error(`Unknown calculator entity: ${entity}`);
};

export const getCalculationDirtyFields = (entity, details) => {
  const rules = getTaxRules(details.taxationYear);
  const dirtyFields = getDirtyFields(
    getCalculationInput(entity, details),
    details.lastCalculatedInput,
  );

  if (entity === "employee") {
    return rules.ui.employee.showAgeGroup
      ? dirtyFields
      : dirtyFields.filter((field) => field !== "ageGroup");
  }

  return dirtyFields.filter((field) => {
    if (
      !rules.business.minimumPresumedIncome.enabled &&
      field === "minimumPresumedIncome"
    ) {
      return false;
    }
    if (!rules.ui.business.showAgeGroup && field === "ageGroup") {
      return false;
    }
    if (!rules.ui.business.showChildren && field === "numberOfChildren") {
      return false;
    }
    if (
      !rules.business.firstYearsDiscount.enabled &&
      field === "firstScaleDiscount"
    ) {
      return false;
    }
    if (!details.prePaidNextYearTax && field === "prePaidTaxDiscount") {
      return false;
    }
    if (
      details.discountOptions.specialInsuranceScale &&
      field === "insuranceScaleSelection"
    ) {
      return false;
    }
    return true;
  });
};
