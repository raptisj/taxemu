import { useState } from "react";
import {
  Box,
  Text,
  Flex,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { Content, ContentWithDrawer } from "./contents";

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
          <Content text="Οι" />

          <ContentWithDrawer
            onChange={handleInsuranePeriod}
            name={insurancePeriod}
            options={["μηνιαίες", "ετήσιες"]}
          />

          <Content text="εισφορές μου" ml={2} />
        </Flex>
        <br />

        <Flex alignItems="center">
          <Content text="στον ΕΦΚΑ είναι" ml={2} />

          <Content text="€" fontWeight="600" color="gray.700" ml={2} />

          <NumberInput
            borderBottomColor="gray.400"
            ml={2}
            onChange={handleInsuranceAmount}
            value={insuranceAmount || ""}
          >
            <NumberInputField
              borderRadius={0}
              fontSize="16px"
              fontWeight="600"
              maxW="200px"
              padding={0}
            />
          </NumberInput>
        </Flex>
        <br />

        <Flex alignItems="center">
          <Content text="και έχω επιπλέον έξοδα επιχείρησης" ml={2} />
        </Flex>
        <br />

        <Flex alignItems="center">
          <Content text="€" fontWeight="600" color="gray.700" ml={2} />

          <NumberInput
            borderBottomColor="gray.400"
            ml={2}
            onChange={handleExpensesAmount}
            value={expensesAmount || ""}
          >
            <NumberInputField
              borderRadius={0}
              fontSize="16px"
              fontWeight="600"
              maxW="200px"
              padding={0}
            />
          </NumberInput>

          <Content text="τον" ml={2} />

          <ContentWithDrawer
            onChange={handleExpensesPeriod}
            name={expensesPeriod}
            options={["μήνα", "χρόνο"]}
          />
        </Flex>
        <br />
      </Flex>
    </Box>
  );
};
