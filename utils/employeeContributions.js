import { getEmployeeRules } from "../rules";

export const ENGINEER_PROFILE = "engineer";
export const employeeInsuranceDefaults = Object.freeze({
  insuranceProfile: "general",
  supplementaryCategory: 1,
  lumpSumCategory: 1,
  supplementaryFund: "efka",
});

export const isEngineer = (details) => details.insuranceProfile === ENGINEER_PROFILE;
export const supportsEngineer = (year) => Boolean(getEmployeeRules(year).insurance.engineer);
export const engineerUnsupportedMessage = (year) =>
  `Το προφίλ μισθωτού μηχανικού υποστηρίζεται μόνο για το 2026. Δεν υπάρχουν κανόνες για το ${year}.`;

export const moneyToCents = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const toMills = (value) => Math.round(value * 1000);
const sumAmounts = (rows, payer, period) =>
  rows.reduce((sum, row) => sum + toMills(row[payer][period]), 0) / 1000;

export const validateEmployeeInsuranceInput = (details) => {
  const profile = details.insuranceProfile ?? "general";
  if (!["general", ENGINEER_PROFILE].includes(profile)) throw new Error("Invalid insurance profile");
  if (!isEngineer(details)) return;
  if (!supportsEngineer(details.taxationYear)) throw new Error(engineerUnsupportedMessage(details.taxationYear));
  const rules = getEmployeeRules(details.taxationYear).insurance.engineer;
  for (const [field, amounts] of [
    ["supplementaryCategory", rules.supplementaryMonthlyAmounts],
    ["lumpSumCategory", rules.lumpSumMonthlyAmounts],
  ]) {
    const category = details[field] ?? rules.defaultCategory;
    if (!Number.isInteger(category) || category < 1 || category > amounts.length) {
      throw new Error(`Invalid ${field}`);
    }
  }
  if (!["efka", "teka"].includes(details.supplementaryFund ?? "efka")) {
    throw new Error("Invalid supplementary fund");
  }
};

// Full-year code 1022 estimate. Fixed category charges apply to insured months,
// while percentage charges apply to the selected salary equivalents (including gifts).
// Preserve half-cent monthly payer shares; round annual components to cents.
export const calculateEngineerContributions = (details, grossMonth) => {
  validateEmployeeInsuranceInput(details);
  const { insurance } = getEmployeeRules(details.taxationYear);
  const rules = insurance.engineer;
  const salaries = Number(details.salaryMonthCount);
  if (!Number.isFinite(grossMonth) || grossMonth < 0 || !Number.isFinite(salaries) || salaries < 12) {
    throw new Error("Engineer estimates require non-negative pay and at least 12 salary equivalents");
  }
  const base = Math.min(grossMonth, insurance.monthlyContributionCap);
  const supplementaryCategory = details.supplementaryCategory ?? rules.defaultCategory;
  const lumpSumCategory = details.lumpSumCategory ?? rules.defaultCategory;
  const supplementaryFund = details.supplementaryFund ?? "efka";
  const fixedMonths = grossMonth > 0 ? rules.insuredMonths : 0;
  const fixedPair = (monthly) => ({ ordinaryMonth: monthly, year: moneyToCents(monthly * fixedMonths) });
  const rows = rules.components.map((component) => ({
    ...component,
    kind: "percentage",
    base,
    employee: { ordinaryMonth: toMills(base * component.employeeRate) / 1000, year: moneyToCents(base * salaries * component.employeeRate) },
    employer: { ordinaryMonth: toMills(base * component.employerRate) / 1000, year: moneyToCents(base * salaries * component.employerRate) },
  }));
  const supplementary = grossMonth > 0 ? rules.supplementaryMonthlyAmounts[supplementaryCategory - 1] : 0;
  const lumpSum = grossMonth > 0 ? rules.lumpSumMonthlyAmounts[lumpSumCategory - 1] : 0;
  rows.push({
    id: "supplementary", label: `Επικουρική ασφάλιση (${supplementaryFund === "teka" ? "ΤΕΚΑ" : "e-ΕΦΚΑ"})`,
    kind: "fixed", category: supplementaryCategory, sourceUrls: rules.sourceUrls,
    employee: fixedPair(supplementary * rules.supplementaryEmployeeShare),
    employer: fixedPair(supplementary * (1 - rules.supplementaryEmployeeShare)),
  }, {
    id: "lumpSum", label: "Εφάπαξ παροχή", kind: "fixed", category: lumpSumCategory, sourceUrls: rules.sourceUrls,
    employee: fixedPair(lumpSum), employer: fixedPair(0),
  });
  return {
    profile: ENGINEER_PROFILE, coverageCode: rules.coverageCode,
    supplementaryCategory, lumpSumCategory, supplementaryFund,
    insuredMonths: rules.insuredMonths, salaryMonthCount: salaries,
    rows,
    employee: { ordinaryMonth: sumAmounts(rows, "employee", "ordinaryMonth"), year: moneyToCents(sumAmounts(rows, "employee", "year")) },
    employer: { ordinaryMonth: sumAmounts(rows, "employer", "ordinaryMonth"), year: moneyToCents(sumAmounts(rows, "employer", "year")) },
  };
};

export const formatContributionMoney = (value) => new Intl.NumberFormat("el-GR", {
  style: "currency", currency: "EUR", minimumFractionDigits: 2,
  maximumFractionDigits: Math.abs(toMills(value) % 10) > 0 ? 3 : 2,
}).format(value);

export const engineerEstimateNote = "Εκτίμηση πλήρους έτους: 12 ασφαλισμένοι μήνες, ιδιωτικός τομέας, πρώην ΤΣΜΕΔΕ, ΕΟΠΥΥ, χωρίς επαγγελματικό κίνδυνο ή επιδότηση. Τα πάγια δεν χρεώνονται ξανά στα δώρα. Οι μισθολογικές ισοδυναμίες ορίζουν το ετήσιο μικτό ποσό· δεν προστίθεται αυτόματα ο συντελεστής επιδόματος αδείας στα δώρα. Τα ποσά είναι πριν από τη στρογγυλοποίηση κάθε μισθοδοσίας.";
