import { useState } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import Stepper from "components/stepper";

export const MobileBusinessSecondStep = () => {
  const [insurancePeriod, setInsurancePeriod] = useState("μηνιαίες");
  const [expensesPeriod, setExpensesPeriod] = useState("χρόνο");
  const [insuranceAmount, setInsuranceAmount] = useState("");
  const [expensesAmount, setExpensesAmount] = useState("");

  const handleInsuranePeriod = (value) => {
    setInsurancePeriod(value);
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
        <Flex alignItems="center">
          <Stepper.Content text="Οι" mr={2} mb={4} />

          <Stepper.MenuDrawer
            onChange={handleInsuranePeriod}
            name={insurancePeriod}
            options={["μηνιαίες", "ετήσιες"]}
            mr={2}
            mb={4}
          />

          <Stepper.Content text="εισφορές μου" mr={2} mb={4} />
        </Flex>

        <Flex alignItems="center">
          <Stepper.Content text="στον ΕΦΚΑ είναι" mr={2} mb={4} />

          <Stepper.Content
            text="€"
            fontWeight="600"
            color="gray.700"
            mr={2}
            mb={4}
          />

          <Stepper.NumberInput
            onChange={handleInsuranceAmount}
            value={insuranceAmount}
          />
        </Flex>

        <Flex alignItems="center">
          <Stepper.Content
            text="και έχω επιπλέον έξοδα επιχείρησης"
            mr={2}
            mb={4}
          />
        </Flex>

        <Flex alignItems="center">
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

          <Stepper.Content text="τον" mr={2} />

          <Stepper.MenuDrawer
            onChange={handleExpensesPeriod}
            name={expensesPeriod}
            options={["μήνα", "χρόνο"]}
          />
        </Flex>
      </Flex>
    </Box>
  );
};
