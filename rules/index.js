import taxRulesByYear from "./taxRules.json";

const SUPPORTED_INCOME_TAX_KINDS = new Set([
  "progressive",
  "progressiveByAgeAndChildren",
  "progressiveWithAgeAndChildren",
]);

const assertRate = (rate, path) => {
  if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
    throw new Error(`${path} must be a number between 0 and 1`);
  }
};

const assertNonNegativeNumber = (value, path) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${path} must be a non-negative number`);
  }
};

const assertNonEmptyNumberMap = (values, path) => {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    throw new Error(`${path} must be an object`);
  }

  const entries = Object.entries(values);
  if (entries.length === 0) {
    throw new Error(`${path} must contain at least one value`);
  }

  entries.forEach(([key, value]) =>
    assertNonNegativeNumber(value, `${path}.${key}`),
  );
};

const validateSources = (sources, path) => {
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error(`${path} must contain at least one official source`);
  }

  sources.forEach((source, index) => {
    const sourcePath = `${path}[${index}]`;
    if (typeof source?.name !== "string" || !source.name.trim()) {
      throw new Error(`${sourcePath}.name must be a non-empty string`);
    }
    if (
      typeof source?.url !== "string" ||
      !/^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(source.url)
    ) {
      throw new Error(`${sourcePath}.url must be a valid HTTPS URL`);
    }
  });
};

const validateBrackets = (brackets, path) => {
  if (!Array.isArray(brackets) || brackets.length === 0) {
    throw new Error(`${path} must contain at least one bracket`);
  }

  let previousLimit = 0;
  brackets.forEach((bracket, index) => {
    const bracketPath = `${path}[${index}]`;
    assertRate(bracket.rate, `${bracketPath}.rate`);

    if (bracket.upTo === null) {
      if (index !== brackets.length - 1) {
        throw new Error(`${bracketPath}.upTo can only be null on the last bracket`);
      }
      return;
    }

    if (typeof bracket.upTo !== "number" || bracket.upTo <= previousLimit) {
      throw new Error(`${bracketPath}.upTo must be an increasing number`);
    }
    previousLimit = bracket.upTo;
  });

  if (brackets[brackets.length - 1].upTo !== null) {
    throw new Error(`${path} must end with an open-ended bracket`);
  }
};

export const validateTaxRules = (rulesByYear = taxRulesByYear) => {
  if (!rulesByYear || Object.keys(rulesByYear).length === 0) {
    throw new Error("Tax rules must contain at least one year");
  }

  Object.entries(rulesByYear).forEach(([yearKey, rules]) => {
    if (rules.year !== Number(yearKey)) {
      throw new Error(`${yearKey}.year must match its object key`);
    }

    validateSources(rules.sources, `${yearKey}.sources`);

    ["employee", "business"].forEach((entity) => {
      const policy = rules[entity]?.incomeTax;
      if (!policy || !SUPPORTED_INCOME_TAX_KINDS.has(policy.kind)) {
        throw new Error(`${yearKey}.${entity}.incomeTax.kind is unsupported`);
      }

      if (policy.brackets) {
        validateBrackets(
          policy.brackets,
          `${yearKey}.${entity}.incomeTax.brackets`,
        );
      }
    });

    if (
      rules.employee.incomeTax.kind !== "progressive" &&
      rules.employee.incomeTax.kind !== "progressiveByAgeAndChildren"
    ) {
      throw new Error(
        `${yearKey}.employee.incomeTax.kind is not valid for employees`,
      );
    }
    if (
      rules.business.incomeTax.kind !== "progressive" &&
      rules.business.incomeTax.kind !== "progressiveWithAgeAndChildren"
    ) {
      throw new Error(
        `${yearKey}.business.incomeTax.kind is not valid for businesses`,
      );
    }
    if (
      rules.employee.incomeTax.kind === "progressive" &&
      !rules.employee.incomeTax.brackets
    ) {
      throw new Error(`${yearKey}.employee.incomeTax.brackets is required`);
    }
    if (
      (rules.business.incomeTax.kind === "progressive" ||
        rules.business.incomeTax.kind === "progressiveWithAgeAndChildren") &&
      !rules.business.incomeTax.brackets
    ) {
      throw new Error(`${yearKey}.business.incomeTax.brackets is required`);
    }

    const employeeRules = rules.employee;
    const employeeInsurancePath = `${yearKey}.employee.insurance`;
    assertRate(
      employeeRules.insurance?.employeeRate,
      `${employeeInsurancePath}.employeeRate`,
    );
    assertRate(
      employeeRules.insurance?.employerRate,
      `${employeeInsurancePath}.employerRate`,
    );
    assertNonNegativeNumber(
      employeeRules.insurance?.monthlyContributionCap,
      `${employeeInsurancePath}.monthlyContributionCap`,
    );
    assertNonEmptyNumberMap(
      employeeRules.taxCredit?.amountByChildren,
      `${yearKey}.employee.taxCredit.amountByChildren`,
    );
    assertNonNegativeNumber(
      employeeRules.taxCredit?.reductionStartsAbove,
      `${yearKey}.employee.taxCredit.reductionStartsAbove`,
    );
    assertRate(
      employeeRules.taxCredit?.reductionRate,
      `${yearKey}.employee.taxCredit.reductionRate`,
    );
    assertRate(
      employeeRules.returningResident?.taxableIncomeMultiplier,
      `${yearKey}.employee.returningResident.taxableIncomeMultiplier`,
    );

    const employeeTables = employeeRules.incomeTax.bracketsByAgeAndChildren;
    if (employeeTables) {
      Object.entries(employeeTables).forEach(([ageGroup, tables]) => {
        Object.entries(tables).forEach(([children, brackets]) => {
          validateBrackets(
            brackets,
            `${yearKey}.employee.incomeTax.bracketsByAgeAndChildren.${ageGroup}.${children}`,
          );
        });
      });
    }

    if (
      employeeRules.incomeTax.kind === "progressiveByAgeAndChildren" &&
      !employeeTables
    ) {
      throw new Error(
        `${yearKey}.employee.incomeTax.bracketsByAgeAndChildren is required`,
      );
    }

    const businessRules = rules.business;
    const monthlyAmounts = businessRules.insurance?.monthlyAmounts;
    if (!Array.isArray(monthlyAmounts) || monthlyAmounts.length === 0) {
      throw new Error(
        `${yearKey}.business.insurance.monthlyAmounts must contain at least one amount`,
      );
    }
    monthlyAmounts.forEach((amount, index) => {
      if (typeof amount !== "number" || amount < 0) {
        throw new Error(
          `${yearKey}.business.insurance.monthlyAmounts[${index}] must be non-negative`,
        );
      }
    });
    assertNonNegativeNumber(
      businessRules.insurance?.specialScale,
      `${yearKey}.business.insurance.specialScale`,
    );
    if (
      !Number.isInteger(businessRules.insurance.specialScale) ||
      businessRules.insurance.specialScale >= monthlyAmounts.length
    ) {
      throw new Error(
        `${yearKey}.business.insurance.specialScale must reference a monthly amount`,
      );
    }

    assertRate(
      businessRules.firstYearsDiscount?.taxMultiplier,
      `${yearKey}.business.firstYearsDiscount.taxMultiplier`,
    );
    assertNonNegativeNumber(
      businessRules.firstYearsDiscount?.maximumTaxableIncome,
      `${yearKey}.business.firstYearsDiscount.maximumTaxableIncome`,
    );
    if (typeof businessRules.firstYearsDiscount?.enabled !== "boolean") {
      throw new Error(
        `${yearKey}.business.firstYearsDiscount.enabled must be boolean`,
      );
    }
    assertRate(
      businessRules.taxPrepayment?.rate,
      `${yearKey}.business.taxPrepayment.rate`,
    );
    assertRate(
      businessRules.taxPrepayment?.discountMultiplier,
      `${yearKey}.business.taxPrepayment.discountMultiplier`,
    );
    assertRate(
      businessRules.withholding?.rate,
      `${yearKey}.business.withholding.rate`,
    );
    if (
      !Array.isArray(businessRules.invoice?.vatRates) ||
      businessRules.invoice.vatRates.length === 0
    ) {
      throw new Error(
        `${yearKey}.business.invoice.vatRates must contain at least one rate`,
      );
    }
    if (
      !Array.isArray(businessRules.invoice?.withholdingRates) ||
      businessRules.invoice.withholdingRates.length === 0
    ) {
      throw new Error(
        `${yearKey}.business.invoice.withholdingRates must contain at least one rate`,
      );
    }
    businessRules.invoice.vatRates.forEach((rate, index) =>
      assertRate(rate, `${yearKey}.business.invoice.vatRates[${index}]`),
    );
    businessRules.invoice.withholdingRates.forEach((rate, index) =>
      assertRate(
        rate,
        `${yearKey}.business.invoice.withholdingRates[${index}]`,
      ),
    );

    if (businessRules.incomeTax.kind === "progressiveWithAgeAndChildren") {
      const { children, ageRelief } = businessRules.incomeTax;
      assertNonEmptyNumberMap(
        children?.secondBracketRates,
        `${yearKey}.business.incomeTax.children.secondBracketRates`,
      );
      assertNonEmptyNumberMap(
        children?.thirdBracketRates,
        `${yearKey}.business.incomeTax.children.thirdBracketRates`,
      );
      assertRate(
        children?.fourOrMore?.thirdBracketBaseRate,
        `${yearKey}.business.incomeTax.children.fourOrMore.thirdBracketBaseRate`,
      );
      assertRate(
        children?.fourOrMore?.decrementPerAdditionalChild,
        `${yearKey}.business.incomeTax.children.fourOrMore.decrementPerAdditionalChild`,
      );
      assertRate(
        children?.fourOrMore?.minimumRate,
        `${yearKey}.business.incomeTax.children.fourOrMore.minimumRate`,
      );
      assertNonNegativeNumber(
        children?.fourOrMore?.exemptThrough,
        `${yearKey}.business.incomeTax.children.fourOrMore.exemptThrough`,
      );
      assertNonNegativeNumber(
        ageRelief?.maximumTaxableIncome,
        `${yearKey}.business.incomeTax.ageRelief.maximumTaxableIncome`,
      );
      Object.entries(ageRelief?.ratesByAgeGroup ?? {}).forEach(
        ([ageGroup, rates]) => {
          if (!Array.isArray(rates) || rates.length < 2) {
            throw new Error(
              `${yearKey}.business.incomeTax.ageRelief.ratesByAgeGroup.${ageGroup} must contain two rates`,
            );
          }
          rates.forEach((rate, index) =>
            assertRate(
              rate,
              `${yearKey}.business.incomeTax.ageRelief.ratesByAgeGroup.${ageGroup}[${index}]`,
            ),
          );
        },
      );
    }

    ["employee", "business"].forEach((entity) => {
      const uiRules = rules.ui?.[entity];
      assertNonNegativeNumber(
        uiRules?.maximumChildren,
        `${yearKey}.ui.${entity}.maximumChildren`,
      );
      if (!Number.isInteger(uiRules.maximumChildren)) {
        throw new Error(
          `${yearKey}.ui.${entity}.maximumChildren must be an integer`,
        );
      }
      if (typeof uiRules.showAgeGroup !== "boolean") {
        throw new Error(`${yearKey}.ui.${entity}.showAgeGroup must be boolean`);
      }
    });

    if (
      !Array.isArray(rules.ui.employee.salaryMonthOptions) ||
      rules.ui.employee.salaryMonthOptions.length === 0
    ) {
      throw new Error(
        `${yearKey}.ui.employee.salaryMonthOptions must contain at least one option`,
      );
    }
    rules.ui.employee.salaryMonthOptions.forEach((months, index) =>
      assertNonNegativeNumber(
        months,
        `${yearKey}.ui.employee.salaryMonthOptions[${index}]`,
      ),
    );

    if (typeof rules.ui.business.showChildren !== "boolean") {
      throw new Error(`${yearKey}.ui.business.showChildren must be boolean`);
    }
    if (
      (rules.ui.employee.showAgeGroup || rules.ui.business.showAgeGroup) &&
      (!Array.isArray(rules.ui.ageGroups) || rules.ui.ageGroups.length === 0)
    ) {
      throw new Error(`${yearKey}.ui.ageGroups must contain at least one option`);
    }

    for (
      let children = 0;
      children <= rules.ui.employee.maximumChildren;
      children++
    ) {
      if (
        employeeRules.taxCredit.amountByChildren[String(children)] ===
        undefined
      ) {
        throw new Error(
          `${yearKey}.employee.taxCredit.amountByChildren.${children} is required by the UI`,
        );
      }
    }

    if (employeeRules.incomeTax.kind === "progressiveByAgeAndChildren") {
      rules.ui.ageGroups.forEach(({ value: ageGroup }) => {
        const tables = employeeTables[ageGroup];
        if (!tables) {
          throw new Error(
            `${yearKey}.employee.incomeTax.bracketsByAgeAndChildren.${ageGroup} is required by the UI`,
          );
        }
        for (
          let children = 0;
          children <= rules.ui.employee.maximumChildren;
          children++
        ) {
          if (!tables[String(children)]) {
            throw new Error(
              `${yearKey}.employee.incomeTax.bracketsByAgeAndChildren.${ageGroup}.${children} is required by the UI`,
            );
          }
        }
      });
    }
  });

  return true;
};

validateTaxRules();

export const supportedTaxYears = Object.keys(taxRulesByYear)
  .map(Number)
  .sort((a, b) => b - a);

export const latestTaxYear = supportedTaxYears[0];

export const getTaxRules = (year) => {
  const rules = taxRulesByYear[String(year)];
  if (!rules) {
    throw new Error(`Unsupported taxation year: ${year}`);
  }
  return rules;
};

export const getEmployeeRules = (year) => getTaxRules(year).employee;
export const getBusinessRules = (year) => getTaxRules(year).business;
