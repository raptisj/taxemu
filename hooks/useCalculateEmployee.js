import { useToast } from "@chakra-ui/react";
import { useStore } from "store";
import { calculateEmployeeForGrossMonth } from "../utils/employeeCalculation";
import { getComparisonInput } from "../utils/yearComparison";

export { calculateEmployeeForGrossMonth } from "../utils/employeeCalculation";

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

    const newState = {
      ...result.calculatedState,
      grossIncomeMonthly,
      grossIncomeYearly,
      finalIncomeMonthly,
      finalIncomeYearly,
      finalMonthOrYear:
        activeInput === "gross" ? grossMonthOrYear : finalMonthOrYear,
      grossMonthOrYear:
        activeInput === "final" ? finalMonthOrYear : grossMonthOrYear,
    };

    commitEmployeeCalculation({
      newState,
      tableResults: {
        ...result.calculatedState,
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
        taxationYear: userDetails.taxationYear,
        ageGroup: userDetails.ageGroup,
        calculationInput: getComparisonInput("employee", {
          ...userDetails,
          ...newState,
        }),
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
