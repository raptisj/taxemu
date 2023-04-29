import { useStore } from "store";
import { useToast } from "@chakra-ui/react";
import { sortByMultiplier } from "../utils";

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
    taxScales,
    activeInput,
  } = userDetails;

  const SCALE_THRESHOLD = 10000;
  const RETURN_BASE_INLAND_PERCENTAGE = 0.5;

  const calculateWithCurrentScales = ({ currentScales, sumToBeTaxed }) => {
    let amount = sumToBeTaxed;
    let scales = currentScales;

    currentScales.map((scale, index) => {
      if (amount > SCALE_THRESHOLD) {
        if (index < 4) {
          amount -= SCALE_THRESHOLD;

          scales = [
            ...scales.filter((t) => t.multiplier !== scale.multiplier),
            {
              ...scales.find((t) => t.multiplier === scale.multiplier),
              amount: SCALE_THRESHOLD * scale.multiplier,
            },
          ].sort(sortByMultiplier);
        } else {
          scales = [
            ...scales.filter((t) => t.multiplier !== scale.multiplier),
            {
              ...scales.find((t) => t.multiplier === scale.multiplier),
              amount: amount * scale.multiplier,
            },
          ].sort(sortByMultiplier);
        }
      } else {
        scales = [
          ...scales.filter((t) => t.multiplier !== scale.multiplier),
          {
            ...scales.find((t) => t.multiplier === scale.multiplier),
            amount: amount * scale.multiplier,
          },
        ].sort(sortByMultiplier);
        amount = 0;
      }
      return scale;
    });

    return scales;
  };

  const calculateChildrenDiscount = ({ amount, tax, childDiscountAmount }) => {
    let discount;
    let canApplyDiscount = tax > childDiscountAmount;

    if (amount > 12000) {
      const aboveThresholdAmount = amount - 12000;
      const result = aboveThresholdAmount * 0.02;
      discount = childDiscountAmount - result;
    } else {
      discount = amount - childDiscountAmount;
    }

    return { discount, canApplyDiscount };
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

    const grossMonthly = discountOptions.returnBaseInland
      ? currentGrossMonth * RETURN_BASE_INLAND_PERCENTAGE
      : currentGrossMonth;

    const insuranceMonthly = Math.round(
      currentGrossMonth * taxationYearScales[taxationYear].insurancePercentage
    );

    const sumToBeTaxed = (grossMonthly - insuranceMonthly) * salaryMonthCount;
    const grossAfterInsuranceMonthly = currentGrossMonth - insuranceMonthly;
    const grossAfterInsuranceYearly = Math.ceil(
      grossAfterInsuranceMonthly * salaryMonthCount
    );

    const scales = calculateWithCurrentScales({
      currentScales: taxScales,
      sumToBeTaxed,
    });

    const taxBeforeDiscount = scales
      .map((scale) => scale.amount)
      .reduce((a, b) => a + b);

    const { discount, canApplyDiscount } = calculateChildrenDiscount({
      amount: grossAfterInsuranceYearly,
      tax: Math.ceil(taxBeforeDiscount),
      childDiscountAmount: numberOfChildrenScales[numberOfChildren].discount,
    });

    const taxAfterDiscount = Math.ceil(taxBeforeDiscount) - Math.ceil(discount);
    const insuranceYearly = insuranceMonthly * salaryMonthCount;

    updateEmployee({
      initialTax: {
        month: Math.ceil(taxBeforeDiscount) / salaryMonthCount,
        year: Math.ceil(taxBeforeDiscount),
      },
      taxAfterDiscount,
      currentInsuranceDiscount: Math.ceil(discount),
      insurance: {
        month: insuranceMonthly,
        year: insuranceMonthly * salaryMonthCount,
      },
      finalTax: {
        month: (taxAfterDiscount + insuranceYearly) / salaryMonthCount,
        year: taxAfterDiscount + insuranceYearly,
      },
      dirtyFormState: [],
    });

    // TODO: proper check
    const res =
      grossAfterInsuranceMonthly -
      (canApplyDiscount
        ? Math.round(Math.ceil(taxBeforeDiscount) - Math.ceil(discount))
        : 0) /
        salaryMonthCount;

    if (activeInput === "gross") {
      updateEmployee({
        finalIncomeMonthly: Number(res.toFixed(0)),
        finalIncomeYearly: Number((res * salaryMonthCount).toFixed(0)),
      });

      updateEmployeeTable({
        grossIncome: {
          month: Math.round(grossIncomeYearly / salaryMonthCount),
          year: grossIncomeYearly,
        },
        finalIncome: {
          month: Number(res.toFixed(0)),
          year: Number((res * salaryMonthCount).toFixed(0)),
        },
        salaryMonthCount,
      });
    }

    return {
      grossResult: Number(res.toFixed(0)),
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
