import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { getTaxRules, supportedTaxYears } from "../../rules";
import { formatRatePercentage } from "../../utils";
import {
  OFFER_COMPARISON_MODES,
  OFFER_PERIODS,
  getEffectiveBillableMonths,
} from "../../utils/offerComparison";

const modeOptions = [
  {
    value: OFFER_COMPARISON_MODES.BUDGET,
    title: "Εταιρικό budget",
    description: "Ίδιο ετήσιο κόστος και για τις δύο μορφές συνεργασίας.",
  },
  {
    value: OFFER_COMPARISON_MODES.EMPLOYEE,
    title: "Πρόταση μισθωτού",
    description: "Βρες το αντίστοιχο τιμολόγιο ελεύθερου επαγγελματία.",
  },
  {
    value: OFFER_COMPARISON_MODES.FREELANCER,
    title: "Πρόταση freelancer",
    description: "Βρες τον αντίστοιχο μικτό μισθό.",
  },
  {
    value: OFFER_COMPARISON_MODES.BOTH,
    title: "Και οι δύο προτάσεις",
    description: "Σύγκρινε δύο πραγματικές προτάσεις δίπλα-δίπλα.",
  },
];

const NumberField = ({ label, value, onChange, helper, ...rest }) => (
  <FormControl>
    <FormLabel color="gray.700" fontSize="sm" fontWeight="600" mb={2}>
      {label}
    </FormLabel>
    <NumberInput
      min={0}
      value={value || ""}
      onChange={(nextValue) => onChange(Number(nextValue))}
      {...rest}
    >
      <NumberInputField bg="white" />
    </NumberInput>
    {helper && (
      <Text color="gray.500" fontSize="xs" mt={1.5}>
        {helper}
      </Text>
    )}
  </FormControl>
);

const MoneyOfferField = ({
  label,
  amount,
  period,
  onAmountChange,
  onPeriodChange,
  helper,
}) => (
  <FormControl>
    <FormLabel color="gray.700" fontSize="sm" fontWeight="600" mb={2}>
      {label}
    </FormLabel>
    <Grid templateColumns="minmax(0, 1fr) 118px" gap={2}>
      <NumberInput min={0} value={amount || ""} onChange={(value) => onAmountChange(Number(value))}>
        <NumberInputField bg="white" placeholder="Ποσό σε €" />
      </NumberInput>
      <Select bg="white" value={period} onChange={(event) => onPeriodChange(event.target.value)}>
        <option value={OFFER_PERIODS.YEAR}>ανά έτος</option>
        <option value={OFFER_PERIODS.MONTH}>ανά μήνα</option>
      </Select>
    </Grid>
    {helper && <Text color="gray.500" fontSize="xs" mt={1.5}>{helper}</Text>}
  </FormControl>
);

const Section = ({ title, description, children }) => (
  <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="white" p={{ base: 4, md: 5 }}>
    <Heading as="h2" fontSize="lg">{title}</Heading>
    {description && <Text color="gray.500" fontSize="sm" mt={1}>{description}</Text>}
    <Box mt={5}>{children}</Box>
  </Box>
);

export const ComparisonForm = ({ input, setInput }) => {
  const rules = getTaxRules(input.taxationYear);
  const employeeVisible = [OFFER_COMPARISON_MODES.EMPLOYEE, OFFER_COMPARISON_MODES.BOTH].includes(input.mode);
  const freelancerVisible = [OFFER_COMPARISON_MODES.FREELANCER, OFFER_COMPARISON_MODES.BOTH].includes(input.mode);
  const effectiveMonths = getEffectiveBillableMonths(input);
  const setField = (field, value) => setInput((current) => ({ ...current, [field]: value }));

  const changeYear = (value) => {
    const taxationYear = Number(value);
    const nextRules = getTaxRules(taxationYear);
    setInput((current) => ({
      ...current,
      taxationYear,
      numberOfChildren: Math.min(current.numberOfChildren, nextRules.ui.employee.maximumChildren),
      insuranceScaleSelection: Math.min(
        current.insuranceScaleSelection,
        nextRules.business.insurance.monthlyAmounts.length - 1,
      ),
      vatRate: nextRules.business.invoice.vatRates.includes(current.vatRate)
        ? current.vatRate
        : nextRules.business.invoice.vatRates[0],
    }));
  };

  return (
    <Stack spacing={5}>
      <Section
        title="Από πού θέλεις να ξεκινήσεις;"
        description="Η σύγκριση είναι πάντα ανάμεσα σε μισθωτή εργασία και ατομική επιχείρηση."
      >
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
          {modeOptions.map((option) => {
            const selected = input.mode === option.value;
            return (
              <Box
                as="button"
                type="button"
                key={option.value}
                onClick={() => setField("mode", option.value)}
                borderWidth="2px"
                borderColor={selected ? "purple.500" : "gray.200"}
                bg={selected ? "purple.50" : "white"}
                borderRadius="lg"
                p={3}
                textAlign="left"
                transition="all .15s ease"
                _hover={{ borderColor: selected ? "purple.500" : "purple.200" }}
                aria-pressed={selected}
              >
                <Text fontWeight="700" color={selected ? "purple.700" : "gray.800"}>{option.title}</Text>
                <Text color="gray.500" fontSize="xs" mt={1}>{option.description}</Text>
              </Box>
            );
          })}
        </SimpleGrid>
      </Section>

      <Section title="Ποσά προσφοράς" description="Όλα τα ποσά freelancer είναι χωρίς ΦΠΑ.">
        <Stack spacing={4}>
          {input.mode === OFFER_COMPARISON_MODES.BUDGET && (
            <NumberField
              label="Συνολικό ετήσιο εταιρικό budget"
              value={input.companyBudget}
              onChange={(value) => setField("companyBudget", value)}
              helper="Για τον μισθωτό περιλαμβάνει μικτές αποδοχές και εργοδοτικές εισφορές."
            />
          )}

          {employeeVisible && (
            <MoneyOfferField
              label="Μικτή πρόταση μισθωτού"
              amount={input.employeeOfferAmount}
              period={input.employeeOfferPeriod}
              onAmountChange={(value) => setField("employeeOfferAmount", value)}
              onPeriodChange={(value) => setField("employeeOfferPeriod", value)}
              helper={input.employeeOfferPeriod === OFFER_PERIODS.MONTH ? `Υπολογίζεται σε ${input.salaryMonthCount} μισθούς.` : null}
            />
          )}

          {freelancerVisible && (
            <MoneyOfferField
              label="Πρόταση τιμολογίου freelancer"
              amount={input.freelancerOfferAmount}
              period={input.freelancerOfferPeriod}
              onAmountChange={(value) => setField("freelancerOfferAmount", value)}
              onPeriodChange={(value) => setField("freelancerOfferPeriod", value)}
              helper={input.freelancerOfferPeriod === OFFER_PERIODS.MONTH ? `Εφαρμόζεται σε ${new Intl.NumberFormat("el-GR", { maximumFractionDigits: 2 }).format(effectiveMonths)} πραγματικά χρεώσιμους μήνες.` : "Το ετήσιο ποσό θεωρείται ήδη μετά την επίδραση της άδειας."}
            />
          )}
        </Stack>
      </Section>

      <Section
        title="Χρόνος και επαγγελματικά έξοδα"
        description="Οι ημέρες άδειας αφαιρούνται μόνο όταν δεν τιμολογούνται."
      >
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
          <NumberField label="Μήνες τιμολόγησης" value={input.billableMonths} onChange={(value) => setField("billableMonths", Math.min(12, value))} max={12} precision={2} />
          <NumberField label="Ημέρες άδειας" value={input.unpaidLeaveDays} onChange={(value) => setField("unpaidLeaveDays", Math.min(260, value))} max={260} />
          <NumberField label="Ετήσια επαγγελματικά έξοδα" value={input.businessExpensesAnnual} onChange={(value) => setField("businessExpensesAnnual", value)} />
          <NumberField label="Έτος άσκησης δραστηριότητας" value={input.businessAge} onChange={(value) => setField("businessAge", Math.max(1, Math.trunc(value)))} min={1} max={60} />
          <Box bg="gray.50" borderRadius="md" p={3} alignSelf="end">
            <Text color="gray.500" fontSize="xs">Πραγματικά χρεώσιμο διάστημα</Text>
            <Text fontWeight="700">{new Intl.NumberFormat("el-GR", { maximumFractionDigits: 2 }).format(effectiveMonths)} μήνες</Text>
          </Box>
        </SimpleGrid>
        <Checkbox mt={4} colorScheme="purple" isChecked={input.leaveIsBillable} onChange={(event) => setField("leaveIsBillable", event.target.checked)}>
          <Text fontSize="sm">Η άδεια τιμολογείται κανονικά</Text>
        </Checkbox>
      </Section>

      <Accordion allowToggle borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="white" overflow="hidden">
        <AccordionItem border="none">
          <AccordionButton p={{ base: 4, md: 5 }}>
            <Box flex="1" textAlign="left">
              <Heading as="h2" fontSize="lg">Φορολογικές παραδοχές</Heading>
              <Text color="gray.500" fontSize="sm" mt={1}>Κοινά στοιχεία και ειδικές επιλογές κάθε καθεστώτος.</Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel px={{ base: 4, md: 5 }} pb={5}>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">Φορολογικό έτος</FormLabel>
                <Select value={input.taxationYear} onChange={(event) => changeYear(event.target.value)}>
                  {supportedTaxYears.map((year) => <option key={year} value={year}>{year}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">Ετήσιοι μισθοί</FormLabel>
                <Select value={input.salaryMonthCount} onChange={(event) => setField("salaryMonthCount", Number(event.target.value))}>
                  {rules.ui.employee.salaryMonthOptions.map((months) => <option key={months} value={months}>{months}</option>)}
                </Select>
              </FormControl>
              <NumberField label="Αριθμός τέκνων" value={input.numberOfChildren} onChange={(value) => setField("numberOfChildren", Math.min(rules.ui.employee.maximumChildren, Math.trunc(value)))} max={rules.ui.employee.maximumChildren} />
              {rules.ui.ageGroups?.length ? (
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Ηλικιακή ομάδα</FormLabel>
                  <Select value={input.ageGroup} onChange={(event) => setField("ageGroup", event.target.value)}>
                    {rules.ui.ageGroups.map((group) => <option key={group.value} value={group.value}>{group.text}</option>)}
                  </Select>
                </FormControl>
              ) : <Box />}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">Ασφαλιστική κατηγορία freelancer</FormLabel>
                <Select isDisabled={input.specialInsuranceScale} value={input.insuranceScaleSelection} onChange={(event) => setField("insuranceScaleSelection", Number(event.target.value))}>
                  {rules.business.insurance.monthlyAmounts.slice(1).map((amount, index) => <option key={index + 1} value={index + 1}>{index + 1}η · {amount.toLocaleString("el-GR")} € / μήνα</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">ΦΠΑ τιμολογίου</FormLabel>
                <Select value={input.vatRate} onChange={(event) => setField("vatRate", Number(event.target.value))}>
                  {rules.business.invoice.vatRates.map((rate) => <option key={rate} value={rate}>{formatRatePercentage(rate)}</option>)}
                </Select>
              </FormControl>
            </SimpleGrid>

            <Stack spacing={1} mt={5}>
              <Checkbox colorScheme="purple" isChecked={input.returnBaseInland} onChange={(event) => setField("returnBaseInland", event.target.checked)}>Μεταφορά φορολογικής κατοικίας μισθωτού</Checkbox>
              <Checkbox colorScheme="purple" isChecked={input.specialInsuranceScale} onChange={(event) => setField("specialInsuranceScale", event.target.checked)}>Ειδική ασφαλιστική κατηγορία νέου freelancer</Checkbox>
              {rules.business.firstYearsDiscount.enabled && <Checkbox colorScheme="purple" isChecked={input.firstScaleDiscount} onChange={(event) => setField("firstScaleDiscount", event.target.checked)}>Έκπτωση φόρου πρώτων ετών freelancer</Checkbox>}
              <Checkbox colorScheme="purple" isChecked={input.prePaidNextYearTax} onChange={(event) => setField("prePaidNextYearTax", event.target.checked)}>Υπολόγισε προκαταβολή φόρου επόμενου έτους</Checkbox>
              {input.prePaidNextYearTax && <Checkbox pl={6} colorScheme="purple" isChecked={input.prePaidTaxDiscount} onChange={(event) => setField("prePaidTaxDiscount", event.target.checked)}>Έκπτωση πρώτων ετών στην προκαταβολή</Checkbox>}
              <Checkbox colorScheme="purple" isChecked={input.withholdingTax} onChange={(event) => setField("withholdingTax", event.target.checked)}>Παρακράτηση φόρου στα τιμολόγια</Checkbox>
            </Stack>

            <Box mt={4} maxW="320px">
              <NumberField label="Περσινή προκαταβολή φόρου" value={input.previousYearTaxInAdvance} onChange={(value) => setField("previousYearTaxInAdvance", value)} />
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  );
};
