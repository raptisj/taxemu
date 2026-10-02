import { getEmployeeRules } from "../rules";
import {
  applyReturnBaseInland,
  calculateChildrenDiscount,
  ceilMoney,
  getEmployeeTaxCreditAmount,
  omitDiscountIfNegative,
  roundMoney,
  toFixedNumber,
} from "./employee";
import { calculateEngineerContributions, isEngineer, moneyToCents, validateEmployeeInsuranceInput } from "./employeeContributions";
import { calculateIncomeTaxFromPolicy } from "./taxPolicy";

export const calculateEmployeeForGrossMonth = (
  userDetails,
  currentGrossMonth,
) => {
  const {
    salaryMonthCount,
    discountOptions,
    taxationYear,
    numberOfChildren,
    ageGroup,
  } = userDetails;
  const rules = getEmployeeRules(taxationYear);
  validateEmployeeInsuranceInput(userDetails);
  const engineer = isEngineer(userDetails);
  const contributionBreakdown = engineer ? calculateEngineerContributions(userDetails, currentGrossMonth) : null;

  const contributionBase = Math.min(
    currentGrossMonth,
    rules.insurance.monthlyContributionCap,
  );
  const insuranceMonthly = engineer
    ? contributionBreakdown.employee.year / salaryMonthCount
    : roundMoney(contributionBase * rules.insurance.employeeRate);
  const employerMonthlyDues = engineer
    ? contributionBreakdown.employer.year / salaryMonthCount
    : roundMoney(contributionBase * rules.insurance.employerRate);
  const employeeAnnualDues = engineer ? contributionBreakdown.employee.year : insuranceMonthly * salaryMonthCount;
  const employerAnnualDues = engineer ? contributionBreakdown.employer.year : employerMonthlyDues * salaryMonthCount;
  const sumToBeTaxed = engineer
    ? Math.max(0, moneyToCents(currentGrossMonth * salaryMonthCount - employeeAnnualDues))
    : (currentGrossMonth - insuranceMonthly) * salaryMonthCount;
  const grossAfterInsuranceMonthly = currentGrossMonth - insuranceMonthly;
  const grossAfterInsuranceYearly = engineer ? sumToBeTaxed : ceilMoney(grossAfterInsuranceMonthly * salaryMonthCount);
  const taxableSum = applyReturnBaseInland(
    sumToBeTaxed,
    discountOptions.returnBaseInland,
    rules.returningResident.taxableIncomeMultiplier,
  );
  const { tax: taxBeforeDiscount } = calculateIncomeTaxFromPolicy({
    taxableIncome: taxableSum,
    policy: rules.incomeTax,
    ageGroup,
    children: numberOfChildren,
  });

  const childDiscountAmount = getEmployeeTaxCreditAmount(
    rules.taxCredit,
    numberOfChildren,
  );
  if (childDiscountAmount === undefined) {
    throw new Error(
      `No employee tax credit configured for ${numberOfChildren} children in ${taxationYear}`,
    );
  }
  const { discount } = calculateChildrenDiscount({
    amount: grossAfterInsuranceYearly,
    childDiscountAmount,
    children: numberOfChildren,
    reductionExemptAtOrAboveChildren:
      rules.taxCredit.reductionExemptAtOrAboveChildren,
    reductionStartsAbove: rules.taxCredit.reductionStartsAbove,
    reductionRate: rules.taxCredit.reductionRate,
  });
  const canApplyDiscount = ceilMoney(taxBeforeDiscount) > childDiscountAmount;
  const taxAfterDiscount = engineer
    ? moneyToCents(Math.max(0, taxBeforeDiscount - discount))
    : canApplyDiscount
      ? omitDiscountIfNegative(taxBeforeDiscount, discount)
      : 0;
  const finalIncomeBeforeRounding =
    grossAfterInsuranceMonthly - taxAfterDiscount / salaryMonthCount;
  const finalIncomeMonthly = toFixedNumber(finalIncomeBeforeRounding, engineer ? 2 : 0);
  const finalIncomeYearly = toFixedNumber(
    finalIncomeBeforeRounding * salaryMonthCount,
    engineer ? 2 : 0,
  );
  const totalEmployerCostMonthly = currentGrossMonth + employerMonthlyDues;
  const totalEmployerCostYearly = engineer
    ? moneyToCents(currentGrossMonth * salaryMonthCount + employerAnnualDues)
    : totalEmployerCostMonthly * salaryMonthCount;
  const taxWedgeMonthly = totalEmployerCostMonthly - finalIncomeMonthly;
  const taxWedgeYearly = totalEmployerCostYearly - finalIncomeYearly;
  const asPercentageOfEmployerCost = (amount, employerCost) =>
    employerCost > 0 ? toFixedNumber((amount / employerCost) * 100, 2) : 0;

  return {
    finalIncomeMonthly,
    finalIncomeYearly,
    calculatedState: {
      contributionBreakdown,
      monthlyAmountsAreAverages: engineer,
      initialTax: {
        month: (engineer ? moneyToCents(taxBeforeDiscount) : ceilMoney(taxBeforeDiscount)) / salaryMonthCount,
        year: engineer ? moneyToCents(taxBeforeDiscount) : ceilMoney(taxBeforeDiscount),
      },
      employerObligations: {
        month: employerMonthlyDues,
        year: employerAnnualDues,
      },
      totalEmployerCost: {
        month: totalEmployerCostMonthly,
        year: totalEmployerCostYearly,
      },
      taxWedge: {
        month: taxWedgeMonthly,
        year: taxWedgeYearly,
      },
      taxWedgePercentage: {
        month: asPercentageOfEmployerCost(
          taxWedgeMonthly,
          totalEmployerCostMonthly,
        ),
        year: asPercentageOfEmployerCost(
          taxWedgeYearly,
          totalEmployerCostYearly,
        ),
      },
      childrenDiscountAmount: {
        month: discount / salaryMonthCount,
        year: discount,
      },
      taxableIncome: {
        month: engineer ? taxableSum / salaryMonthCount : ceilMoney(taxableSum / salaryMonthCount),
        year: taxableSum,
      },
      taxAfterDiscount,
      currentInsuranceDiscount: ceilMoney(discount),
      insurance: {
        month: insuranceMonthly,
        year: employeeAnnualDues,
      },
      finalTax: {
        month: taxAfterDiscount / salaryMonthCount,
        year: taxAfterDiscount,
      },
    },
  };
};

// Search the shared forward formula so reverse estimates use the same fixed charges
// and annual tax basis. The requested monthly amount is an average per salary.
export const solveEngineerGrossForNet = (details, target, period = "month") => {
  if (!Number.isFinite(target) || target <= 0) throw new Error("A positive net income is required");
  const wanted = period === "year" ? target : target * details.salaryMonthCount;
  let low = 0;
  let high = Math.max(1000, wanted / details.salaryMonthCount * 2);
  let attempts = 0;
  while (calculateEmployeeForGrossMonth(details, high).finalIncomeYearly < wanted) {
    high *= 2;
    if (++attempts > 40) throw new Error("Could not bracket engineer net income");
  }
  for (let index = 0; index < 60; index++) {
    const middle = (low + high) / 2;
    if (calculateEmployeeForGrossMonth(details, middle).finalIncomeYearly >= wanted) high = middle;
    else low = middle;
  }
  const grossIncomeMonthly = moneyToCents(high);
  return { grossIncomeMonthly, result: calculateEmployeeForGrossMonth(details, grossIncomeMonthly) };
};
