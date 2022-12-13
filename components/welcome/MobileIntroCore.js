import { useEffect } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useStore } from "store";
import Stepper from "components/stepper";

export const MobileIntroCore = () => {
  const calculatorType = useStore((state) => state.userDetails.calculatorType);
  const changeCalculatorType = useStore((state) => state.changeCalculatorType);
  const addBusinessDetail = useStore((state) => state.addBusinessDetail);
  const addEmployeeDetail = useStore((state) => state.addEmployeeDetail);
  const userDetails = useStore((state) => state.userDetails);
  const router = useRouter();

  const isBusiness = calculatorType === "business";
  const name = isBusiness ? "Ελεύθερος επαγγελματίας" : "Μισθωτός";
  const { grossIncomeMonthly, grossIncomeYearly, grossMonthOrYear } =
    userDetails.business;
  const isGrossMonthly = grossMonthOrYear === "month";
  const isGrossMonthlyEmployee =
    userDetails.employee.grossMonthOrYear === "month";

  const handleCalculatorType = (value) => {
    changeCalculatorType({
      value,
      field: "calculatorType",
    });
  };

  const onChangeGrossIncomeEmployee = (value, count = 14) => {
    addEmployeeDetail({
      value: Math.round(Number(value)),
      field: isGrossMonthlyEmployee
        ? "grossIncomeMonthly"
        : "grossIncomeYearly",
    });

    // to upate the opposite.
    addEmployeeDetail({
      value: isGrossMonthlyEmployee
        ? Math.round(Number(value) * count)
        : Math.round(Number(value) / count),
      field: isGrossMonthlyEmployee
        ? "grossIncomeYearly"
        : "grossIncomeMonthly",
    });
  };

  const onChangeGrossIncome = (value, count = 12) => {
    addBusinessDetail({
      value: Math.round(Number(value)),
      field: isGrossMonthly ? "grossIncomeMonthly" : "grossIncomeYearly",
    });

    // to upate the opposite.
    addBusinessDetail({
      value: isGrossMonthly
        ? Math.round(Number(value) * count)
        : Math.round(Number(value) / count),
      field: isGrossMonthly ? "grossIncomeYearly" : "grossIncomeMonthly",
    });
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
                  addBusinessDetail({
                    value,
                    field: "grossMonthOrYear",
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
                    ? grossIncomeMonthly || ""
                    : grossIncomeYearly || ""
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
                  addEmployeeDetail({
                    value,
                    field: "grossMonthOrYear",
                  })
                }
                name={userDetails.employee.grossMonthOrYear}
                label={
                  userDetails.employee.grossMonthOrYear === "year"
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
                  addEmployeeDetail({
                    value,
                    field: "activeInput",
                  })
                }
                name={userDetails.employee.activeInput}
                label={
                  userDetails.employee.activeInput === "gross"
                    ? "μικτό"
                    : "καθαρό"
                }
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
                value={
                  userDetails.employee.grossMonthOrYear === "month"
                    ? userDetails.employee.grossIncomeMonthly || ""
                    : userDetails.employee.grossIncomeYearly || ""
                }
              />
            </Flex>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
