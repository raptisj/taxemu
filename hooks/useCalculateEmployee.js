import { useStore } from "store";
import { useToast } from "@chakra-ui/react";
import {
  calculateIncomeTax,
  calculateEmployeeScalesTax,
  calculateChildrenDiscount,
  applyReturnBaseInland,
  omitDiscountIfNegative,
  roundMoney,
  ceilMoney,
  toFixedNumber,
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

  const showError = () => {
    toast({
      title: "Λείπουν απαιτούμενα πεδία!",
      position: "top",
      isClosable: true,
      status: "warning",
    });

    return setHasError({ entity: "employee", value: true });
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

    const insuranceMonthly = roundMoney(
      Math.min(
        currentGrossMonth,
        taxationYearScales[taxationYear].maxTaxableSalary,
      ) * taxationYearScales[taxationYear].insurancePercentage,
    );

    const employerMonthlyDues = roundMoney(
      currentGrossMonth * employerPercentages[taxationYear].value,
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
    );

    const scalesResult = calculateEmployeeScalesTax({
      currentScales: taxScales2021.taxScales,
      sumToBeTaxed: taxableSum,
    });

    const taxByYear = {
      2021: () => scalesResult,
      2022: () => scalesResult,
      2023: () => scalesResult,
      2024: () => scalesResult,
      2025: () => scalesResult,
      2026: () =>
        calculateIncomeTax({
          taxableIncome: taxableSum,
          ageGroup: ageGroup,
          children: numberOfChildren,
          scalesByAgeGroup: SCALES_BY_AGE_GROUP,
        }).grossTax,
    };

    const taxBeforeDiscount = taxByYear[taxationYear]?.();
    if (taxBeforeDiscount === undefined) {
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
      ceilMoney(taxBeforeDiscount) >
      numberOfChildrenScales[taxationYear][numberOfChildren].discount;

    // if discount is greater than taxBeforeDiscount make it 0
    const taxAfterDiscount = canApplyDiscount
      ? omitDiscountIfNegative(taxBeforeDiscount, discount)
      : 0;

    const nextEmployeeState = {
      initialTax: {
        month: ceilMoney(taxBeforeDiscount) / salaryMonthCount,
        year: ceilMoney(taxBeforeDiscount),
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
        month: ceilMoney(taxableSum / salaryMonthCount),
        year: taxableSum,
      },
      taxAfterDiscount,
      currentInsuranceDiscount: ceilMoney(discount),
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
    };

    updateEmployee(nextEmployeeState);

    // TODO: proper check
    const finalMonthlyResult =
      grossAfterInsuranceMonthly - taxAfterDiscount / salaryMonthCount;

    if (activeInput === "gross") {
      updateEmployee({
        finalIncomeMonthly: toFixedNumber(finalMonthlyResult, 0),
        finalIncomeYearly: toFixedNumber(
          finalMonthlyResult * salaryMonthCount,
          0,
        ),
      });

      updateEmployeeTable({
        grossIncome: {
          month: roundMoney(grossIncomeYearly / salaryMonthCount),
          year: grossIncomeYearly,
        },
        finalIncome: {
          month: toFixedNumber(finalMonthlyResult, 0),
          year: toFixedNumber(finalMonthlyResult * salaryMonthCount, 0),
        },
        salaryMonthCount,
        numberOfChildren,
        discountOptions: {
          returnBaseInland: discountOptions.returnBaseInland,
        },
      });
    }

    return {
      grossResult: toFixedNumber(finalMonthlyResult, 0),
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
