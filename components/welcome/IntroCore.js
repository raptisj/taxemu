import { useStore } from "store";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Stepper from "components/stepper";
import { Box, Text, Flex } from "@chakra-ui/react";

export const IntroCore = () => {
  const calculatorType = useStore((state) => state.userDetails.calculatorType);
  const update = useStore((state) => state.update);
  const updateBusiness = useStore((state) => state.updateBusiness);
  const userDetails = useStore((state) => state.userDetails);
  const employeeDetails = useStore((state) => state.userDetails.employee);
  const updateEmployee = useStore((state) => state.updateEmployee);
  const router = useRouter();

  const isBusiness = calculatorType === "business";
  const name = isBusiness ? "Ελεύθερος επαγγελματίας" : "Μισθωτός";

  const { grossIncomeMonthly, grossIncomeYearly, grossMonthOrYear } =
    userDetails.business;
  const isGrossMonthly = grossMonthOrYear === "month";

  const { activeInput } = employeeDetails;
  const isGrossMonthlyEmployee =
    userDetails.employee.grossMonthOrYear === "month";
  const isFinalMonthlyEmployee =
    userDetails.employee.finalMonthOrYear === "month";

  const grossAmount = isGrossMonthlyEmployee
    ? userDetails.employee.grossIncomeMonthly || ""
    : userDetails.employee.grossIncomeYearly || "";

  const finalAmount = isFinalMonthlyEmployee
    ? userDetails.employee.finalIncomeMonthly || ""
    : userDetails.employee.finalIncomeYearly || "";

  const accountInputValue = activeInput === "gross" ? grossAmount : finalAmount;

  const handleCalculatorType = (value) => {
    update({
      calculatorType: value,
    });
  };

  const onChangeGrossIncome = (value, count = 12) => {
    updateBusiness({
      [isGrossMonthly ? "grossIncomeMonthly" : "grossIncomeYearly"]: Math.round(
        Number(value)
      ),
      [isGrossMonthly ? "grossIncomeYearly" : "grossIncomeMonthly"]:
        isGrossMonthly
          ? Math.round(Number(value) * count)
          : Math.round(Number(value) / count),
    });
  };

  const onChangeGrossIncomeEmployee = (value, count = 14) => {
    if (activeInput === "gross") {
      updateEmployee({
        [isGrossMonthlyEmployee ? "grossIncomeMonthly" : "grossIncomeYearly"]:
          Math.round(Number(value)),
        [isGrossMonthlyEmployee ? "grossIncomeYearly" : "grossIncomeMonthly"]:
          isGrossMonthlyEmployee
            ? Math.round(Number(value) * count)
            : Math.round(Number(value) / count),
      });
    }

    if (activeInput === "final") {
      updateEmployee({
        [isFinalMonthlyEmployee ? "finalIncomeMonthly" : "finalIncomeYearly"]:
          Math.round(Number(value)),
        [isFinalMonthlyEmployee ? "finalIncomeYearly" : "finalIncomeMonthly"]:
          isFinalMonthlyEmployee
            ? Math.round(Number(value) * count)
            : Math.round(Number(value) / count),
      });
    }
  };

  useEffect(() => {
    router.push({ query: { ...router.query, tab: "intro" } });
  }, []);

  // this is to reset state when navigating with browsers back button to welcome page again
  // useEffect(() => {
  //   removeUserDetails();
  // }, []);

  return (
    <Box mt="100px">
      <Text color="gray.400">Πρώτα απ’όλα...</Text>
      <Flex mt={8} flexDirection="column">
        <Flex flexWrap="wrap" alignItems="center">
          <Stepper.Content text="Είμαι" mr={2} mb={4} />

          <Stepper.MenuPopover
            name={calculatorType}
            label={name}
            onChange={handleCalculatorType}
            options={[
              { value: "employee", text: "Μισθωτός" },
              { value: "business", text: "Ελεύθερος επαγγελματίας" },
            ]}
            menuTitle="Επίλεξε κατηγορία"
            mb={4}
          />
        </Flex>

        {isBusiness ? (
          <Flex flexWrap="wrap" alignItems="center">
            <Stepper.Content text="με" mb={4} mr={2} />

            <Stepper.MenuPopover
              onChange={(value) =>
                updateBusiness({
                  grossMonthOrYear: value,
                })
              }
              name={userDetails.business.grossMonthOrYear}
              label={
                userDetails.business.grossMonthOrYear === "year"
                  ? "Ετήσιο"
                  : "Μηνιαίο"
              }
              options={[
                { value: "month", text: "Μηνιαίο" },
                { value: "year", text: "Ετήσιο" },
              ]}
              menuTitle="Επίλεξε περίοδο"
              mb={4}
            />

            <Stepper.Content text="μικτό" mr={2} mb={4} />

            <Flex alignItems="center">
              <Stepper.Content text="εισόδημα" mr={2} mb={4} />
              <Stepper.Content
                text="€"
                fontWeight="600"
                color="gray.700"
                mr={2}
                mb={4}
              />

              <Stepper.NumberInput
                onChange={(value) => onChangeGrossIncome(value)}
                value={
                  grossMonthOrYear === "month"
                    ? grossIncomeMonthly || ""
                    : grossIncomeYearly || ""
                }
              />
            </Flex>
          </Flex>
        ) : (
          <Flex flexWrap="wrap" alignItems="center">
            <Stepper.Content text="με" mb={4} />

            <Stepper.MenuPopover
              onChange={(value) =>
                updateEmployee({
                  [activeInput === "gross"
                    ? "grossMonthOrYear"
                    : "finalMonthOrYear"]: value,
                })
              }
              name={
                activeInput === "gross"
                  ? userDetails.employee.grossMonthOrYear
                  : userDetails.employee.finalMonthOrYear
              }
              label={
                userDetails.employee[
                  activeInput === "gross"
                    ? "grossMonthOrYear"
                    : "finalMonthOrYear"
                ] === "year"
                  ? "Ετήσιο"
                  : "Μηνιαίο"
              }
              options={[
                { value: "month", text: "Μηνιαίο" },
                { value: "year", text: "Ετήσιο" },
              ]}
              menuTitle="Επίλεξε περίοδο"
              mb={4}
            />

            <Stepper.MenuPopover
              onChange={(value) =>
                updateEmployee({
                  activeInput: value,
                })
              }
              name={activeInput}
              label={activeInput === "gross" ? "μικτό" : "καθαρό"}
              options={[
                { value: "gross", text: "μικτό" },
                { value: "final", text: "καθαρό" },
              ]}
              menuTitle="Επίλεξε εισόδημα"
              mb={4}
            />

            <Flex>
              <Stepper.Content text="εισόδημα" mr={2} mb={4} />
              <Stepper.Content
                text="€"
                fontWeight="600"
                color="gray.700"
                mr={2}
                mb={4}
              />

              <Stepper.NumberInput
                onChange={(value) => onChangeGrossIncomeEmployee(value)}
                value={accountInputValue}
              />
            </Flex>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
