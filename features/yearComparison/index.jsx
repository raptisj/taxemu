import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useStore } from "store";
import { supportedTaxYears } from "../../rules";
import {
  calculateYearComparison,
  parseComparisonInput,
  parseComparisonYears,
  serializeComparisonInput,
} from "../../utils/yearComparison";

const metricLabels = {
  insurance: "Ασφαλιστικές εισφορές",
  taxableIncome: "Φορολογητέο εισόδημα",
  tax: "Φόρος εισοδήματος",
  adjustment: {
    employee: "Έκπτωση φόρου",
    business: "Προκαταβολή φόρου",
  },
  netIncome: "Καθαρό εισόδημα",
};

const money = new Intl.NumberFormat("el-GR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const formatMoney = (value, showSign = false) => {
  const prefix = showSign && value > 0 ? "+" : "";
  return `${prefix}${money.format(value)}`;
};

const ComparisonCard = ({ entity, result }) => (
  <Box borderWidth="1px" borderRadius="xl" bg="white" p={{ base: 4, md: 5 }}>
    <Badge colorScheme="purple" mb={3}>{result.year}</Badge>
    <Stack spacing={0}>
      {Object.entries(result.metrics).map(([key, value]) => (
        <Flex
          key={key}
          py={3}
          borderTopWidth="1px"
          borderColor="gray.100"
          justify="space-between"
          gap={4}
        >
          <Text fontSize="sm" fontWeight={key === "netIncome" ? "700" : "500"}>
            {key === "adjustment" ? metricLabels.adjustment[entity] : metricLabels[key]}
          </Text>
          <Box textAlign="right" flexShrink={0}>
            <Text fontSize="sm" fontWeight="600">{formatMoney(value.year)} / έτος</Text>
            <Text fontSize="xs" color="gray.500">{formatMoney(value.month)} / μήνα</Text>
          </Box>
        </Flex>
      ))}
    </Stack>
  </Box>
);

const DifferenceCard = ({ entity, differences, years }) => (
  <Box borderWidth="1px" borderColor="purple.200" borderRadius="xl" bg="purple.50" p={{ base: 4, md: 5 }}>
    <Heading as="h3" fontSize="md" mb={1}>Διαφορά {years[1]} από {years[0]}</Heading>
    <Text color="gray.600" fontSize="xs" mb={3}>Ετήσια, μηνιαία και ποσοστιαία μεταβολή</Text>
    <Stack spacing={0}>
      {Object.entries(differences).map(([key, difference]) => {
        const color = difference.annual > 0 ? "green.700" : difference.annual < 0 ? "red.700" : "gray.600";
        return (
          <Flex
            key={key}
            py={3}
            borderTopWidth="1px"
            borderColor="purple.100"
            justify="space-between"
            align="center"
            gap={3}
          >
            <Text fontSize="sm" fontWeight={key === "netIncome" ? "700" : "500"}>
              {key === "adjustment" ? metricLabels.adjustment[entity] : metricLabels[key]}
            </Text>
            <Flex gap={2} flexWrap="wrap" justify="flex-end">
              <Badge colorScheme="purple">{formatMoney(difference.annual, true)} / έτος</Badge>
              <Badge colorScheme="purple">{formatMoney(difference.monthly, true)} / μήνα</Badge>
              <Badge colorScheme={difference.annual > 0 ? "green" : difference.annual < 0 ? "red" : "gray"} color={color}>
                {difference.percentage === null
                  ? "—"
                  : `${difference.percentage > 0 ? "+" : ""}${difference.percentage.toFixed(1)}%`}
              </Badge>
            </Flex>
          </Flex>
        );
      })}
    </Stack>
  </Box>
);

export const YearComparison = ({ entity }) => {
  const router = useRouter();
  const details = useStore((state) => state.userDetails[entity]);
  const compareParam = Array.isArray(router.query.compare)
    ? router.query.compare[0]
    : router.query.compare;
  const isOpen = Boolean(compareParam);
  const years = parseComparisonYears(compareParam, details.taxationYear);
  const inputParam = Array.isArray(router.query.compareInput)
    ? router.query.compareInput[0]
    : router.query.compareInput;
  const sharedInput = parseComparisonInput(entity, inputParam);
  const hasLocalInput = entity === "employee"
    ? details.activeInput === "gross"
      ? details.grossIncomeMonthly > 0
      : details.finalIncomeMonthly > 0
    : details.grossIncome.year > 0;
  const calculationDetails = !hasLocalInput && sharedInput
    ? {
        ...details,
        ...sharedInput,
        discountOptions: {
          ...details.discountOptions,
          ...sharedInput.discountOptions,
        },
      }
    : details;
  const hasInput = entity === "employee"
    ? calculationDetails.activeInput === "gross"
      ? calculationDetails.grossIncomeMonthly > 0
      : calculationDetails.finalIncomeMonthly > 0
    : calculationDetails.grossIncome.year > 0;
  const serializedInput = hasInput
    ? serializeComparisonInput(entity, calculationDetails)
    : null;

  const comparison = useMemo(
    () => isOpen && hasInput
      ? calculateYearComparison(entity, calculationDetails, years)
      : null,
    // The store returns a new details object whenever a relevant form field changes.
    [calculationDetails, entity, hasInput, isOpen, years[0], years[1]],
  );

  useEffect(() => {
    if (!router.isReady || !isOpen || !hasLocalInput || !serializedInput) return;
    if (inputParam === serializedInput) return;
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, compareInput: serializedInput },
      },
      undefined,
      { shallow: true },
    );
  }, [hasLocalInput, inputParam, isOpen, router.isReady, serializedInput]);

  const setComparison = (nextYears) => {
    const query = { ...router.query };
    if (nextYears) {
      query.compare = nextYears.join(",");
      if (serializedInput) query.compareInput = serializedInput;
    } else {
      delete query.compare;
      delete query.compareInput;
    }
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const changeYear = (index, value) => {
    const next = [...years];
    const selected = Number(value);
    if (selected === next[1 - index]) next[1 - index] = next[index];
    next[index] = selected;
    setComparison(next);
  };

  return (
    <Box mt={6} mb={4}>
      <Flex justify="space-between" align="center" gap={4}>
        <Box>
          <Heading as="h2" fontSize={{ base: "lg", md: "xl" }}>Σύγκριση ετών</Heading>
          <Text color="gray.500" fontSize="sm">Τα ίδια στοιχεία υπολογίζονται με τους κανόνες κάθε έτους.</Text>
        </Box>
        <Button
          size="sm"
          variant={isOpen ? "ghost" : "outline"}
          colorScheme="purple"
          onClick={() => setComparison(isOpen ? null : years)}
          aria-expanded={isOpen}
        >
          {isOpen ? "Κλείσιμο" : "Σύγκριση"}
        </Button>
      </Flex>

      {isOpen && (
        <Box mt={4}>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={4}>
            {years.map((year, index) => (
              <Box key={index}>
                <Text as="label" htmlFor={`compare-${entity}-${index}`} fontSize="sm" fontWeight="600">
                  {index === 0 ? "Έτος βάσης" : "Έτος σύγκρισης"}
                </Text>
                <Select
                  id={`compare-${entity}-${index}`}
                  mt={1}
                  value={year}
                  onChange={(event) => changeYear(index, event.target.value)}
                >
                  {supportedTaxYears.map((option) => <option key={option} value={option}>{option}</option>)}
                </Select>
              </Box>
            ))}
          </SimpleGrid>

          {!hasInput ? (
            <Box borderRadius="lg" bg="orange.50" color="orange.800" p={4} fontSize="sm">
              Συμπλήρωσε εισόδημα και υπολόγισε για να δεις τη σύγκριση.
            </Box>
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {comparison.results.map((result) => (
                  <ComparisonCard key={result.year} entity={entity} result={result} />
                ))}
              </SimpleGrid>
              <Box mt={4}>
                <DifferenceCard entity={entity} differences={comparison.differences} years={years} />
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};
