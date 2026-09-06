import { useStore } from "store";
import { useToast } from "@chakra-ui/react";
import { getInsuranceTotal, calculateBusinessResults } from "utils";
import { getBusinessRules } from "../rules";

export const useCalculateBusiness = () => {
  const userDetails = useStore((state) => state.userDetails.business);
  const hasError = useStore((state) => state.userDetails.business.hasError);
  const commitBusinessCalculation = useStore(
    (state) => state.commitBusinessCalculation,
  );
  const setHasError = useStore((state) => state.setHasError);
  const toast = useToast();

  const {
    grossIncome,
    taxationYear,
    taxYearDuration,
    businessExpensesMonthOrYear,
    insuranceScaleSelection,
    discountOptions,
    prePaidNextYearTax,
  } = userDetails;
  const { specialInsuranceScale } = discountOptions;

  const showError = () => {
    toast({
      title: "Λείπουν απαιτούμενα πεδία!",
      position: "top",
      isClosable: true,
      status: "warning",
    });

    return setHasError({ entity: "business", value: true });
  };

  const centralCalculation = () => {
    const throwError = !grossIncome.year || !grossIncome.month;

    if (throwError) {
      return showError();
    }

    const { totalTax, taxInAdvanceValue, nextBusinessTable, finalIncome } =
      calculateBusinessResults({
        userDetails,
      });

    const taxInAdvance = prePaidNextYearTax
      ? taxInAdvanceValue
      : { month: 0, year: 0 };

    commitBusinessCalculation({
      newState: {
        totalTax,
        taxInAdvance,
        finalIncome,
      },
      tableResults: {
        ...nextBusinessTable,
        taxInAdvance,
      },
    });
  };

  const getInsuranceTotalForUI = (type = "month") =>
    getInsuranceTotal({
      rules: getBusinessRules(taxationYear),
      taxationYear,
      taxYearDuration,
      businessExpensesMonthOrYear,
      insuranceScaleSelection,
      specialInsuranceScale,
      type,
    });

  return {
    centralCalculation,
    getInsuranceTotal: getInsuranceTotalForUI,
    hasError,
  };
};
