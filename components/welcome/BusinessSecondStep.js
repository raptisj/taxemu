import { useState } from "react";
import {
  Box,
  Text,
  Flex,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { Content, ContentWithMenu } from "./contents";

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
        <Flex flexWrap="wrap">
          <Content text="Οι" />

          <ContentWithMenu
            name={insurancePeriod}
            onChange={handleInsuranePeriod}
            options={["μηνιαίες", "ετήσιες"]}
            menuTitle="Επίλεξε περίοδο"
          />

          <Content text="εισφορές μου στον ΕΦΚΑ είναι" ml={2} />

          <Content text="€" fontWeight="600" color="gray.700" ml={2} />

          <NumberInput
            borderBottomColor="gray.400"
            ml={2}
            onChange={handleInsuranceAmount}
            value={insuranceAmount || ""}
          >
            <NumberInputField
              borderRadius={0}
              fontSize="30px"
              maxW="200px"
              padding={0}
            />
          </NumberInput>
        </Flex>
        <br />

        <Flex flexWrap="wrap">
          <Content text="και έχω επιπλέον έξοδα επιχείρησης" ml={2} />

          <NumberInput
            borderBottomColor="gray.400"
            ml={2}
            onChange={handleExpensesAmount}
            value={expensesAmount || ""}
          >
            <NumberInputField
              borderRadius={0}
              fontSize="30px"
              maxW="200px"
              padding={0}
            />
          </NumberInput>

          <Content text="τον" ml={2} />

          <ContentWithMenu
            name={expensesPeriod}
            onChange={handleExpensesPeriod}
            options={["χρόνο", "μήνα"]}
            menuTitle="Επίλεξε περίοδο"
          />
        </Flex>
      </Flex>
    </Box>
  );
};
