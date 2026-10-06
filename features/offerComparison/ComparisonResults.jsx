import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Flex,
  Grid,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import EmployeeContributionBreakdown from "../../components/employee/EmployeeContributionBreakdown";
import { isEngineer, supportsEngineer, engineerUnsupportedMessage } from "../../utils/employeeContributions";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { inlineLinkStyles } from "../../styles/inlineLink";
import { getTaxRules } from "../../rules";
import { COMPARISON_PERSPECTIVES, OFFER_PERIODS, OFFER_TYPES, getEffectiveBillableMonths, getEngineerMinimumEmployerCost } from "../../utils/offerComparison";
import { formatRatePercentage } from "../../utils";
import { CALCULATOR_LABELS } from "../../constants/calculators";

const money = new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("el-GR", { maximumFractionDigits: 2 });
const formatMoney = (value) => money.format(value);
const sourceLabel = { provided: "ΠΡΟΤΑΣΗ", budget: "ΙΔΙΟ BUDGET", assumed: "ΙΔΙΟ ΕΤΗΣΙΟ ΠΟΣΟ · ΥΠΟΘΕΣΗ" };
const basisLabel = {
  "same-company-cost": "Ίδιο συνολικό ετήσιο κόστος εταιρείας",
  "actual-offers": "Σύγκριση των δύο πραγματικών προτάσεων",
  "same-annual-offer": "Ίδιο ετήσιο ποσό προσφοράς",
};

const Disclosure = ({ title, children }) => (
  <Accordion allowToggle borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="white" overflow="hidden">
    <AccordionItem border="none">
      <AccordionButton p={4}>
        <Text as="h3" flex="1" textAlign="left" fontWeight="700">{title}</Text>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel px={4} pb={4}>{children}</AccordionPanel>
    </AccordionItem>
  </Accordion>
);

const Metric = ({ label, value, negative = false }) => (
  <Flex py={2} borderTopWidth="1px" borderColor="gray.100" justify="space-between" gap={3} align="baseline">
    <Text color="gray.600" fontSize="sm">{label}</Text>
    <Text fontSize="sm" fontWeight="600" textAlign="right">{negative && value ? "−" : ""}{formatMoney(value)}</Text>
  </Flex>
);

const ResultCard = ({ type, result, company, input }) => {
  const employee = type === OFFER_TYPES.EMPLOYEE;
  return (
    <Box borderWidth="1px" borderColor={employee ? "blue.200" : "purple.200"} borderRadius="xl" bg="white" p={{ base: 4, md: 5 }} minW={0}>
      <Badge colorScheme={employee ? "blue" : "purple"}>{sourceLabel[result.source]}</Badge>
      <Heading as="h3" fontSize="lg" mt={2}>{employee ? CALCULATOR_LABELS.employee : CALCULATOR_LABELS.business}</Heading>
      <Text color={employee ? "blue.800" : "purple.800"} fontSize="3xl" fontWeight="800" mt={3}>{formatMoney(result.monthlyNet)}</Text>
      <Text color="gray.600" fontSize="sm">καθαρά / ημερολογιακό μήνα</Text>
      <Text fontWeight="600" mt={1}>{formatMoney(result.annualNet)} καθαρά / έτος</Text>
      <Text color="gray.500" fontSize="xs" mt={2}>Μέσος όρος: ετήσια καθαρά ÷ 12.</Text>
      <Box mt={4} bg={company ? "purple.50" : "gray.50"} borderRadius="md" p={3}>
        <Text color="gray.600" fontSize="xs">Συνολικό κόστος εταιρείας / έτος</Text>
        <Text fontWeight={company ? "800" : "600"} fontSize={company ? "lg" : "sm"}>{formatMoney(result.companyCost)}</Text>
      </Box>
      {employee ? (
        <Text color="gray.600" fontSize="xs" mt={3}>{formatMoney(result.netPerSalary)} {result.monthlyAmountsAreAverages ? "μέσα καθαρά ανά μισθό" : "καθαρά ανά μισθό"} · {result.salaryMonthCount} μισθοί / έτος</Text>
      ) : (
        <>
          <Text color="gray.600" fontSize="xs" mt={3}>{formatMoney(result.invoicePerBillableMonth)} τιμολόγιο / χρεώσιμο μήνα, χωρίς ΦΠΑ · {decimal.format(result.effectiveBillableMonths)} μήνες</Text>
          <Box bg="orange.50" borderRadius="md" mt={3} p={3}>
            <Text color="orange.800" fontSize="xs" fontWeight="700">Διαθέσιμα μετά τους φορολογικούς συμψηφισμούς</Text>
            <Text color="orange.900" fontWeight="700" mt={1}>{formatMoney(result.cashAfterTaxSettlements)} / έτος</Text>
            <Text color="orange.800" fontSize="xs" mt={1}>
              {formatMoney(result.annualNet)} καθαρό εισόδημα − {formatMoney(result.taxPrepayment)} νέα προκαταβολή + {formatMoney(result.previousYearTaxInAdvance)} περσινή προκαταβολή.
            </Text>
            {input.businessAge > 1 && input.prePaidNextYearTax && result.previousYearTaxInAdvance === 0 && (
              <Text color="orange.900" fontSize="xs" mt={2}>
                Υποθέτουμε μηδενική περσινή πίστωση. Αν έχεις ήδη επιχείρηση, <Link href="#comparison-prior-advance" textDecoration="underline" fontWeight="700">συμπλήρωσε την πραγματική προκαταβολή</Link>.
              </Text>
            )}
            <Text color="orange.800" fontSize="xs" mt={2}>Η προκαταβολή επηρεάζει τη ρευστότητα, όχι το καθαρό εισόδημα.</Text>
          </Box>
        </>
      )}
      {employee && <EmployeeContributionBreakdown breakdown={result.contributionBreakdown} taxationYear={input.taxationYear} />}
      <Box mt={4}>
        <Disclosure title="Ανάλυση ποσών ανά έτος">
          <Metric label={employee ? "Μικτές αποδοχές" : "Έσοδα από τιμολόγια χωρίς ΦΠΑ"} value={employee ? result.annualGross : result.annualRevenue} />
          {!employee && <Metric label="Επαγγελματικά έξοδα" value={result.businessExpenses} negative />}
          <Metric label={employee ? "Εισφορές εργαζομένου" : "Ασφάλιση ΕΦΚΑ"} value={employee ? result.employeeInsurance : result.insurance} negative />
          <Metric label="Φόρος εισοδήματος" value={result.incomeTax} negative />
          <Metric label="Καθαρό εισόδημα" value={result.annualNet} />
          {employee ? <Metric label="Εργοδοτικές εισφορές (επιπλέον των μικτών)" value={result.employerInsurance} /> : (
            <>
              <Metric label="Προκαταβολή φόρου (ρευστότητα)" value={result.taxPrepayment} negative />
              <Metric label="Περσινή προκαταβολή που συμψηφίζεται" value={result.previousYearTaxInAdvance} />
              <Metric label="Παρακράτηση που συμψηφίζεται με τον φόρο" value={result.withholding} />
              <Metric label="Ενδεικτικός ΦΠΑ τιμολογίων (εκτός καθαρών)" value={result.vat} />
              <Text color="gray.500" fontSize="xs" mt={2}>Ο ΦΠΑ είναι ο επιλεγμένος συντελεστής επί των τιμολογίων, όχι εκτίμηση οφειλής μετά τον ΦΠΑ εξόδων ή ειδικούς κανόνες.</Text>
            </>
          )}
        </Disclosure>
      </Box>
    </Box>
  );
};

const Assumptions = ({ input }) => {
  const monthlyInvoiceOffer = input.perspective === COMPARISON_PERSPECTIVES.PERSONAL &&
    (input.hasSecondOffer || input.offerType === OFFER_TYPES.FREELANCER) &&
    input.freelancerOfferPeriod === OFFER_PERIODS.MONTH;
  return (
    <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="gray.50" p={4}>
      <Heading as="h3" fontSize="sm">Παραδοχές του σεναρίου</Heading>
      <Text fontSize="xs" color="gray.600" mt={2}>
        {input.taxationYear} · {input.salaryMonthCount} μισθοί · {decimal.format(getEffectiveBillableMonths(input))} χρεώσιμοι μήνες · {input.unpaidLeaveDays} ημέρες {input.leaveIsBillable ? "τιμολογούμενης" : "μη τιμολογούμενης"} άδειας · {formatMoney(input.businessExpensesAnnual)} έξοδα / έτος
      </Text>
      <Text fontSize="xs" color="gray.600" mt={2}>
        {monthlyInvoiceOffer
          ? input.leaveIsBillable
            ? "Το μηνιαίο τιμολόγιο πολλαπλασιάζεται με τους χρεώσιμους μήνες. Η άδεια τιμολογείται κανονικά."
            : "Το μηνιαίο τιμολόγιο πολλαπλασιάζεται με τους χρεώσιμους μήνες. Η μη τιμολογούμενη άδεια μειώνει τα ετήσια έσοδα."
          : "Το ετήσιο ποσό της ατομικής θεωρείται ήδη μετά την άδεια. Οι χρεώσιμοι μήνες αλλάζουν μόνο το ποσό ανά τιμολόγιο, όχι τα ετήσια έσοδα."}
      </Text>
      <Text fontSize="xs" color="gray.600" mt={2}>
        {input.businessAge}ο έτος δραστηριότητας · {input.specialInsuranceScale ? "ειδική ασφαλιστική κατηγορία" : `${input.insuranceScaleSelection}η ασφαλιστική κατηγορία`} · Υποθέτουμε ότι η εταιρεία ανακτά τον ΦΠΑ· ο ΦΠΑ δεν περιλαμβάνεται στα καθαρά.
      </Text>
    </Box>
  );
};

const Insights = ({ comparison, input }) => {
  const { employee, freelancer, benchmarks } = comparison;
  const employeeKnown = input.offerType === OFFER_TYPES.EMPLOYEE;
  const company = input.perspective === COMPARISON_PERSPECTIVES.COMPANY;
  const assumed = comparison.basis === "same-annual-offer";
  const alternative = employeeKnown ? benchmarks.freelancerAtEmployeeCost : benchmarks.employeeAtFreelancerCost;
  const known = employeeKnown ? employee : freelancer;
  const monthlyChange = alternative ? (alternative.annualNet - known.annualNet) / 12 : null;
  if (assumed && !alternative) return null;
  return (
    <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="white" p={{ base: 4, md: 5 }}>
      <Heading as="h3" fontSize="lg">{assumed ? "Τι αποδίδει το ίδιο εταιρικό budget;" : "Ποια προσφορά εξισώνει τα καθαρά;"}</Heading>
      <Text color="gray.500" fontSize="sm" mt={1}>{assumed ? "Εναλλακτικό σενάριο διαπραγμάτευσης με το κόστος της γνωστής πρότασης." : "Όριο ισοδυναμίας μετά φόρους, ασφάλιση και έξοδα, πριν τις προκαταβολές φόρου."}</Text>
      <Stack spacing={3} mt={4}>
        {!assumed && (company || input.hasSecondOffer || employeeKnown) && benchmarks.requiredFreelancerRevenue !== null && (
          <Box bg="purple.50" borderRadius="lg" p={4}>
            <Text fontSize="sm">Για να φτάσεις τα {formatMoney(employee.annualNet)} καθαρά της μισθωτής πρότασης:</Text>
            <Text color="purple.800" fontWeight="800" mt={2}>{formatMoney(benchmarks.requiredFreelancerRevenue)} ετήσια έσοδα ατομικής επιχείρησης</Text>
            <Text color="gray.600" fontSize="xs" mt={1}>{formatMoney(benchmarks.requiredFreelancerInvoice)} / χρεώσιμο μήνα, χωρίς ΦΠΑ</Text>
          </Box>
        )}
        {!assumed && (company || input.hasSecondOffer || !employeeKnown) && benchmarks.requiredEmployeeGross !== null && (
          <Box bg="blue.50" borderRadius="lg" p={4}>
            <Text fontSize="sm">Για να φτάσεις τα {formatMoney(freelancer.annualNet)} καθαρά από την ατομική επιχείρηση:</Text>
            <Text color="blue.800" fontWeight="800" mt={2}>{formatMoney(benchmarks.requiredEmployeeGross)} μικτές αποδοχές / έτος</Text>
          </Box>
        )}
        {!company && alternative && (
          <Box bg="gray.50" borderRadius="lg" p={4}>
            {!assumed && <Text fontWeight="700" fontSize="sm">Περιθώριο διαπραγμάτευσης με το ίδιο εταιρικό κόστος</Text>}
            <Text fontSize="sm" color="gray.600">Η γνωστή πρόταση κοστίζει στην εταιρεία {formatMoney(known.companyCost)} / έτος. Αν η εταιρεία δεχτεί να διαθέσει το ίδιο budget ως {employeeKnown ? "αμοιβή με τιμολόγιο ατομικής επιχείρησης" : "αμοιβή μισθωτής εργασίας"}, μένουν {formatMoney(alternative.monthlyNet)} καθαρά / ημερολογιακό μήνα.</Text>
            <Text fontWeight="700" mt={2}>{Math.abs(monthlyChange) < 1 ? "Σχεδόν ίδιο καθαρό εισόδημα" : `${formatMoney(Math.abs(monthlyChange))} ${monthlyChange > 0 ? "περισσότερα" : "λιγότερα"} καθαρά / μήνα`} σε σχέση με τη γνωστή πρόταση.</Text>
            <Text color="gray.500" fontSize="xs" mt={2}>Εναλλακτικό σενάριο διαπραγμάτευσης · δεν αποτελεί δεύτερη πραγματική προσφορά.</Text>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export const ComparisonResults = ({ comparison, input }) => {
  const rules = getTaxRules(input.taxationYear);
  const company = input.perspective === COMPARISON_PERSPECTIVES.COMPANY;
  if (isEngineer(input) && !supportsEngineer(input.taxationYear)) {
    return <Box role="alert" borderWidth="1px" borderRadius="xl" bg="orange.50" p={5}><Text>{engineerUnsupportedMessage(input.taxationYear)}</Text></Box>;
  }
  if (!comparison && isEngineer(input) && company && input.companyBudget > 0 &&
      input.companyBudget <= getEngineerMinimumEmployerCost(input)) {
    return <Box role="status" borderWidth="1px" borderRadius="xl" bg="orange.50" p={5}><Text>Το ετήσιο budget δεν καλύπτει τις σταθερές εργοδοτικές εισφορές μηχανικού. Αύξησε το budget για σύγκριση με θετικές αποδοχές.</Text></Box>;
  }
  if (!comparison) return (
    <Stack spacing={4}>
      <Box borderWidth="1px" borderStyle="dashed" borderColor="purple.200" borderRadius="xl" bg="purple.50" p={{ base: 5, md: 8 }}>
        <Heading as="h2" fontSize="xl">{getEffectiveBillableMonths(input) <= 0 ? "Έλεγξε τον χρόνο τιμολόγησης" : company ? "Συμπλήρωσε το εταιρικό budget" : input.hasSecondOffer ? "Συμπλήρωσε και τις δύο προτάσεις" : "Συμπλήρωσε το ποσό της πρότασης"}</Heading>
        <Text color="gray.600" mt={2}>{getEffectiveBillableMonths(input) <= 0 ? "Οι μήνες τιμολόγησης μετά την άδεια πρέπει να είναι πάνω από μηδέν. Άλλαξε τις παραδοχές ατομικής επιχείρησης." : "Θα δεις πόσα μένουν καθαρά με μισθωτή εργασία και με ατομική επιχείρηση, ανά μήνα και ανά έτος."}</Text>
      </Box>
      <Assumptions input={input} />
    </Stack>
  );

  const difference = comparison.difference.annualNet;
  const equal = Math.abs(difference) < 1;
  const assumed = comparison.basis === "same-annual-offer";
  const employeeKnown = input.offerType === OFFER_TYPES.EMPLOYEE;
  const breakEven = employeeKnown
    ? comparison.benchmarks.requiredFreelancerRevenue
    : comparison.benchmarks.requiredEmployeeGross;
  const netDifferencePercent = comparison.employee.annualNet > 0
    ? Math.abs(difference) / comparison.employee.annualNet * 100
    : null;
  const comparisonPrefix = assumed ? "Στο υποθετικό σενάριο, η " : company ? "Με ίδιο εταιρικό κόστος, η " : "Η ";
  return (
    <Stack spacing={4}>
      <Box borderWidth="1px" borderColor="purple.200" borderRadius="xl" bg="purple.50" p={{ base: 5, md: 6 }} aria-live="polite" aria-atomic="true">
        <Text color="purple.700" fontSize="sm" fontWeight="700">{basisLabel[comparison.basis]}</Text>
        {assumed && <Text color="purple.800" fontSize="sm" fontWeight="700" mt={1}>1 πραγματική πρόταση · 1 υπόθεση</Text>}
        <Heading as="h2" color="purple.800" fontSize={{ base: "xl", md: "2xl" }} mt={3}>
          {equal ? "Σχεδόν ίδιο καθαρό εισόδημα" : `${comparisonPrefix}${difference > 0 ? CALCULATOR_LABELS.business.toLowerCase() : CALCULATOR_LABELS.employee.toLowerCase()} αποδίδει ${formatMoney(Math.abs(difference) / 12)} περισσότερα καθαρά / μήνα`}
        </Heading>
        <Text color="gray.600" fontSize="sm" mt={2}>
          {equal ? "Τα ετήσια καθαρά διαφέρουν λιγότερο από 1 €." : `${formatMoney(Math.abs(difference))} περισσότερα καθαρά / έτος, μετά φόρους, ασφάλιση και έξοδα${netDifferencePercent === null ? "." : ` · ${decimal.format(netDifferencePercent)}% των καθαρών της μισθωτής εργασίας.`}`}
        </Text>
        {assumed && <Text fontSize="sm" color="gray.700" mt={3}>Η άλλη μορφή συνεργασίας υπολογίζεται με το ίδιο ετήσιο ποσό. Δεν είναι δεύτερη προσφορά.</Text>}
        {!company && (
          <SimpleGrid columns={{ base: 1, md: assumed && breakEven !== null ? 2 : 1 }} spacing={3} mt={4}>
            <Box bg="white" borderRadius="lg" p={3}>
              <Text color="gray.600" fontSize="xs" fontWeight="700">Κόστος εταιρείας / έτος</Text>
              <Text fontSize="sm" mt={1}>Μισθωτή {formatMoney(comparison.employee.companyCost)} · ατομική {formatMoney(comparison.freelancer.companyCost)}</Text>
              <Text fontSize="sm" fontWeight="700" mt={1}>Διαφορά {formatMoney(Math.abs(comparison.difference.companyCost))}</Text>
            </Box>
            {assumed && breakEven !== null && (
              <Box bg="white" borderRadius="lg" p={3}>
                <Text color="gray.600" fontSize="xs" fontWeight="700">Για ίδια καθαρά εισοδήματα</Text>
                <Text fontSize="sm" fontWeight="700" mt={1}>
                  {formatMoney(breakEven)} {employeeKnown ? "ετήσιο τιμολόγιο χωρίς ΦΠΑ" : "μικτές ετήσιες αποδοχές"}
                </Text>
                <Text color="gray.600" fontSize="xs" mt={1}>Με τις ίδιες ασφαλιστικές και φορολογικές παραδοχές.</Text>
              </Box>
            )}
          </SimpleGrid>
        )}
      </Box>
      <SimpleGrid columns={{ base: 1, "2xl": 2 }} spacing={4} alignItems="start">
        <ResultCard type={OFFER_TYPES.EMPLOYEE} result={comparison.employee} company={company} input={input} />
        <ResultCard type={OFFER_TYPES.FREELANCER} result={comparison.freelancer} company={company} input={input} />
      </SimpleGrid>
      <Assumptions input={input} />
      <Insights comparison={comparison} input={input} />
      <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="white" p={4}>
        <Heading as="h3" fontSize="sm">Πέρα από το καθαρό εισόδημα</Heading>
        <Text fontSize="sm" color="gray.600" mt={2}>Συνυπολόγισε αμειβόμενη άδεια και αναρρωτικές, παροχές, ασφάλεια εργασίας, αποζημίωση και χρόνο διαχείρισης της επιχείρησης. Το μεγαλύτερο καθαρό ποσό είναι οικονομικό αποτέλεσμα, όχι αυτόματη σύσταση συνεργασίας.</Text>
      </Box>
      <Disclosure title="Πώς υπολογίζεται η σύγκριση και πηγές">
        <Stack color="gray.600" fontSize="sm" spacing={3}>
          <Text>Το καθαρό εισόδημα αφαιρεί φόρο εισοδήματος, ασφάλιση και επαγγελματικά έξοδα. Η προκαταβολή φόρου και η πίστωση της περσινής προκαταβολής παρουσιάζονται χωριστά, επειδή επηρεάζουν τη ρευστότητα.</Text>
          <Text>Ο ΦΠΑ δεν θεωρείται αμοιβή ή κόστος όταν ανακτάται από την εταιρεία. Η παρακράτηση συμψηφίζεται με τον φόρο και δεν αφαιρείται δεύτερη φορά.</Text>
          <Text>Η μισθωτή πρόταση περιλαμβάνει {input.salaryMonthCount} μισθούς. Η μηνιαία αμοιβή με τιμολόγιο πολλαπλασιάζεται με τους χρεώσιμους μήνες μετά την άδεια. Στην ετήσια αμοιβή θεωρούμε ότι η επίδραση της άδειας έχει ήδη συνυπολογιστεί.</Text>
          <Text>Η σύγκριση αφορά μισθωτή εργασία και ατομική επιχείρηση με τις επιλεγμένες παραδοχές. Το έτος δραστηριότητας επηρεάζει το ελάχιστο τεκμαρτό φορολογητέο εισόδημα. Ειδικές εξαιρέσεις ή μειώσεις του τεκμαρτού δεν περιλαμβάνονται εδώ.</Text>
          <Text fontSize="xs">Έτος {input.taxationYear} · {input.numberOfChildren} τέκνα · {rules.ui.ageGroups?.find((group) => group.value === input.ageGroup)?.text || input.ageGroup} · ΦΠΑ {formatRatePercentage(input.vatRate)} · {input.returnBaseInland ? "με" : "χωρίς"} μεταφορά φορολογικής κατοικίας μισθωτού.</Text>
          <Flex wrap="wrap" columnGap={4} rowGap={2}>
            {rules.sources.map((source) => <Link key={source.url} href={source.url} isExternal fontSize="xs" {...inlineLinkStyles}>{source.name} <ExternalLinkIcon mx="2px" /></Link>)}
          </Flex>
        </Stack>
      </Disclosure>
    </Stack>
  );
};
