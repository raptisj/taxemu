import { useStore } from "store";
import { useToast } from "@chakra-ui/react";
import { getInsuranceTotal, calculateBusinessResults } from "utils";

// TODO: make these dynamic depending the year
const WITHHOLDING_TAX_PERCENTAGE = 0.2;
const PRE_PAID_TAX_PERCENTAGE = 0.55;

export const useCalculateBusiness = () => {
  const userDetails = useStore((state) => state.userDetails.business);
  const hasError = useStore((state) => state.userDetails.business.hasError);
  const updateBusiness = useStore((state) => state.updateBusiness);
  const updateBusinessTable = useStore((state) => state.updateBusinessTable);
  const setHasError = useStore((state) => state.setHasError);
  const toast = useToast();

  const {
    grossIncome,
    taxationYearScales,
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
        prePaidTaxPercentage: PRE_PAID_TAX_PERCENTAGE,
        withholdingTaxPercentage: WITHHOLDING_TAX_PERCENTAGE,
      });

    updateBusiness({ totalTax });

    if (prePaidNextYearTax) {
      updateBusiness({
        taxInAdvance: taxInAdvanceValue,
      });

      updateBusinessTable({
        taxInAdvance: taxInAdvanceValue,
      });
    }

    updateBusinessTable(nextBusinessTable);

    updateBusiness({
      finalIncome,
      dirtyFormState: [],
    });
  };

  const getInsuranceTotalForUI = (type = "month") =>
    getInsuranceTotal({
      taxationYearScales,
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
