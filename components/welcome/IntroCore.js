import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Text,
  Flex,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useStore } from "store";
import { Content, ContentWithMenu } from "./contents";

export const IntroCore = () => {
  const details = useStore((state) => state.welcomeDetails);
  const addWelcomeDetail = useStore((state) => state.addWelcomeDetail);
  const addDetail = useStore((state) => state.addDetail);
  const router = useRouter();
  const isBusiness = details.entity === "business";
  const name =
    details.entity === "business" ? "Ελεύθερος επαγγελματίας" : "Μισθωτός";

  const onChange = (value) => {
    addWelcomeDetail({
      value: value.toLowerCase() === "μισθωτός" ? "employee" : "business",
      field: "entity",
    });
  };

  const [period, setPeriod] = useState("Ετήσιο");
  const [amount, setAmount] = useState("");
  const [incomeType, setIncomeType] = useState("Μικτό");

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
          <Content text="Είμαι" />

          <ContentWithMenu
            name={name}
            onChange={onChange}
            options={["Μισθωτός", "Ελεύθερος επαγγελματίας"]}
            menuTitle="Επίλεξε κατηγορία"
          />
          
        </Flex>
        <br />

        {isBusiness ? (
          <Flex flexWrap="wrap" alignItems="center">
            <Content text="με" />

            <ContentWithMenu
              name={period}
              onChange={handlePeriod}
              options={["Μηνιαίο", "Ετήσιο"]}
              menuTitle="Επίλεξε περίοδο"
            />

            <Content text="μικτό εισόδημα" ml={2} />

            <Content text="€" fontWeight="600" color="gray.700" ml={2} />

            <NumberInput
              borderBottomColor="gray.400"
              ml={2}
              onChange={handleAmount}
              value={amount || ""}
            >
              <NumberInputField
                borderRadius={0}
                fontWeight="600"
                fontSize="30px"
                maxW="200px"
                padding={0}
                _hover={{
                  borderColor: "transparent",
                  borderBottomColor: "gray.400",
                }}
              />
            </NumberInput>
          </Flex>
        ) : (
          <Flex flexWrap="wrap" alignItems="center">
            <Content text="με" />

            <ContentWithMenu
              name={period}
              onChange={handlePeriod}
              options={["Μηνιαίο", "Ετήσιο"]}
              menuTitle="Επίλεξε περίοδο"
            />

            <ContentWithMenu
              name={incomeType}
              onChange={handleIncomeType}
              options={["Μικτό", "Καθαρό"]}
              menuTitle="Επίλεξε εισόδημα"
            />

            <Content text="εισόδημα" ml={2} />

            <Content text="€" fontWeight="600" color="gray.700" ml={2} />

            <NumberInput
              borderBottomColor="gray.400"
              ml={2}
              onChange={handleAmount}
              value={amount || ""}
            >
              <NumberInputField
                borderRadius={0}
                fontWeight="600"
                fontSize="30px"
                maxW="200px"
                padding={0}
              />
            </NumberInput>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
