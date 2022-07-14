import { useState, useEffect } from "react";
import {
  Box,
  Text,
  Flex,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useStore } from "store";
import { Content, ContentWithDrawer } from "./contents";

export const MobileIntroCore = () => {
  const details = useStore((state) => state.welcomeDetails);
  const addWelcomeDetail = useStore((state) => state.addWelcomeDetail);
  const addDetail = useStore((state) => state.addDetail);
  const router = useRouter();
  const [period, setPeriod] = useState("Ετήσιο");
  const [amount, setAmount] = useState("");
  const [incomeType, setIncomeType] = useState("μικτό");

  const isBusiness = details.entity === "business";
  const name =
    details.entity === "business" ? "Ελεύθερος επαγγελματίας" : "Μισθωτός";

  const handleEntity = (value) => {
    addWelcomeDetail({
      value: value.toLowerCase() === "μισθωτός" ? "employee" : "business",
      field: "entity",
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
          <Content text="Είμαι" />

          <ContentWithDrawer
            onChange={handleEntity}
            name={name}
            options={["Μισθωτός", "Ελεύθερος επαγγελματίας"]}
          />
        </Flex>
        <br />

        {isBusiness ? (
          <Flex flexDirection="column">
            <Flex alignItems="center">
              <Content text="με" />

              <ContentWithDrawer
                onChange={handlePeriod}
                name={period}
                options={["Μηνιαίο", "Ετήσιο"]}
              />

              <Content text="μικτό εισόδημα" ml={2} />
            </Flex>
            <br />

            <Flex alignItems="center">
              <Content text="€" ml={2} fontWeight="600" color="gray.700" />

              <NumberInput
                borderBottomColor="gray.400"
                ml={2}
                onChange={handleAmount}
                value={amount || ""}
              >
                <NumberInputField
                  borderRadius={0}
                  fontSize="md"
                  maxW="200px"
                  padding={0}
                  border="none"
                  borderBottom="1px"
                  borderColor="#1a202c"
                  fontWeight="600"
                  _focus={{
                    outline: 0,
                  }}
                />
              </NumberInput>
            </Flex>
          </Flex>
        ) : (
          <Flex flexDirection="column">
            <Flex alignItems="center">
              <Content text="με" />

              <ContentWithDrawer
                onChange={handlePeriod}
                name={period}
                options={["Μηνιαίο", "Ετήσιο"]}
              />

              <ContentWithDrawer
                onChange={handleIncomeType}
                name={incomeType}
                options={["μικτό", "καθαρό"]}
              />
            </Flex>
            <br />

            <Flex alignItems="center">
              <Content text="εισόδημα" ml={2} />

              <Content text="€" ml={2} fontWeight="600" color="gray.700" />

              <NumberInput
                borderBottomColor="gray.400"
                ml={2}
                onChange={handleAmount}
                value={amount || ""}
              >
                <NumberInputField
                  borderRadius={0}
                  fontSize="md"
                  fontWeight="600"
                  maxW="200px"
                  padding={0}
                  border="none"
                  borderBottom="1px"
                  borderColor="#1a202c"
                  _focus={{
                    outline: 0,
                  }}
                />
              </NumberInput>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
