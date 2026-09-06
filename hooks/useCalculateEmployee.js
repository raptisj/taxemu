import { useToast } from "@chakra-ui/react";
import { useStore } from "store";
import {
  applyReturnBaseInland,
  calculateIncomeTaxFromPolicy,
  calculateChildrenDiscount,
  ceilMoney,
  omitDiscountIfNegative,
  roundMoney,
  toFixedNumber,
} from "../utils";
import { getEmployeeRules } from "../rules";

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

  const insuranceMonthly = roundMoney(
    Math.min(
      currentGrossMonth,
      rules.insurance.monthlyContributionCap,
    ) * rules.insurance.employeeRate,
  );
  const employerMonthlyDues = roundMoney(
    currentGrossMonth * rules.insurance.employerRate,
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

export const useCalculateEmployee = () => {
  const userDetails = useStore((state) => state.userDetails.employee);
  const hasError = useStore((state) => state.userDetails.employee.hasError);
  const commitEmployeeCalculation = useStore(
    (state) => state.commitEmployeeCalculation,
  );
  const setHasError = useStore((state) => state.setHasError);
  const toast = useToast();

  const showError = () => {
    toast({
      title: "Λείπουν απαιτούμενα πεδία!",
      position: "top",
      isClosable: true,
      status: "warning",
    });
    return setHasError({ entity: "employee", value: true });
  };

  const commitResult = ({
    result,
    finalIncomeMonthly = result.finalIncomeMonthly,
    finalIncomeYearly = result.finalIncomeYearly,
    grossIncomeMonthly,
    grossIncomeYearly,
  }) => {
    const {
      activeInput,
      discountOptions,
      finalMonthOrYear,
      grossMonthOrYear,
      numberOfChildren,
      salaryMonthCount,
    } = userDetails;

    commitEmployeeCalculation({
      newState: {
        ...result.calculatedState,
        grossIncomeMonthly,
        grossIncomeYearly,
        finalIncomeMonthly,
        finalIncomeYearly,
        finalMonthOrYear:
          activeInput === "gross" ? grossMonthOrYear : finalMonthOrYear,
        grossMonthOrYear:
          activeInput === "final" ? finalMonthOrYear : grossMonthOrYear,
      },
      tableResults: {
        grossIncome: {
          month: grossIncomeMonthly,
          year: grossIncomeYearly,
        },
        finalIncome: {
          month: finalIncomeMonthly,
          year: finalIncomeYearly,
        },
        salaryMonthCount,
        numberOfChildren,
        discountOptions: {
          returnBaseInland: discountOptions.returnBaseInland,
        },
      },
    });
  };

  const centralCalculation = () => {
    if (!userDetails.grossIncomeYearly || !userDetails.grossIncomeMonthly) {
      return showError();
    }

    const result = calculateEmployeeForGrossMonth(
      userDetails,
      userDetails.grossIncomeMonthly,
    );
    commitResult({
      grossIncomeMonthly: userDetails.grossIncomeMonthly,
      grossIncomeYearly: userDetails.grossIncomeYearly,
      result,
    });
  };

  const reverseCentralCalculation = () => {
    if (!userDetails.finalIncomeMonthly || !userDetails.finalIncomeYearly) {
      return showError();
    }

    let grossIncomeMonthly = 0;
    let result = null;

    for (
      let candidate = userDetails.finalIncomeMonthly * 2;
      candidate > 0;
      candidate--
    ) {
      const candidateResult = calculateEmployeeForGrossMonth(
        userDetails,
        candidate,
      );

      if (
        candidateResult.finalIncomeMonthly === userDetails.finalIncomeMonthly
      ) {
        grossIncomeMonthly = candidate;
        result = candidateResult;
        break;
      }
    }

    result ??= calculateEmployeeForGrossMonth(userDetails, 0);
    commitResult({
      finalIncomeMonthly: userDetails.finalIncomeMonthly,
      finalIncomeYearly: userDetails.finalIncomeYearly,
      grossIncomeMonthly,
      grossIncomeYearly: grossIncomeMonthly * userDetails.salaryMonthCount,
      result,
    });
  };

  return {
    centralCalculation,
    hasError,
    reverseCentralCalculation,
  };
};
