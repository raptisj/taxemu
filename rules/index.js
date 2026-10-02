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
    const engineer = employeeRules.insurance.engineer;
    if (engineer !== undefined) {
      const path = `${employeeInsurancePath}.engineer`;
      if (engineer.coverageCode !== "1022" || engineer.insuredMonths !== 12) {
        throw new Error(`${path} must describe full-year coverage code 1022`);
      }
      if (!Array.isArray(engineer.components) || engineer.components.length === 0) {
        throw new Error(`${path}.components must not be empty`);
      }
      const ids = new Set();
      engineer.components.forEach((component, index) => {
        const componentPath = `${path}.components[${index}]`;
        if (!component.id || ids.has(component.id) || !component.label?.trim()) {
          throw new Error(`${componentPath} requires a unique id and label`);
        }
        ids.add(component.id);
        assertRate(component.employeeRate, `${componentPath}.employeeRate`);
        assertRate(component.employerRate, `${componentPath}.employerRate`);
        if (!Array.isArray(component.sourceUrls) || component.sourceUrls.length === 0 ||
          component.sourceUrls.some((url) => !rules.sources.some((source) => source.url === url))) {
          throw new Error(`${componentPath}.sourceUrls must reference official sources`);
        }
      });
      for (const payer of ["employeeRate", "employerRate"]) {
        assertRate(engineer.components.reduce((sum, component) => sum + component[payer], 0), `${path}.${payer}`);
      }
      for (const field of ["supplementaryMonthlyAmounts", "lumpSumMonthlyAmounts"]) {
        if (!Array.isArray(engineer[field]) || engineer[field].length !== 3) {
          throw new Error(`${path}.${field} requires three categories`);
        }
        engineer[field].forEach((amount, index) => assertNonNegativeNumber(amount, `${path}.${field}[${index}]`));
      }
      if (!Number.isInteger(engineer.defaultCategory) || engineer.defaultCategory < 1 || engineer.defaultCategory > 3) {
        throw new Error(`${path}.defaultCategory must reference a category`);
      }
      if (engineer.supplementaryEmployeeShare !== 0.5) throw new Error(`${path}.supplementaryEmployeeShare must be 0.5`);
      if (!Array.isArray(engineer.sourceUrls) || engineer.sourceUrls.length === 0 ||
        engineer.sourceUrls.some((url) => !rules.sources.some((source) => source.url === url))) {
        throw new Error(`${path}.sourceUrls must reference official sources`);
      }
    }
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
    const additionalChildAmount =
      employeeRules.taxCredit?.additionalChildAmount;
    const additionalChildrenStartAfter =
      employeeRules.taxCredit?.additionalChildrenStartAfter;
    if (
      additionalChildAmount !== undefined ||
      additionalChildrenStartAfter !== undefined
    ) {
      assertNonNegativeNumber(
        additionalChildAmount,
        `${yearKey}.employee.taxCredit.additionalChildAmount`,
      );
      assertNonNegativeNumber(
        additionalChildrenStartAfter,
        `${yearKey}.employee.taxCredit.additionalChildrenStartAfter`,
      );
      if (!Number.isInteger(additionalChildrenStartAfter)) {
        throw new Error(
          `${yearKey}.employee.taxCredit.additionalChildrenStartAfter must be an integer`,
        );
      }
      if (
        employeeRules.taxCredit.amountByChildren[
          String(additionalChildrenStartAfter)
        ] === undefined
      ) {
        throw new Error(
          `${yearKey}.employee.taxCredit.amountByChildren.${additionalChildrenStartAfter} is required for additional children`,
        );
      }
    }
    if (
      employeeRules.taxCredit?.reductionExemptAtOrAboveChildren !== undefined
    ) {
      assertNonNegativeNumber(
        employeeRules.taxCredit.reductionExemptAtOrAboveChildren,
        `${yearKey}.employee.taxCredit.reductionExemptAtOrAboveChildren`,
      );
      if (
        !Number.isInteger(
          employeeRules.taxCredit.reductionExemptAtOrAboveChildren,
        )
      ) {
        throw new Error(
          `${yearKey}.employee.taxCredit.reductionExemptAtOrAboveChildren must be an integer`,
        );
      }
    }
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
    if (employeeRules.incomeTax.additionalChildren) {
      const additionalChildren = employeeRules.incomeTax.additionalChildren;
      assertNonNegativeNumber(
        additionalChildren.baseChildren,
        `${yearKey}.employee.incomeTax.additionalChildren.baseChildren`,
      );
      if (!Number.isInteger(additionalChildren.baseChildren)) {
        throw new Error(
          `${yearKey}.employee.incomeTax.additionalChildren.baseChildren must be an integer`,
        );
      }
      assertNonNegativeNumber(
        additionalChildren.bracketUpTo,
        `${yearKey}.employee.incomeTax.additionalChildren.bracketUpTo`,
      );
      assertRate(
        additionalChildren.baseRate,
        `${yearKey}.employee.incomeTax.additionalChildren.baseRate`,
      );
      assertRate(
        additionalChildren.decrementPerAdditionalChild,
        `${yearKey}.employee.incomeTax.additionalChildren.decrementPerAdditionalChild`,
      );
      assertRate(
        additionalChildren.minimumRate,
        `${yearKey}.employee.incomeTax.additionalChildren.minimumRate`,
      );
    }

    const businessRules = rules.business;
    const minimumIncomeRules = businessRules.minimumPresumedIncome;
    if (typeof minimumIncomeRules?.enabled !== "boolean") {
      throw new Error(
        `${yearKey}.business.minimumPresumedIncome.enabled must be boolean`,
      );
    }
    if (minimumIncomeRules.enabled) {
      [
        "monthlyMinimumSalary",
        "salaryPaymentsPerYear",
        "payrollAdditionCap",
        "highestEmployeeCap",
        "overallCap",
      ].forEach((field) =>
        assertNonNegativeNumber(
          minimumIncomeRules[field],
          `${yearKey}.business.minimumPresumedIncome.${field}`,
        ),
      );
      ["payrollRate", "turnoverRate"].forEach((field) =>
        assertRate(
          minimumIncomeRules[field],
          `${yearKey}.business.minimumPresumedIncome.${field}`,
        ),
      );
      if (
        !["baseComponent", "total"].includes(
          minimumIncomeRules.highestEmployeeComparison,
        )
      ) {
        throw new Error(
          `${yearKey}.business.minimumPresumedIncome.highestEmployeeComparison is invalid`,
        );
      }
    }
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
    if (businessRules.insurance.monthlyUnemploymentContribution !== undefined) {
      assertNonNegativeNumber(
        businessRules.insurance.monthlyUnemploymentContribution,
        `${yearKey}.business.insurance.monthlyUnemploymentContribution`,
      );
    }
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
      businessRules.firstYearsDiscount?.maximumGrossIncome,
      `${yearKey}.business.firstYearsDiscount.maximumGrossIncome`,
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
    assertNonNegativeNumber(
      businessRules.taxPrepayment?.minimumAssessmentAmount,
      `${yearKey}.business.taxPrepayment.minimumAssessmentAmount`,
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
    if (
      new Set(businessRules.invoice.vatRates).size !==
      businessRules.invoice.vatRates.length
    ) {
      throw new Error(`${yearKey}.business.invoice.vatRates must be unique`);
    }
    if (
      !businessRules.invoice.islandVatRates ||
      typeof businessRules.invoice.islandVatRates !== "object" ||
      Array.isArray(businessRules.invoice.islandVatRates)
    ) {
      throw new Error(
        `${yearKey}.business.invoice.islandVatRates must be an object`,
      );
    }
    businessRules.invoice.vatRates.forEach((rate) => {
      const islandRate = businessRules.invoice.islandVatRates[String(rate)];
      assertRate(
        islandRate,
        `${yearKey}.business.invoice.islandVatRates.${rate}`,
      );
      if (islandRate >= rate) {
        throw new Error(
          `${yearKey}.business.invoice.islandVatRates.${rate} must be lower than its base rate`,
        );
      }
    });
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
      if (uiRules?.maximumChildren !== null) {
        assertNonNegativeNumber(
          uiRules?.maximumChildren,
          `${yearKey}.ui.${entity}.maximumChildren`,
        );
        if (!Number.isInteger(uiRules.maximumChildren)) {
          throw new Error(
            `${yearKey}.ui.${entity}.maximumChildren must be an integer or null`,
          );
        }
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

    if (rules.ui.employee.maximumChildren === null) {
      if (
        !employeeRules.incomeTax.additionalChildren ||
        additionalChildAmount === undefined ||
        additionalChildrenStartAfter === undefined
      ) {
        throw new Error(
          `${yearKey}.employee requires formula-based tax and credit rules for an uncapped child count`,
        );
      }
    } else {
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
    }

    if (
      rules.ui.business.maximumChildren === null &&
      businessRules.incomeTax.kind !== "progressiveWithAgeAndChildren"
    ) {
      throw new Error(
        `${yearKey}.business requires formula-based tax rules for an uncapped child count`,
      );
    }

    if (employeeRules.incomeTax.kind === "progressiveByAgeAndChildren") {
      rules.ui.ageGroups.forEach(({ value: ageGroup }) => {
        const tables = employeeTables[ageGroup];
        if (!tables) {
          throw new Error(
            `${yearKey}.employee.incomeTax.bracketsByAgeAndChildren.${ageGroup} is required by the UI`,
          );
        }
        if (rules.ui.employee.maximumChildren === null) {
          const { baseChildren, bracketUpTo } =
            employeeRules.incomeTax.additionalChildren;
          const baseBrackets = tables[String(baseChildren)];
          if (!baseBrackets) {
            throw new Error(
              `${yearKey}.employee.incomeTax.bracketsByAgeAndChildren.${ageGroup}.${baseChildren} is required for additional children`,
            );
          }
          if (!baseBrackets.some((bracket) => bracket.upTo === bracketUpTo)) {
            throw new Error(
              `${yearKey}.employee.incomeTax.bracketsByAgeAndChildren.${ageGroup} requires a bracket ending at ${bracketUpTo}`,
            );
          }
        } else {
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
