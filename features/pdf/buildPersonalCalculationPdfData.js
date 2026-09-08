import { getTaxRules } from "../../rules";
import {
  calculateYearComparison,
  parseComparisonYears,
} from "../../utils/yearComparison";

const DISCLAIMER =
  "Οι υπολογισμοί είναι κατά προσέγγιση και δεν αποτελούν λογιστική ή φοροτεχνική συμβουλή.";

const pair = (value) => ({
  month: Number(value?.month) || 0,
  year: Number(value?.year) || 0,
});

const getAgeGroupLabel = (rules, ageGroup) =>
  rules.ui.ageGroups?.find(({ value }) => value === ageGroup)?.text ?? ageGroup;

const buildEmployeeResults = (tableResults, calculationInput) => {
  const annualAdjustment = Number(tableResults.childrenDiscountAmount?.year) || 0;
  const salaryMonthCount =
    Number(tableResults.salaryMonthCount ?? calculationInput.salaryMonthCount) || 1;
  return [
  { key: "netIncome", label: "Καθαρό εισόδημα", value: pair(tableResults.finalIncome) },
  { key: "grossIncome", label: "Μικτό εισόδημα", value: pair(tableResults.grossIncome) },
  { key: "insurance", label: "Ασφαλιστικές εισφορές", value: pair(tableResults.insurance) },
  { key: "taxableIncome", label: "Φορολογητέο εισόδημα", value: pair(tableResults.taxableIncome) },
  { key: "tax", label: "Φόρος εισοδήματος", value: pair(tableResults.finalTax) },
  {
    key: "adjustment",
    label: "Μείωση φόρου",
    value: { month: annualAdjustment / salaryMonthCount, year: annualAdjustment },
  },
  { key: "employerContributions", label: "Εργοδοτικές εισφορές", value: pair(tableResults.employerObligations) },
  { key: "totalEmployerCost", label: "Συνολικό εργοδοτικό κόστος", value: pair(tableResults.totalEmployerCost) },
  {
    key: "taxWedge",
    label: "Φορολογική επιβάρυνση",
    value: pair(tableResults.taxWedge),
    percentage: pair(tableResults.taxWedgePercentage),
  },
  ];
};

const buildBusinessResults = (tableResults) => {
  const rows = [
    { key: "netIncome", label: "Καθαρό εισόδημα", value: pair(tableResults.finalIncome) },
    { key: "grossIncome", label: "Μικτό εισόδημα", value: pair(tableResults.grossIncome) },
    { key: "businessExpenses", label: "Πρόσθετα έξοδα", value: pair(tableResults.businessExpenses) },
    { key: "insurance", label: "Ασφάλιση", value: pair(tableResults.insurance) },
    { key: "taxableIncome", label: "Φορολογητέο εισόδημα", value: pair(tableResults.taxableIncome) },
    { key: "tax", label: "Φόρος εισοδήματος", value: pair(tableResults.totalTax) },
  ];

  if (tableResults.prePaidNextYearTax) {
    rows.push({
      key: "taxPrepayment",
      label: "Προκαταβολή φόρου",
      value: pair(tableResults.taxInAdvance),
    });
  }
  if (tableResults.previousYearTaxInAdvance?.year) {
    rows.push({
      key: "previousTaxPrepayment",
      label: "Περσινή προκαταβολή φόρου",
      value: pair(tableResults.previousYearTaxInAdvance),
    });
  }
  if (tableResults.withholdingTax) {
    rows.push({
      key: "withholdingTax",
      label: "Παρακράτηση φόρου",
      value: pair(tableResults.withholdingTaxAmount),
    });
  }

  rows.push({
    key: "taxDue",
    label: "Τελικός πληρωτέος φόρος",
    value: pair(tableResults.finalTax),
  });
  return rows;
};

const buildAssumptions = (entity, input, rules) => {
  if (entity === "employee") {
    const assumptions = [
      {
        label: input.activeInput === "final" ? "Καθαρό εισόδημα" : "Μικτό εισόδημα",
        value:
          input.activeInput === "final"
            ? pair({ month: input.finalIncomeMonthly, year: input.finalIncomeYearly })
            : pair({ month: input.grossIncomeMonthly, year: input.grossIncomeYearly }),
        type: "moneyPair",
      },
      { label: "Μισθοί ανά έτος", value: input.salaryMonthCount },
    ];
    if (rules.ui.employee.showChildren !== false) {
      assumptions.push({ label: "Τέκνα", value: input.numberOfChildren });
    }
    if (rules.ui.employee.showAgeGroup) {
      assumptions.push({
        label: "Ηλικιακή ομάδα",
        value: getAgeGroupLabel(rules, input.ageGroup),
      });
    }
    assumptions.push({
        label: "Μεταφορά φορολογικής κατοικίας",
        value: input.discountOptions?.returnBaseInland ? "Ναι" : "Όχι",
    });
    return assumptions;
  }

  const assumptions = [
    { label: "Μικτό εισόδημα", value: pair(input.grossIncome), type: "moneyPair" },
    { label: "Διάρκεια φορολογικού έτους", value: `${input.taxYearDuration} μήνες` },
    { label: "Ασφαλιστική κατηγορία", value: input.discountOptions?.specialInsuranceScale ? "Ειδική" : `${input.insuranceScaleSelection}η` },
    { label: "Πρόσθετα έξοδα", value: Number(input.extraBusinessExpenses) || 0, type: "money" },
  ];
  if (rules.ui.business.showChildren) {
    assumptions.push({ label: "Τέκνα", value: input.numberOfChildren });
  }
  if (rules.ui.business.showAgeGroup) {
    assumptions.push({
      label: "Ηλικιακή ομάδα",
      value: getAgeGroupLabel(rules, input.ageGroup),
    });
  }
  return assumptions;
};

const collectSources = (years) => {
  const sourcesByUrl = new Map();
  years.forEach((year) => {
    getTaxRules(year).sources.forEach((source) => {
      const existing = sourcesByUrl.get(source.url);
      if (existing) {
        existing.years.push(year);
      } else {
        sourcesByUrl.set(source.url, { ...source, years: [year] });
      }
    });
  });
  return [...sourcesByUrl.values()];
};

export const buildPersonalCalculationPdfData = ({
  entity,
  details,
  compare,
  generatedAt = new Date(),
}) => {
  if (entity !== "employee" && entity !== "business") {
    throw new Error(`Unknown calculator entity: ${entity}`);
  }

  const tableResults = details?.tableResults;
  const calculationInput = tableResults?.calculationInput;
  if (!calculationInput) return null;

  const taxationYear = Number(tableResults.taxationYear);
  const rules = getTaxRules(taxationYear);
  const calculationDetails = {
    ...details,
    ...calculationInput,
    taxationYear,
    discountOptions: {
      ...details.discountOptions,
      ...calculationInput.discountOptions,
    },
  };
  const comparisonYears = compare
    ? parseComparisonYears(Array.isArray(compare) ? compare[0] : compare, taxationYear)
    : null;
  const comparison = comparisonYears
    ? {
        years: comparisonYears,
        ...calculateYearComparison(entity, calculationDetails, comparisonYears),
      }
    : null;
  const sourceYears = comparisonYears ?? [taxationYear];

  return {
    schemaVersion: 1,
    entity,
    title:
      entity === "employee"
        ? "Αναφορά υπολογισμού μισθωτού"
        : "Αναφορά υπολογισμού ελεύθερου επαγγελματία",
    generatedAt: generatedAt.toISOString(),
    taxationYear,
    assumptions: buildAssumptions(entity, calculationInput, rules),
    results:
      entity === "employee"
        ? buildEmployeeResults(tableResults, calculationInput)
        : buildBusinessResults(tableResults),
    comparison,
    sources: collectSources(sourceYears),
    disclaimer: DISCLAIMER,
  };
};
