import { useStore } from "store";
import { useToast } from "@chakra-ui/react";
import { sortByMultiplier } from "../utils";

export const useCalculateEmployee = () => {
  const userDetails = useStore((state) => state.userDetails.employee);
  const hasError = useStore((state) => state.userDetails.employee.hasError);
  const addEmployeeDetail = useStore((state) => state.addEmployeeDetail);
  const setEmployeeHasError = useStore((state) => state.setEmployeeHasError);
  const toast = useToast();

  const {
    grossIncomeYearly,
    grossIncomeMonthly,
    grossMonthOrYear,
    salaryMonthCount,
    discountOptions,
    insuranceCarrier,
    taxationYear,
    taxationYearScales,
    numberOfChildren,
    numberOfChildrenScales,
    finalIncomeYearly,
    finalIncomeMonthly,
    finalMonthOrYear,
    taxScales,
    activeInput,
  } = userDetails;

  const SCALE_THRESHOLD = 10000;
  const RETURN_BASE_INLAND_PERCENTAGE = 0.5;

  const calculateWithCurrentScales = ({ currentScales, toBeTaxed }) => {
    let amount = toBeTaxed;
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

  // TOOO improve this function
  const centralCalculation = () => {
    // setEmployeeHasError({ value: false });
    // if (!grossIncomeYearly || !grossIncomeMonthly) {
    //   toast({
    //     title: "Λείπουν απαιτούμενα πεδία!",
    //     position: "top",
    //     isClosable: true,
    //     status: "warning",
    //   });
    //   return setEmployeeHasError({ value: true });
    // }

    const grossMonthly = discountOptions.returnBaseInland
      ? grossIncomeMonthly * RETURN_BASE_INLAND_PERCENTAGE
      : grossIncomeMonthly;

    const insuranceMonthly =
      grossIncomeMonthly * taxationYearScales[taxationYear].insurancePercentage;

    const toBeTaxed = (grossMonthly - insuranceMonthly) * salaryMonthCount;
    const grossAfterInsurance = grossIncomeMonthly - insuranceMonthly;

    addEmployeeDetail({
      value: insuranceMonthly,
      field: "insurancePerMonth",
    });

    addEmployeeDetail({
      value: insuranceMonthly * salaryMonthCount,
      field: "insurancePerYear",
    });

    const scales = calculateWithCurrentScales({
      currentScales: taxScales,
      toBeTaxed,
    });

    const totalTax = scales
      .map((scale) => scale.amount)
      .reduce((a, b) => a + b);

    const { discount, canApplyDiscount } = calculateChildrenDiscount({
      amount: grossAfterInsurance * salaryMonthCount,
      tax: totalTax,
      childDiscountAmount: numberOfChildrenScales[numberOfChildren].discount,
    });

    const taxAfterDiscount = totalTax - discount;
    const insuranceYearly = insuranceMonthly * salaryMonthCount;

    addEmployeeDetail({
      value: taxAfterDiscount + insuranceYearly,
      field: "taxYearly",
    });

    addEmployeeDetail({
      value: (taxAfterDiscount + insuranceYearly) / salaryMonthCount,
      field: "taxMonthly",
    });

    // TODO: proper check
    if (activeInput === "gross") {
      // console.log("in gross mode");
      addEmployeeDetail({
        value: Number(
          (
            grossAfterInsurance -
            (canApplyDiscount ? Math.round(totalTax - discount) : 0) /
              salaryMonthCount
          ).toFixed(0)
        ),
        field: "finalIncomeMonthly",
      });

      addEmployeeDetail({
        value: Number(
          (
            (grossAfterInsurance -
              (canApplyDiscount ? Math.round(totalTax - discount) : 0) /
                salaryMonthCount) *
            salaryMonthCount
          ).toFixed(0)
        ),
        field: "finalIncomeYearly",
      });
    }

    if (activeInput === "final") {
      // console.log("in final mode");
      addEmployeeDetail({
        value: Number(
          (
            grossAfterInsurance -
            (canApplyDiscount ? Math.round(totalTax - discount) : 0) /
              salaryMonthCount
          ).toFixed(0)
        ),
        field: "grossIncomeMonthly",
      });

      addEmployeeDetail({
        value: (
          Number(
            grossAfterInsurance -
              (canApplyDiscount ? Math.round(totalTax - discount) : 0) /
                salaryMonthCount
          ) * salaryMonthCount
        ).toFixed(0),
        field: "grossIncomeYearly",
      });
    }
    // console.log(finalIncomeYearly, "finalIncomeYearly");
    // console.log(finalIncomeMonthly, "finalIncomeMonthly");
  };

  return {
    centralCalculation,
    hasError,
  };
};
