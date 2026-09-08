import {
  Badge,
  Box,
  Heading,
  Link,
  Text,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/react";
import {
  hicpInflation,
  hicpSource,
  latestActualInflationYear,
  purchasingPowerBaseYear,
} from "../../constants";
import { useStore } from "store";
import {
  calculateInflationDetails,
  formatEuroCurrency,
  getInflationRatesBetween,
} from "utils";
import { InflationWidgetContent } from "./InflationWidgetContent";

export const InflationDesktopWidget = () => {
  const userDetails = useStore((state) => state.userDetails.employee);

  const {
    finalIncome: { month: finalIncomeMonthly },
    grossIncome: { year: grossIncomeYearly },
  } = userDetails.tableResults;
  const rates = getInflationRatesBetween(
    purchasingPowerBaseYear,
    latestActualInflationYear,
    hicpInflation,
  );

  const totalResultDetails = calculateInflationDetails(
    grossIncomeYearly,
    rates.map(({ rate }) => rate),
  );

  if (!finalIncomeMonthly) {
    return null;
  }

  return (
    <Box borderWidth="1px" borderRadius="xl" bg="white" p={{ base: 4, md: 5 }}>
      <Badge colorScheme="orange" mb={2}>ΑΓΟΡΑΣΤΙΚΗ ΔΥΝΑΜΗ</Badge>
      <Heading as="h3" fontSize={{ base: "lg", md: "xl" }} color="gray.700">
        +{totalResultDetails.increasePercentage}% από το {purchasingPowerBaseYear}{" "}
        έως το {latestActualInflationYear}
      </Heading>
      <Text color="gray.600" fontSize="sm" mt={2}>
        Εισόδημα {formatEuroCurrency(grossIncomeYearly)} το {purchasingPowerBaseYear}{" "}
        αντιστοιχεί περίπου σε {formatEuroCurrency(totalResultDetails.finalAmount)} το{" "}
        {latestActualInflationYear}.
      </Text>

      <Accordion allowToggle mt={3}>
        <AccordionItem border="none">
          <AccordionButton px={0} color="purple.600">
            <Box as="span" flex="1" textAlign="left" fontSize="sm" fontWeight="600">
              Πώς υπολογίζεται;
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel px={0} pb={2}>
            <InflationWidgetContent
              grossIncomeYearly={grossIncomeYearly}
              totalResultDetails={totalResultDetails}
              fromYear={purchasingPowerBaseYear}
              toYear={latestActualInflationYear}
              rates={rates}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Link
        display="inline-block"
        mt={2}
        fontSize="xs"
        textDecoration="underline"
        color="gray.400"
        target="_blank"
        rel="noreferrer"
        href={hicpSource.url}
      >
        Πηγή: {hicpSource.name}
      </Link>
    </Box>
  );
};
