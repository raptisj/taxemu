import { useState } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import Stepper from "components/stepper";

export const BusinessSecondStep = () => {
  const [insurancePeriod, setInsurancePeriod] = useState("μηνιαίες");
  const [expensesPeriod, setExpensesPeriod] = useState("χρόνο");
  const [insuranceAmount, setInsuranceAmount] = useState("");
  const [expensesAmount, setExpensesAmount] = useState("");

  const handleInsuranePeriod = (value) => {
    setInsurancePeriod(value.toLowerCase());
  };

  const handleExpensesPeriod = (value) => {
    setExpensesPeriod(value.toLowerCase());
  };

  const handleInsuranceAmount = (value) => {
    setInsuranceAmount(value);
  };

  const handleExpensesAmount = (value) => {
    setExpensesAmount(value);
  };

  return (
    <Box mt="100px">
      <Text color="gray.400">Συνεχίζοντας...</Text>
      <Flex mt={8} flexDirection="column">
        <Flex flexWrap="wrap" alignItems="center">
          <Stepper.Content text="Οι" mr={2} />

          <Stepper.MenuPopover
            name={insurancePeriod}
            onChange={handleInsuranePeriod}
            options={["μηνιαίες", "ετήσιες"]}
            menuTitle="Επίλεξε περίοδο"
            mb={4}
          />

          <Stepper.Content text="εισφορές μου στον ΕΦΚΑ" mr={2} mb={4} />

          <Flex alignItems="center">
            <Stepper.Content text="είναι" mr={2} mb={4} />
            <Stepper.Content
              text="€"
              fontWeight="600"
              color="gray.700"
              mb={4}
              mr={2}
            />

            <Stepper.NumberInput
              onChange={handleInsuranceAmount}
              value={insuranceAmount}
            />
          </Flex>
        </Flex>

        <Flex flexWrap="wrap" alignItems="center">
          <Stepper.Content text="και έχω επιπλέον έξοδα" mr={2} mb={4} />

          <Flex alignItems="center">
            <Stepper.Content text="επιχείρησης" mr={2} mb={4} />
            <Stepper.Content
              text="€"
              fontWeight="600"
              color="gray.700"
              mr={2}
              mb={4}
            />

            <Stepper.NumberInput
              onChange={handleExpensesAmount}
              value={expensesAmount}
            />
          </Flex>

          <Flex alignItems="center">
            <Stepper.Content text="τον" mr={2} mb={4} />

            <Stepper.MenuPopover
              name={expensesPeriod}
              onChange={handleExpensesPeriod}
              options={["χρόνο", "μήνα"]}
              menuTitle="Επίλεξε περίοδο"
              mb={4}
            />
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
