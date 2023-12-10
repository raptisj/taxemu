import { useStore } from "store";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Stepper from "components/stepper";
import { Box, Text, Flex } from "@chakra-ui/react";

export const MobileIntroCore = () => {
  const calculatorType = useStore((state) => state.userDetails.calculatorType);
  const update = useStore((state) => state.update);
  const updateBusiness = useStore((state) => state.updateBusiness);
  const userDetails = useStore((state) => state.userDetails);
  const employeeDetails = useStore((state) => state.userDetails.employee);
  const updateEmployee = useStore((state) => state.updateEmployee);
  const router = useRouter();

  const isBusiness = calculatorType === "business";
  const name = isBusiness ? "Ελεύθερος επαγγελματίας" : "Μισθωτός";

  const { grossIncome, grossMonthOrYear } = userDetails.business;
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

  const onChangeGrossIncome = (value, count = 12) => {
    const grossIncome = {
      month: isGrossMonthly
        ? Math.round(Number(value))
        : Math.round(Number(value) / count),
      year: isGrossMonthly
        ? Math.round(Number(value) * count)
        : Math.round(Number(value)),
    };

    updateBusiness({ grossIncome });
  };

  useEffect(() => {
    router.push({ query: { ...router.query, tab: "intro" } });
  }, []);

  return (
    <Box mt="100px">
      <Text color="gray.400">Πρώτα απ’όλα...</Text>
      <Flex mt={8} flexDirection="column">
        <Flex flexWrap="wrap" alignItems="center">
          <Stepper.Content text="Είμαι" mr={2} mb={4} />

          <Stepper.MenuDrawer
            onChange={handleCalculatorType}
            name={calculatorType}
            label={name}
            options={[
              { value: "employee", text: "Μισθωτός" },
              { value: "business", text: "Ελεύθερος επαγγελματίας" },
            ]}
            mr={2}
            mb={4}
          />
        </Flex>

        {isBusiness ? (
          <Flex flexDirection="column">
            <Flex alignItems="center">
              <Stepper.Content text="με" mr={2} mb={4} />

              <Stepper.MenuDrawer
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
                mr={2}
                mb={4}
              />

              <Stepper.Content text="μικτό εισόδημα" mr={2} mb={4} />
            </Flex>

            <Flex alignItems="center">
              <Stepper.Content
                text="€"
                mr={2}
                mb={4}
                fontWeight="600"
                color="gray.700"
              />

              <Stepper.NumberInput
                onChange={(value) => onChangeGrossIncome(value)}
                value={
                  grossMonthOrYear === "month"
                    ? grossIncome.month || ""
                    : grossIncome.year || ""
                }
              />
            </Flex>
          </Flex>
        ) : (
          <Flex flexDirection="column">
            <Flex alignItems="center">
              <Stepper.Content text="με" mr={2} />

              <Stepper.MenuDrawer
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
                mr={2}
                mb={4}
              />

              <Stepper.MenuDrawer
                onChange={(value) =>
                  updateEmployee({
                    activeInput: value,
                    [value === "final"
                      ? "finalMonthOrYear"
                      : "grossMonthOrYear"]:
                      value === "final"
                        ? userDetails.employee.grossMonthOrYear
                        : userDetails.employee.finalMonthOrYear,
                  })
                }
                name={activeInput}
                label={activeInput === "gross" ? "μικτό" : "καθαρό"}
                options={[
                  { value: "gross", text: "μικτό" },
                  { value: "final", text: "καθαρό" },
                ]}
                mr={2}
                mb={4}
              />
            </Flex>

            <Flex alignItems="center">
              <Stepper.Content text="εισόδημα" mr={2} mb={4} />

              <Stepper.Content
                text="€"
                mr={2}
                mb={4}
                fontWeight="600"
                color="gray.700"
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
