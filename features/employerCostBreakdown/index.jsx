import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { useStore } from "store";
import { calculateEmployerCostBreakdown, formatEuroCurrency } from "utils";

const componentColors = {
  netIncome: "purple.500",
  incomeTax: "orange.400",
  employeeContributions: "blue.400",
  employerContributions: "green.400",
};

const formatPerHundred = (value) =>
  `${new Intl.NumberFormat("el-GR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}€`;

export const EmployerCostBreakdown = () => {
  const tableResults = useStore(
    (state) => state.userDetails.employee.tableResults,
  );
  const { employerObligations, finalTax, insurance, totalEmployerCost } =
    tableResults;

  if (!totalEmployerCost?.year) return null;

  const breakdown = calculateEmployerCostBreakdown({
    finalIncome: tableResults.finalIncome.year,
    incomeTax: finalTax.year,
    employeeContributions: insurance.year,
    employerContributions: employerObligations.year,
    totalEmployerCost: totalEmployerCost.year,
  });
  const netIncome = breakdown.find(({ key }) => key === "netIncome");
  const accessibleBreakdown = breakdown
    .map(({ label, perHundred }) => `${label}: ${formatPerHundred(perHundred)}`)
    .join(", ");

  return (
    <Box borderWidth="1px" borderRadius="xl" bg="white" p={{ base: 4, md: 5 }}>
      <Badge colorScheme="purple" mb={2}>ΔΙΑΣΠΑΣΗ ΚΟΣΤΟΥΣ</Badge>
      <Heading as="h3" fontSize={{ base: "lg", md: "xl" }} color="gray.700">
        Πού πηγαίνουν τα €100
      </Heading>
      <Text color="gray.600" fontSize="sm" mt={2}>
        Από κάθε €100 συνολικού εργοδοτικού κόστους, περίπου{" "}
        <Text as="strong" color="purple.700">
          {formatPerHundred(netIncome.perHundred)}
        </Text>{" "}
        καταλήγουν στον καθαρό μισθό σου.
      </Text>

      <Flex
        mt={4}
        height="32px"
        overflow="hidden"
        borderRadius="md"
        role="img"
        aria-label={accessibleBreakdown}
      >
        {breakdown.map(({ key, perHundred }) => (
          <Box
            key={key}
            bg={componentColors[key]}
            width={`${perHundred}%`}
            minWidth={perHundred > 0 ? "2px" : 0}
          />
        ))}
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2 }} spacingX={5} spacingY={2} mt={4}>
        {breakdown.map(({ key, label, perHundred }) => (
          <Flex key={key} align="center" justify="space-between" gap={3} fontSize="sm">
            <Flex align="center" gap={2} minWidth={0}>
              <Box boxSize="9px" borderRadius="sm" bg={componentColors[key]} flexShrink={0} />
              <Text color="gray.600">{label}</Text>
            </Flex>
            <Text fontWeight="700">{formatPerHundred(perHundred)}</Text>
          </Flex>
        ))}
      </SimpleGrid>

      <Accordion allowToggle mt={3}>
        <AccordionItem border="none">
          <AccordionButton px={0} color="purple.600">
            <Box as="span" flex="1" textAlign="left" fontSize="sm" fontWeight="600">
              Πώς υπολογίζεται;
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel px={0} pb={1} color="gray.600" fontSize="sm">
            <Text>
              Ως βάση χρησιμοποιείται το συνολικό εργοδοτικό κόστος των{" "}
              {formatEuroCurrency(totalEmployerCost.year)} τον χρόνο και κάθε ποσό
              μετατρέπεται σε αναλογία ανά €100.
            </Text>
            <Text mt={2}>
              Η ανάλυση αφορά το κόστος εργασίας σου. Δεν δείχνει πώς κατανέμονται
              οι δημόσιες δαπάνες.
            </Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
