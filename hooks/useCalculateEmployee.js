import { useToast } from "@chakra-ui/react";
import { useStore } from "store";
import { isEngineer, supportsEngineer, engineerUnsupportedMessage } from "../utils/employeeContributions";
import { calculateEmployeeForGrossMonth, solveEngineerGrossForNet } from "../utils/employeeCalculation";
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

  const showError = (title = "Λείπουν απαιτούμενα πεδία!") => {
    toast({
      title,
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
    if (isEngineer(userDetails) && !supportsEngineer(userDetails.taxationYear)) return showError(engineerUnsupportedMessage(userDetails.taxationYear));
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
    if (isEngineer(userDetails) && !supportsEngineer(userDetails.taxationYear)) return showError(engineerUnsupportedMessage(userDetails.taxationYear));
    if (!userDetails.finalIncomeMonthly || !userDetails.finalIncomeYearly) {
      return showError();
    }

    if (isEngineer(userDetails)) {
      const period = userDetails.finalMonthOrYear;
      const target = period === "year" ? userDetails.finalIncomeYearly : userDetails.finalIncomeMonthly;
      const { grossIncomeMonthly, result } = solveEngineerGrossForNet(userDetails, target, period);
      return commitResult({ result, grossIncomeMonthly, grossIncomeYearly: grossIncomeMonthly * userDetails.salaryMonthCount });
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
