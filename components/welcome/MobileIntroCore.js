import { useState, useEffect } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useStore } from "store";
import Stepper from "components/stepper";

export const MobileIntroCore = () => {
  const calculatorType = useStore((state) => state.userDetails.calculatorType);
  const changeCalculatorType = useStore((state) => state.changeCalculatorType);
  const addDetail = useStore((state) => state.addDetail);
  const router = useRouter();
  const [period, setPeriod] = useState("Ετήσιο");
  const [amount, setAmount] = useState("");
  const [incomeType, setIncomeType] = useState("μικτό");

  const isBusiness = calculatorType === "business";
  const name = isBusiness ? "Ελεύθερος επαγγελματίας" : "Μισθωτός";

  const handleCalculatorType = (value) => {
    changeCalculatorType({
      value: value.toLowerCase() === "μισθωτός" ? "employee" : "business",
      field: "calculatorType",
    });
  };

  const handlePeriod = (value) => {
    setPeriod(value);

    addDetail({
      value:
        value.toLowerCase() === "ετήσιο"
          ? parseInt(amount)
          : parseInt(amount) * 12,
      field: "grossIncome",
    });
  };

  const handleAmount = (value) => {
    setAmount(value);

    addDetail({
      value: period === "ετήσιο" ? parseInt(value) : parseInt(value) * 12,
      field: "grossIncome",
    });
  };

  const handleIncomeType = (value) => {
    setIncomeType(value.toLowerCase());
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
            name={name}
            options={["Μισθωτός", "Ελεύθερος επαγγελματίας"]}
            mr={2}
            mb={4}
          />
        </Flex>

        {isBusiness ? (
          <Flex flexDirection="column">
            <Flex alignItems="center">
              <Stepper.Content text="με" mr={2} mb={4} />

              <Stepper.MenuDrawer
                onChange={handlePeriod}
                name={period}
                options={["Μηνιαίο", "Ετήσιο"]}
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

              <Stepper.NumberInput onChange={handleAmount} value={amount} />
            </Flex>
          </Flex>
        ) : (
          <Flex flexDirection="column">
            <Flex alignItems="center">
              <Stepper.Content text="με" mr={2} />

              <Stepper.MenuDrawer
                onChange={handlePeriod}
                name={period}
                options={["Μηνιαίο", "Ετήσιο"]}
                mr={2}
                mb={4}
              />

              <Stepper.MenuDrawer
                onChange={handleIncomeType}
                name={incomeType}
                options={["μικτό", "καθαρό"]}
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

              <Stepper.NumberInput onChange={handleAmount} value={amount} />
            </Flex>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
