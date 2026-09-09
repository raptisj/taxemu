import { useStore } from "store";
import { useToast } from "@chakra-ui/react";
import { getInsuranceTotal, calculateBusinessResults } from "utils";
import { getBusinessRules } from "../rules";
import { getComparisonInput } from "../utils/yearComparison";

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
    minimumPresumedIncome,
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
    const minimumIncomeRules = getBusinessRules(
      taxationYear,
    ).minimumPresumedIncome;
    const businessAge = Number(minimumPresumedIncome?.businessAge);
    const adjustmentsAnswered =
      typeof minimumPresumedIncome?.hasAdjustments === "boolean";
    const employeeInputsMissing =
      minimumPresumedIncome?.hasAdjustments &&
      minimumPresumedIncome.employeeAdjustment &&
      (!(Number(minimumPresumedIncome.annualPayrollCost) > 0) ||
        !(Number(minimumPresumedIncome.highestPaidEmployeeGross) > 0));
    const turnoverInputMissing =
      minimumPresumedIncome?.hasAdjustments &&
      minimumPresumedIncome.turnoverAdjustment &&
      !(Number(minimumPresumedIncome.kadAverageTurnover) > 0);
    const otherIncomeMissing =
      minimumPresumedIncome?.hasAdjustments &&
      minimumPresumedIncome.otherIncomeAdjustment &&
      !(Number(minimumPresumedIncome.otherIncome) > 0);
    const reliefInputMissing =
      minimumPresumedIncome?.hasAdjustments &&
      minimumPresumedIncome.reliefAdjustment &&
      (minimumPresumedIncome.reliefType === "none" ||
        (minimumPresumedIncome.reliefType === "limited" &&
          (!(Number(minimumPresumedIncome.eligibleOperatingDays) > 0) ||
            Number(minimumPresumedIncome.eligibleOperatingDays) > 365)));
    const minimumIncomeInputsMissing =
      minimumIncomeRules.enabled &&
      (!Number.isInteger(businessAge) ||
        businessAge < 1 ||
        !adjustmentsAnswered ||
        employeeInputsMissing ||
        turnoverInputMissing ||
        otherIncomeMissing ||
        reliefInputMissing);
    const throwError =
      !grossIncome.year || !grossIncome.month || minimumIncomeInputsMissing;

    if (throwError) {
      return showError();
    }

    const {
      totalTax,
      taxInAdvanceValue,
      nextBusinessTable,
      finalIncome,
      taxableIncome,
    } = calculateBusinessResults({ userDetails });

    const taxInAdvance = prePaidNextYearTax
      ? taxInAdvanceValue
      : { month: 0, year: 0 };

    commitBusinessCalculation({
      newState: {
        totalTax,
        taxInAdvance,
        finalIncome,
        taxableIncome,
      },
      tableResults: {
        ...nextBusinessTable,
        taxableIncome,
        totalTax,
        taxInAdvance,
        calculationInput: getComparisonInput("business", userDetails),
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
