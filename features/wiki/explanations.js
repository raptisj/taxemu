import { getTaxRules } from "../../rules";
import {
  calculateBusinessResults,
  getInsuranceMonthlyAmounts,
} from "../../utils/business";
import { calculateEmployeeForGrossMonth } from "../../utils/employeeCalculation";
import {
  buildTaxBreakdown,
  calculateIncomeTaxFromPolicy,
} from "../../utils/taxPolicy";

const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const formatExplanationMoney = (value) =>
  new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(asNumber(value));

export const formatExplanationRate = (rate) =>
  `${new Intl.NumberFormat("el-GR", {
    maximumFractionDigits: 3,
  }).format(asNumber(rate) * 100)}%`;

const findAgeLabel = (rules, ageGroup) =>
  rules.ui.ageGroups?.find(({ value }) => value === ageGroup)?.text ??
  "Άνω των 30 ετών";

const describeBrackets = (brackets) => {
  let from = 0;

  return brackets.map(({ upTo, rate }) => {
    const description = `${formatExplanationMoney(from)} – ${
      upTo === null ? "και άνω" : formatExplanationMoney(upTo)
    }: ${formatExplanationRate(rate)}`;
    from = upTo;
    return description;
  });
};

const describeBreakdown = ({ amount, rate, tax }) =>
  `${formatExplanationMoney(amount)} × ${formatExplanationRate(rate)} = ${formatExplanationMoney(tax)}`;

const getTaxModel = ({ taxableIncome, policy, ageGroup, children }) => {
  const { tax, brackets } = calculateIncomeTaxFromPolicy({
    taxableIncome,
    policy,
    ageGroup,
    children,
  });

  return {
    tax,
    brackets: describeBrackets(brackets),
    breakdown: buildTaxBreakdown(taxableIncome, brackets).map(
      describeBreakdown,
    ),
  };
};

export const buildEmployeeExplanation = (details) => {
  const rules = getTaxRules(details.taxationYear);
  const employeeRules = rules.employee;
  const grossMonthly = asNumber(details.grossIncomeMonthly);
  const hasCalculation = grossMonthly > 0;
  const calculation = hasCalculation
    ? calculateEmployeeForGrossMonth(details, grossMonthly)
    : null;
  const calculated = calculation?.calculatedState;
  const taxableIncome = calculated?.taxableIncome.year ?? 0;
  const tax = getTaxModel({
    taxableIncome,
    policy: employeeRules.incomeTax,
    ageGroup: details.ageGroup,
    children: details.numberOfChildren,
  });
  const baseCredit =
    employeeRules.taxCredit.amountByChildren[String(details.numberOfChildren)];
  const appliedCredit = calculated
    ? Math.max(0, calculated.initialTax.year - calculated.finalTax.year)
    : 0;
  const annualGross = grossMonthly * details.salaryMonthCount;

  return {
    year: rules.year,
    intro: `Οι παρακάτω συντελεστές και τα παραδείγματα προκύπτουν από τους κανόνες του ${rules.year} και τις τρέχουσες τιμές της φόρμας.`,
    sections: [
      {
        title: "Παράμετροι υπολογισμού",
        description: `Ο υπολογισμός χρησιμοποιεί ${details.salaryMonthCount} ετήσιους μισθούς, ${details.numberOfChildren} τέκνα και ηλικιακή ομάδα «${findAgeLabel(rules, details.ageGroup)}».`,
      },
      {
        title: "Ασφαλιστικές και εργοδοτικές εισφορές",
        description: `Οι εισφορές εργαζομένου είναι ${formatExplanationRate(employeeRules.insurance.employeeRate)} και οι εργοδοτικές ${formatExplanationRate(employeeRules.insurance.employerRate)}. Και οι δύο εφαρμόζονται έως το μηνιαίο όριο ασφαλιστέων αποδοχών των ${formatExplanationMoney(employeeRules.insurance.monthlyContributionCap)}.`,
        items: calculated
          ? [
              `Εισφορές εργαζομένου: ${formatExplanationMoney(calculated.insurance.month)} ανά μισθό, ${formatExplanationMoney(calculated.insurance.year)} ετησίως`,
              `Εργοδοτικές εισφορές: ${formatExplanationMoney(calculated.employerObligations.month)} ανά μισθό, ${formatExplanationMoney(calculated.employerObligations.year)} ετησίως`,
              `Συνολικό εργοδοτικό κόστος: ${formatExplanationMoney(calculated.totalEmployerCost.month)} ανά μισθό, ${formatExplanationMoney(calculated.totalEmployerCost.year)} ετησίως`,
              `Φορολογική επιβάρυνση: ${formatExplanationMoney(calculated.taxWedge.month)} (${formatExplanationRate(calculated.taxWedgePercentage.month / 100)}) ανά μισθό, ${formatExplanationMoney(calculated.taxWedge.year)} (${formatExplanationRate(calculated.taxWedgePercentage.year / 100)}) ετησίως`,
            ]
          : [],
      },
      {
        title: "Φορολογητέο εισόδημα",
        description: details.discountOptions.returnBaseInland
          ? `Από το μικτό εισόδημα αφαιρούνται οι εισφορές και εφαρμόζεται ο συντελεστής ${formatExplanationRate(employeeRules.returningResident.taxableIncomeMultiplier)} για τη μεταφορά φορολογικής κατοικίας.`
          : "Από το ετήσιο μικτό εισόδημα αφαιρούνται οι ασφαλιστικές εισφορές του εργαζομένου.",
        items: calculated
          ? [
              `Ετήσιο μικτό εισόδημα: ${formatExplanationMoney(annualGross)}`,
              `Μείον ασφαλιστικές εισφορές: ${formatExplanationMoney(calculated.insurance.year)}`,
              `Φορολογητέο εισόδημα: ${formatExplanationMoney(taxableIncome)}`,
            ]
          : [],
      },
      {
        title: "Κλίμακα φόρου εισοδήματος",
        description:
          "Ο φόρος υπολογίζεται προοδευτικά. Κάθε συντελεστής εφαρμόζεται μόνο στο τμήμα του εισοδήματος που ανήκει στο αντίστοιχο κλιμάκιο.",
        rules: tax.brackets,
        exampleTitle: hasCalculation ? "Εφαρμογή στο εισόδημά σου" : null,
        example: tax.breakdown,
        items: calculated
          ? [
              `Φόρος πριν από τη μείωση: ${formatExplanationMoney(calculated.initialTax.year)}`,
            ]
          : [],
      },
      {
        title: "Μείωση φόρου",
        description: `Η αρχική μείωση για ${details.numberOfChildren} τέκνα είναι ${formatExplanationMoney(baseCredit)}. Πάνω από ${formatExplanationMoney(employeeRules.taxCredit.reductionStartsAbove)} μειώνεται κατά ${formatExplanationRate(employeeRules.taxCredit.reductionRate)} του υπερβάλλοντος ποσού.`,
        items: calculated
          ? [
              `Μείωση που εφαρμόστηκε: ${formatExplanationMoney(appliedCredit)}`,
              `Τελικός ετήσιος φόρος: ${formatExplanationMoney(calculated.finalTax.year)}`,
              `Καθαρό εισόδημα: ${formatExplanationMoney(calculation.finalIncomeMonthly)} ανά μισθό, ${formatExplanationMoney(calculation.finalIncomeYearly)} ετησίως`,
            ]
          : [],
      },
    ],
    sources: rules.sources,
    hasCalculation,
  };
};

export const buildBusinessExplanation = (details) => {
  const rules = getTaxRules(details.taxationYear);
  const businessRules = rules.business;
  const minimumIncomeReady =
    !businessRules.minimumPresumedIncome.enabled ||
    (Number.isInteger(Number(details.minimumPresumedIncome?.businessAge)) &&
      Number(details.minimumPresumedIncome.businessAge) > 0 &&
      typeof details.minimumPresumedIncome?.hasAdjustments === "boolean");
  const hasCalculation =
    asNumber(details.grossIncome?.month) > 0 &&
    asNumber(details.grossIncome?.year) > 0 &&
    minimumIncomeReady;
  const calculation = hasCalculation
    ? calculateBusinessResults({ userDetails: details, rules: businessRules })
    : null;
  const table = calculation?.nextBusinessTable;
  const taxableIncome = table?.taxableIncome?.year ?? 0;
  const tax = getTaxModel({
    taxableIncome,
    policy: businessRules.incomeTax,
    ageGroup: details.ageGroup,
    children: details.numberOfChildren,
  });
  const selectedScale = details.discountOptions.specialInsuranceScale
    ? businessRules.insurance.specialScale
    : details.insuranceScaleSelection;
  const insuranceMonthlyAmounts = getInsuranceMonthlyAmounts({
    rules: businessRules,
  });
  const unemploymentContribution =
    businessRules.insurance.monthlyUnemploymentContribution ?? 0;
  const taxWasDiscounted =
    hasCalculation && calculation.totalTax.year < tax.tax;

  return {
    year: rules.year,
    intro: `Οι παρακάτω συντελεστές και τα παραδείγματα προκύπτουν από τους κανόνες του ${rules.year} και τις τρέχουσες τιμές της φόρμας.`,
    sections: [
      {
        title: "Ασφαλιστική κατηγορία",
        description: `Η επιλεγμένη κατηγορία είναι η ${selectedScale === 0 ? "ειδική" : `${selectedScale}η`} και αντιστοιχεί σε ${formatExplanationMoney(insuranceMonthlyAmounts[selectedScale])} τον μήνα.${unemploymentContribution > 0 ? ` Το ποσό περιλαμβάνει εισφορά ανεργίας ${formatExplanationMoney(unemploymentContribution)} ανά ασφαλισμένο μήνα και δεν περιλαμβάνει τυχόν εισφορές επικουρικής ασφάλισης, εφάπαξ παροχής ή Στέγης Υγειονομικών.` : ""}`,
        rules: insuranceMonthlyAmounts.map(
          (amount, index) =>
            `${index === 0 ? "Ειδική" : `${index}η κατηγορία`}: ${formatExplanationMoney(amount)} / μήνα`,
        ),
        items: table
          ? [
              `Σύνολο εισφορών περιόδου: ${formatExplanationMoney(table.insurance.year)}`,
            ]
          : [],
      },
      {
        title: "Φορολογητέο εισόδημα",
        description:
          "Το φορολογητέο εισόδημα προκύπτει από τα ακαθάριστα έσοδα, μετά την αφαίρεση των ασφαλιστικών εισφορών και των δηλωμένων επαγγελματικών εξόδων.",
        items: table
          ? [
              `Ακαθάριστα έσοδα περιόδου: ${formatExplanationMoney(table.grossIncome.year)}`,
              `Μείον ασφαλιστικές εισφορές: ${formatExplanationMoney(table.insurance.year)}`,
              `Μείον επαγγελματικά έξοδα: ${formatExplanationMoney(table.businessExpenses.year)}`,
              `Φορολογητέο εισόδημα: ${formatExplanationMoney(taxableIncome)}`,
            ]
          : [],
      },
      {
        title: "Κλίμακα φόρου εισοδήματος",
        description:
          "Ο φόρος υπολογίζεται προοδευτικά με την κλίμακα που αντιστοιχεί στο έτος και, όπου προβλέπεται, στην ηλικία και στον αριθμό τέκνων.",
        rules: tax.brackets,
        exampleTitle: hasCalculation ? "Εφαρμογή στο εισόδημά σου" : null,
        example: tax.breakdown,
        items: hasCalculation
          ? [
              `Φόρος κλίμακας: ${formatExplanationMoney(tax.tax)}`,
              ...(taxWasDiscounted
                ? [
                    `Φόρος μετά την έκπτωση πρώτων ετών: ${formatExplanationMoney(calculation.totalTax.year)}`,
                  ]
                : []),
            ]
          : [],
      },
      {
        title: "Προκαταβολή και παρακράτηση φόρου",
        description: `Η αρχική προκαταβολή επόμενου έτους είναι ${formatExplanationRate(businessRules.taxPrepayment.rate)} του φόρου. Από αυτήν αφαιρείται η παρακράτηση και δεν βεβαιώνεται ποσό έως ${formatExplanationMoney(businessRules.taxPrepayment.minimumAssessmentAmount)}. Η έκπτωση πρώτων ετών στην προκαταβολή χρησιμοποιεί συντελεστή ${formatExplanationRate(businessRules.taxPrepayment.discountMultiplier)}. Η παρακράτηση τιμολογίων είναι ${formatExplanationRate(businessRules.withholding.rate)}.`,
        items: hasCalculation
          ? [
              ...(details.withholdingTax
                ? [
                    `Παρακράτηση που έχει ήδη αποδοθεί: ${formatExplanationMoney(table.withholdingTaxAmount.year)}`,
                  ]
                : []),
              ...(details.prePaidNextYearTax
                ? [
                    `Προκαταβολή επόμενου έτους: ${formatExplanationMoney(calculation.taxInAdvanceValue.year)}`,
                  ]
                : []),
              `Καθαρό εισόδημα περιόδου: ${formatExplanationMoney(calculation.finalIncome.year)}`,
            ]
          : [],
      },
    ],
    sources: rules.sources,
    hasCalculation,
  };
};

export const buildExplanation = (entity, details) => {
  if (entity === "employee") return buildEmployeeExplanation(details);
  if (entity === "business") return buildBusinessExplanation(details);
  throw new Error(`Unknown calculator entity: ${entity}`);
};
