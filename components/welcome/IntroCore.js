import { useEffect } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useStore } from "store";
import Stepper from "components/stepper";

export const IntroCore = () => {
  const calculatorType = useStore((state) => state.userDetails.calculatorType);
  const update = useStore((state) => state.update);
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
    update({
      calculatorType: value,
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

  useEffect(() => {
    router.push({ query: { ...router.query, tab: "intro" } });
  }, []);

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
              menuTitle="Επίλεξε περίοδο"
              mb={4}
            />

            <Stepper.MenuPopover
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
