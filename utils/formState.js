const serializeIncome = (source, amount) => `${source}:${Number(amount)}`;

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
  const dirtyFields = getDirtyFields(
    getCalculationInput(entity, details),
    details.lastCalculatedInput,
  );

  if (entity === "employee") {
    return details.taxationYear >= 2026
      ? dirtyFields
      : dirtyFields.filter((field) => field !== "ageGroup");
  }

  return dirtyFields.filter((field) => {
    if (
      details.taxationYear < 2026 &&
      (field === "ageGroup" || field === "numberOfChildren")
    ) {
      return false;
    }
    if (details.taxationYear >= 2026 && field === "firstScaleDiscount") {
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
