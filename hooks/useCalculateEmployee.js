import { useStore } from "store";
import { useToast } from "@chakra-ui/react";
import {
  assertFiniteNonNegative,
  getBrackets,
  calcProgressiveTax,
} from "../utils";
import { taxScales2021, SCALES_BY_AGE_GROUP } from "../constants";

export const useCalculateEmployee = () => {
  const userDetails = useStore((state) => state.userDetails.employee);
  const hasError = useStore((state) => state.userDetails.employee.hasError);
  const updateEmployee = useStore((state) => state.updateEmployee);
  const updateEmployeeTable = useStore((state) => state.updateEmployeeTable);
  const setHasError = useStore((state) => state.setHasError);
  const toast = useToast();

  const {
    grossIncomeYearly,
    grossIncomeMonthly,
    salaryMonthCount,
    discountOptions,
    taxationYear,
    taxationYearScales,
    numberOfChildren,
    numberOfChildrenScales,
    finalIncomeMonthly,
    finalIncomeYearly,
    activeInput,
    grossMonthOrYear,
    finalMonthOrYear,
    employerPercentages,
    ageGroup,
  } = userDetails;

  function calculateIncomeTax({
    taxableIncome,
    ageGroup,
    children = 0,
    scalesByAgeGroup,
  }) {
    assertFiniteNonNegative(taxableIncome, "taxableIncome");
    if (!Number.isInteger(children) || children < 0) {
      throw new Error("children must be a non-negative integer");
    }

    const brackets = getBrackets(scalesByAgeGroup, ageGroup, children);

    const grossTax = calcProgressiveTax(taxableIncome, brackets);

    return {
      taxableIncome,
      ageGroup,
      children,
      grossTax: Math.round(grossTax * 100) / 100,
    };
  }

  const SCALE_THRESHOLD = 10000;
  const RETURN_BASE_INLAND_PERCENTAGE = 0.5;

  const calculateWithCurrentScalesV2 = ({ currentScales, sumToBeTaxed }) => {
    let remainingAmount = sumToBeTaxed;
    let totalTax = 0;
    const processedScales = [];

    // Process each scale in order
    for (let index = 0; index < currentScales.length; index++) {
      const scale = currentScales[index];
      let taxableAmountForThisScale = 0;

      if (remainingAmount <= 0) {
        // No remaining amount, set scale amount to 0
        taxableAmountForThisScale = 0;
      } else if (index < 4) {
        // For the first 4 scales, use threshold-based calculation
        taxableAmountForThisScale = Math.min(remainingAmount, SCALE_THRESHOLD);
        remainingAmount -= taxableAmountForThisScale;
      } else {
        // For the last scale (index 4+), use all remaining amount
        taxableAmountForThisScale = remainingAmount;
        remainingAmount = 0;
      }

      const scaleAmount = taxableAmountForThisScale * scale.multiplier;
      totalTax += scaleAmount;

      // Create the processed scale with the calculated amount
      processedScales.push({
        multiplier: scale.multiplier,
        amount: scaleAmount,
      });
    }

    return totalTax;
  };

  const calculateChildrenDiscount = ({ amount, childDiscountAmount }) => {
    let discount;

    if (amount > 12000) {
      const aboveThresholdAmount = amount - 12000;
      const result = aboveThresholdAmount * 0.02;
      discount = childDiscountAmount - result;
    } else {
      discount = childDiscountAmount;
    }

    return { discount };
  };

  const showError = () => {
    toast({
      title: "Λείπουν απαιτούμενα πεδία!",
      position: "top",
      isClosable: true,
      status: "warning",
    });

    return setHasError({ entity: "employee", value: true });
  };

  const omitDiscountIfNegative = (_taxBefore, _discount) => {
    if (_discount < 0) {
      return Math.ceil(_taxBefore);
    }
    return Math.round(Math.ceil(_taxBefore) - Math.ceil(_discount));
  };

  const applyIfReturnBaseInland = (_sumToBeTaxed) => {
    if (discountOptions.returnBaseInland) {
      return _sumToBeTaxed * RETURN_BASE_INLAND_PERCENTAGE;
    }
    return _sumToBeTaxed;
  };

  const centralCalculation = (outsideGrossMonth = 0) => {
    const throwError =
      (activeInput === "gross" || activeInput === "final") &&
      (!grossIncomeYearly || !grossIncomeMonthly) &&
      (!finalIncomeMonthly || !finalIncomeYearly);

    if (throwError) {
      showError();
    }

    // outsideGrossMonth is for the reverse calculation
    const currentGrossMonth =
      activeInput === "gross" ? grossIncomeMonthly : outsideGrossMonth;

    const insuranceMonthly = Math.round(
      Math.min(
        currentGrossMonth,
        taxationYearScales[taxationYear].maxTaxableSalary,
      ) * taxationYearScales[taxationYear].insurancePercentage,
    );

    const employerMonthlyDues = Math.round(
      currentGrossMonth * employerPercentages[taxationYear].value,
    );

    const sumToBeTaxed =
      (currentGrossMonth - insuranceMonthly) * salaryMonthCount;
    const grossAfterInsuranceMonthly = currentGrossMonth - insuranceMonthly;
    const grossAfterInsuranceYearly = Math.ceil(
      grossAfterInsuranceMonthly * salaryMonthCount,
    );

    const scalesResult = calculateWithCurrentScalesV2({
      currentScales: taxScales2021.taxScales,
      sumToBeTaxed: applyIfReturnBaseInland(sumToBeTaxed),
    });

    let taxBeforeDiscount;

    switch (taxationYear) {
      case 2021:
      case 2022:
      case 2023:
      case 2024:
      case 2025:
        taxBeforeDiscount = scalesResult;
        break;

      case 2026:
        const progressiveTaxResult = calculateIncomeTax({
          taxableIncome: applyIfReturnBaseInland(sumToBeTaxed),
          ageGroup: ageGroup,
          children: numberOfChildren,
          scalesByAgeGroup: SCALES_BY_AGE_GROUP,
        });
        taxBeforeDiscount = progressiveTaxResult.grossTax;
        break;

      // Future years can be easily added:
      // case 2027:
      //   // Handle 2027's specific calculation
      //   break;
      // case 2028:
      //   // Handle 2028's specific calculation
      //   break;

      default:
        throw new Error(
          `Unsupported taxation year: ${taxationYear}. Please add configuration for this year.`,
        );
    }

    const { discount } = calculateChildrenDiscount({
      amount: grossAfterInsuranceYearly,
      childDiscountAmount:
        numberOfChildrenScales[taxationYear][numberOfChildren].discount,
    });

    const canApplyDiscount =
      Math.ceil(taxBeforeDiscount) >
      numberOfChildrenScales[taxationYear][numberOfChildren].discount;

    // if discount is greater than taxBeforeDiscount make it 0
    const taxAfterDiscount = canApplyDiscount
      ? omitDiscountIfNegative(taxBeforeDiscount, discount)
      : 0;

    updateEmployee({
      initialTax: {
        month: Math.ceil(taxBeforeDiscount) / salaryMonthCount,
        year: Math.ceil(taxBeforeDiscount),
      },
      employerObligations: {
        month: employerMonthlyDues,
        year: employerMonthlyDues * salaryMonthCount,
      },
      childrenDiscountAmount: {
        month: 0,
        year: discount,
      },
      taxableIncome: {
        month: Math.ceil(
          applyIfReturnBaseInland(sumToBeTaxed) / salaryMonthCount,
        ),
        year: applyIfReturnBaseInland(sumToBeTaxed),
      },
      taxAfterDiscount,
      currentInsuranceDiscount: Math.ceil(discount),
      discountOptions: {
        ...discountOptions,
        returnBaseInland: discountOptions.returnBaseInland,
      },
      insurance: {
        month: insuranceMonthly,
        year: insuranceMonthly * salaryMonthCount,
      },
      finalTax: {
        month: taxAfterDiscount / salaryMonthCount,
        year: taxAfterDiscount,
      },
      dirtyFormState: [],
      finalMonthOrYear:
        activeInput === "gross" ? grossMonthOrYear : finalMonthOrYear,
      grossMonthOrYear:
        activeInput === "final" ? finalMonthOrYear : grossMonthOrYear,
    });

    // TODO: proper check
    const finalMonthlyResult =
      grossAfterInsuranceMonthly - taxAfterDiscount / salaryMonthCount;

    if (activeInput === "gross") {
      updateEmployee({
        finalIncomeMonthly: Number(finalMonthlyResult.toFixed(0)),
        finalIncomeYearly: Number(
          (finalMonthlyResult * salaryMonthCount).toFixed(0),
        ),
      });

      updateEmployeeTable({
        grossIncome: {
          month: Math.round(grossIncomeYearly / salaryMonthCount),
          year: grossIncomeYearly,
        },
        finalIncome: {
          month: Number(finalMonthlyResult.toFixed(0)),
          year: Number((finalMonthlyResult * salaryMonthCount).toFixed(0)),
        },
        salaryMonthCount,
        numberOfChildren,
        discountOptions: {
          returnBaseInland: discountOptions.returnBaseInland,
        },
      });
    }

    return {
      grossResult: Number(finalMonthlyResult.toFixed(0)),
    };
  };

  const reverseCentralCalculation = () => {
    let reverseResult = 0;
    let i = finalIncomeMonthly * 2;
    for (i; i > 0; i--) {
      const { grossResult } = centralCalculation(i);
      if (grossResult === finalIncomeMonthly) {
        reverseResult = i;
        break;
      }
    }

    updateEmployee({
      // TODO: deprecate these
      grossIncomeMonthly: Number(reverseResult.toFixed(0)),
      grossIncomeYearly: Number(reverseResult.toFixed(0)) * salaryMonthCount,
    });

    updateEmployeeTable({
      grossIncome: {
        month: Number(reverseResult.toFixed(0)),
        year: Number(reverseResult.toFixed(0)) * salaryMonthCount,
      },
      finalIncome: {
        month: finalIncomeMonthly,
        year: finalIncomeYearly,
      },
    });
  };

  return {
    centralCalculation,
    hasError,
    reverseCentralCalculation,
  };
};
