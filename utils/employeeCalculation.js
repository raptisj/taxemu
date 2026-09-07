import { getEmployeeRules } from "../rules";
import {
  applyReturnBaseInland,
  calculateChildrenDiscount,
  ceilMoney,
  omitDiscountIfNegative,
  roundMoney,
  toFixedNumber,
} from "./employee";
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

  const contributionBase = Math.min(
    currentGrossMonth,
    rules.insurance.monthlyContributionCap,
  );
  const insuranceMonthly = roundMoney(
    contributionBase * rules.insurance.employeeRate,
  );
  const employerMonthlyDues = roundMoney(
    contributionBase * rules.insurance.employerRate,
  );
  const sumToBeTaxed =
    (currentGrossMonth - insuranceMonthly) * salaryMonthCount;
  const grossAfterInsuranceMonthly = currentGrossMonth - insuranceMonthly;
  const grossAfterInsuranceYearly = ceilMoney(
    grossAfterInsuranceMonthly * salaryMonthCount,
  );
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

  const childDiscountAmount =
    rules.taxCredit.amountByChildren[String(numberOfChildren)];
  if (childDiscountAmount === undefined) {
    throw new Error(
      `No employee tax credit configured for ${numberOfChildren} children in ${taxationYear}`,
    );
  }
  const { discount } = calculateChildrenDiscount({
    amount: grossAfterInsuranceYearly,
    childDiscountAmount,
    reductionStartsAbove: rules.taxCredit.reductionStartsAbove,
    reductionRate: rules.taxCredit.reductionRate,
  });
  const canApplyDiscount = ceilMoney(taxBeforeDiscount) > childDiscountAmount;
  const taxAfterDiscount = canApplyDiscount
    ? omitDiscountIfNegative(taxBeforeDiscount, discount)
    : 0;
  const finalIncomeBeforeRounding =
    grossAfterInsuranceMonthly - taxAfterDiscount / salaryMonthCount;
  const finalIncomeMonthly = toFixedNumber(finalIncomeBeforeRounding, 0);
  const finalIncomeYearly = toFixedNumber(
    finalIncomeBeforeRounding * salaryMonthCount,
    0,
  );
  const totalEmployerCostMonthly = currentGrossMonth + employerMonthlyDues;
  const totalEmployerCostYearly =
    totalEmployerCostMonthly * salaryMonthCount;
  const taxWedgeMonthly = totalEmployerCostMonthly - finalIncomeMonthly;
  const taxWedgeYearly = totalEmployerCostYearly - finalIncomeYearly;
  const asPercentageOfEmployerCost = (amount, employerCost) =>
    employerCost > 0 ? toFixedNumber((amount / employerCost) * 100, 2) : 0;

  return {
    finalIncomeMonthly,
    finalIncomeYearly,
    calculatedState: {
      initialTax: {
        month: ceilMoney(taxBeforeDiscount) / salaryMonthCount,
        year: ceilMoney(taxBeforeDiscount),
      },
      employerObligations: {
        month: employerMonthlyDues,
        year: employerMonthlyDues * salaryMonthCount,
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
      childrenDiscountAmount: { month: 0, year: discount },
      taxableIncome: {
        month: ceilMoney(taxableSum / salaryMonthCount),
        year: taxableSum,
      },
      taxAfterDiscount,
      currentInsuranceDiscount: ceilMoney(discount),
      insurance: {
        month: insuranceMonthly,
        year: insuranceMonthly * salaryMonthCount,
      },
      finalTax: {
        month: taxAfterDiscount / salaryMonthCount,
        year: taxAfterDiscount,
      },
    },
  };
};
