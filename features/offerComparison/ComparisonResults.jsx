import {
  Badge,
  Box,
  Divider,
  Flex,
  Grid,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { getTaxRules } from "../../rules";
import { OFFER_COMPARISON_MODES } from "../../utils/offerComparison";

const money = new Intl.NumberFormat("el-GR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const decimal = new Intl.NumberFormat("el-GR", { maximumFractionDigits: 2 });
const formatMoney = (value) => money.format(Number(value) || 0);
const signedMoney = (value) => `${value > 0 ? "+" : ""}${formatMoney(value)}`;

const sourceLabel = {
  provided: "ΠΡΟΤΑΣΗ",
  budget: "ΙΔΙΟ BUDGET",
  "generated-net-match": "ΙΣΟΔΥΝΑΜΗ ΠΡΟΤΑΣΗ",
};

const ResultCard = ({ type, result }) => {
  const employee = type === "employee";
  return (
    <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="white" p={{ base: 4, md: 5 }} minW={0}>
      <Flex justify="space-between" align="start" gap={3}>
        <Box>
          <Badge colorScheme={employee ? "blue" : "purple"}>{sourceLabel[result.source]}</Badge>
          <Heading as="h3" fontSize="lg" mt={2}>{employee ? "Μισθωτός" : "Freelancer"}</Heading>
        </Box>
        <Box textAlign="right">
          <Text fontSize="xl" fontWeight="800">{formatMoney(result.annualNet)}</Text>
          <Text color="gray.500" fontSize="xs">καθαρά / έτος</Text>
        </Box>
      </Flex>

      <Stack spacing={0} mt={4}>
        <Metric label="Κόστος εταιρείας" value={result.companyCost} strong />
        <Metric label={employee ? "Μικτές αποδοχές" : "Έσοδα από τιμολόγια"} value={employee ? result.annualGross : result.annualRevenue} />
        {!employee && <Metric label="Επαγγελματικά έξοδα" value={result.businessExpenses} negative />}
        <Metric label={employee ? "Εισφορές εργαζομένου" : "Ασφάλιση ΕΦΚΑ"} value={employee ? result.employeeInsurance : result.insurance} negative />
        {employee && <Metric label="Εργοδοτικές εισφορές" value={result.employerInsurance} />}
        <Metric label="Φόρος εισοδήματος" value={result.incomeTax} negative />
        {!employee && result.taxPrepayment > 0 && <Metric label="Προκαταβολή φόρου (ρευστότητα)" value={result.taxPrepayment} negative muted />}
        {!employee && result.withholding > 0 && <Metric label="Παρακράτηση που έχει αποδοθεί" value={result.withholding} muted />}
      </Stack>

      <Divider my={4} />
      <Flex justify="space-between" gap={3}>
        <Box>
          <Text color="gray.500" fontSize="xs">Καθαρά / ημερολογιακό μήνα</Text>
          <Text fontWeight="700">{formatMoney(result.monthlyNet)}</Text>
        </Box>
        <Box textAlign="right">
          <Text color="gray.500" fontSize="xs">{employee ? "Καθαρά / μισθό" : "Τιμολόγιο / χρεώσιμο μήνα"}</Text>
          <Text fontWeight="700">{formatMoney(employee ? result.netPerSalary : result.invoicePerBillableMonth)}</Text>
        </Box>
      </Flex>
      {!employee && result.taxPrepayment > 0 && (
        <Box bg="orange.50" borderRadius="md" mt={4} p={3}>
          <Text color="orange.800" fontSize="xs">Μετά την προκαταβολή φόρου, η ταμειακή ροή του έτους είναι {formatMoney(result.cashAfterTaxSettlements)}. Η προκαταβολή δεν αφαιρείται ξανά από το οικονομικό καθαρό εισόδημα.</Text>
        </Box>
      )}
    </Box>
  );
};

const Metric = ({ label, value, negative = false, strong = false, muted = false }) => (
  <Flex py={2.5} borderTopWidth="1px" borderColor="gray.100" justify="space-between" gap={3} align="baseline">
    <Text color={muted ? "gray.500" : "gray.600"} fontSize="sm" fontWeight={strong ? "700" : "400"}>{label}</Text>
    <Text color={muted ? "gray.500" : "gray.800"} fontSize="sm" fontWeight={strong ? "700" : "600"} textAlign="right">{negative && value ? "−" : ""}{formatMoney(value)}</Text>
  </Flex>
);

const Headline = ({ comparison }) => {
  const { mode, employee, freelancer, difference, benchmarks } = comparison;

  if (mode === OFFER_COMPARISON_MODES.EMPLOYEE) {
    return <><Text color="purple.800" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">{formatMoney(benchmarks.requiredFreelancerInvoice)} + ΦΠΑ / χρεώσιμο μήνα</Text><Text color="gray.600" mt={2}>χρειάζεται να τιμολογεί ο freelancer για να φτάσει τα {formatMoney(employee.annualNet)} ετήσια καθαρά της πρότασης μισθωτού.</Text></>;
  }
  if (mode === OFFER_COMPARISON_MODES.FREELANCER) {
    return <><Text color="purple.800" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">{formatMoney(benchmarks.requiredEmployeeGross)} μικτά / έτος</Text><Text color="gray.600" mt={2}>χρειάζεται ως μισθωτή πρόταση για να φτάσει τα {formatMoney(freelancer.annualNet)} ετήσια καθαρά του freelancer.</Text></>;
  }

  const freelancerAhead = difference.annualNet > 0;
  const equal = Math.abs(difference.annualNet) < 1;
  return <><Text color="purple.800" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">{equal ? "Σχεδόν ίδιο καθαρό εισόδημα" : `${freelancerAhead ? "Ο freelancer" : "Ο μισθωτός"} έχει ${formatMoney(Math.abs(difference.annualNet))} περισσότερα καθαρά`}</Text><Text color="gray.600" mt={2}>{mode === OFFER_COMPARISON_MODES.BUDGET ? "Η σύγκριση γίνεται με το ίδιο ετήσιο κόστος εταιρείας." : `Η διαφορά κόστους για την εταιρεία είναι ${signedMoney(difference.companyCost)} για τον freelancer.`}</Text></>;
};

export const ComparisonResults = ({ comparison, input }) => {
  const rules = getTaxRules(input.taxationYear);
  if (!comparison) {
    return (
      <Box borderWidth="1px" borderStyle="dashed" borderColor="purple.200" borderRadius="xl" bg="purple.50" p={{ base: 5, md: 8 }} position={{ md: "sticky" }} top={8}>
        <Heading as="h2" fontSize="xl">Συμπλήρωσε το ποσό της πρότασης</Heading>
        <Text color="gray.600" mt={2}>Τα αποτελέσματα και η ισοδύναμη πρόταση θα εμφανιστούν εδώ αυτόματα.</Text>
      </Box>
    );
  }

  return (
    <Stack spacing={5}>
      <Box borderWidth="1px" borderColor="purple.200" borderRadius="xl" bg="purple.50" p={{ base: 5, md: 6 }}>
        <Badge colorScheme="purple" mb={3}>ΣΥΜΠΕΡΑΣΜΑ</Badge>
        <Headline comparison={comparison} />
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        <ResultCard type="employee" result={comparison.employee} />
        <ResultCard type="freelancer" result={comparison.freelancer} />
      </SimpleGrid>

      {comparison.mode === OFFER_COMPARISON_MODES.BOTH && (
        <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="white" p={{ base: 4, md: 5 }}>
          <Heading as="h3" fontSize="lg">Όρια ισοδυναμίας</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>Ποια ποσά θα έκαναν τις δύο πραγματικές προτάσεις οικονομικά ισοδύναμες.</Text>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mt={4}>
            <Box bg="purple.50" borderRadius="lg" p={4}>
              <Text color="gray.600" fontSize="xs">Τιμολόγιο για να ταιριάξει τη μισθωτή πρόταση</Text>
              <Text color="purple.800" fontSize="xl" fontWeight="800" mt={1}>{formatMoney(comparison.benchmarks.requiredFreelancerInvoice)} / μήνα + ΦΠΑ</Text>
            </Box>
            <Box bg="blue.50" borderRadius="lg" p={4}>
              <Text color="gray.600" fontSize="xs">Μικτά για να ταιριάξει την πρόταση freelancer</Text>
              <Text color="blue.800" fontSize="xl" fontWeight="800" mt={1}>{formatMoney(comparison.benchmarks.requiredEmployeeGross)} / έτος</Text>
            </Box>
          </SimpleGrid>
        </Box>
      )}

      <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="white" p={{ base: 4, md: 5 }}>
        <Heading as="h3" fontSize="lg">Παραδοχές που χρησιμοποιήθηκαν</Heading>
        <SimpleGrid
          columns={{ base: 1, sm: 2 }}
          columnGap={6}
          rowGap={3}
          mt={4}
        >
          <Assumption label="Φορολογικό έτος" value={input.taxationYear} />
          <Assumption label="Μισθοί μισθωτού" value={`${input.salaryMonthCount} / έτος`} />
          <Assumption label="Χρεώσιμο διάστημα" value={`${decimal.format(comparison.freelancer.effectiveBillableMonths)} μήνες`} />
          <Assumption label="Άδεια" value={input.leaveIsBillable ? `${input.unpaidLeaveDays} ημέρες, τιμολογούνται` : `${input.unpaidLeaveDays} ημέρες, δεν τιμολογούνται`} />
          <Assumption label="Επαγγελματικά έξοδα" value={`${formatMoney(input.businessExpensesAnnual)} / έτος`} />
          <Assumption label="Ασφάλιση freelancer" value={input.specialInsuranceScale ? "Ειδική κατηγορία" : `${input.insuranceScaleSelection}η κατηγορία`} />
          <Assumption label="Προκαταβολή φόρου" value={input.prePaidNextYearTax ? "Εμφανίζεται ως ταμειακή επίδραση" : "Δεν περιλαμβάνεται"} />
          <Assumption label="ΦΠΑ" value={`${input.vatRate * 100}% — εκτός καθαρών και εταιρικού κόστους`} />
        </SimpleGrid>
      </Box>

      <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="white" p={{ base: 4, md: 5 }}>
        <Heading as="h3" fontSize="lg">Πώς να διαβάσεις τη σύγκριση</Heading>
        <Stack color="gray.600" fontSize="sm" mt={3} spacing={2}>
          <Text>Το «καθαρό εισόδημα» αφαιρεί φόρο εισοδήματος, ασφάλιση και επαγγελματικά έξοδα. Η προκαταβολή φόρου παρουσιάζεται χωριστά επειδή επηρεάζει τη ρευστότητα, όχι τη μόνιμη φορολογική επιβάρυνση.</Text>
          <Text>Ο ΦΠΑ εμφανίζεται στο τιμολόγιο αλλά δεν θεωρείται αμοιβή ή κόστος όταν ανακτάται από την εταιρεία. Η παρακράτηση συμψηφίζεται με τον φόρο και δεν αφαιρείται δεύτερη φορά.</Text>
          <Text>Η οικονομική σύγκριση δεν αποτιμά ασφάλεια εργασίας, αποζημίωση, αναρρωτικές άδειες, διοικητικό χρόνο ή άλλες μη χρηματικές παροχές.</Text>
        </Stack>
        <Divider my={4} />
        <Text color="gray.500" fontSize="xs" mb={2}>Επίσημες πηγές κανόνων {input.taxationYear}</Text>
        <Flex wrap="wrap" columnGap={4} rowGap={2}>
          {rules.sources.map((source) => (
            <Link key={source.url} href={source.url} isExternal color="purple.600" fontSize="xs" textDecoration="underline">{source.name} <ExternalLinkIcon mx="2px" /></Link>
          ))}
        </Flex>
      </Box>
    </Stack>
  );
};

const Assumption = ({ label, value }) => (
  <Grid templateColumns="minmax(120px, 0.8fr) 1.2fr" gap={3} borderTopWidth="1px" borderColor="gray.100" pt={2}>
    <Text color="gray.500" fontSize="xs">{label}</Text>
    <Text fontSize="xs" fontWeight="600" textAlign="right">{value}</Text>
  </Grid>
);
