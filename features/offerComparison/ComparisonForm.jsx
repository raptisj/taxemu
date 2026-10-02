import { useId } from "react";
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
import { formatRatePercentage, getInsuranceMonthlyAmounts } from "../../utils";
import {
  COMPARISON_PERSPECTIVES,
  OFFER_TYPES,
  OFFER_PERIODS,
  getEffectiveBillableMonths,
} from "../../utils/offerComparison";

const NumberField = ({ label, value, onChange, helper, ...rest }) => {
  const id = useId();
  return (
    <FormControl>
      <FormLabel htmlFor={id} color="gray.700" fontSize="sm" fontWeight="600" mb={2}>{label}</FormLabel>
      <NumberInput min={0} value={value === 0 ? "" : value} onChange={(_, nextValue) => onChange(Number.isFinite(nextValue) ? nextValue : 0)} {...rest}>
        <NumberInputField id={id} bg="white" />
      </NumberInput>
      {helper && <Text color="gray.500" fontSize="xs" mt={1.5}>{helper}</Text>}
    </FormControl>
  );
};

const MoneyOfferField = ({ label, amount, period, onAmountChange, onPeriodChange, helper }) => {
  const id = useId();
  return (
    <FormControl>
      <FormLabel htmlFor={id} color="gray.700" fontSize="sm" fontWeight="600" mb={2}>{label}</FormLabel>
      <Grid templateColumns="minmax(0, 1fr) 118px" gap={2}>
        <NumberInput min={0} value={amount || ""} onChange={(_, value) => onAmountChange(Number.isFinite(value) ? value : 0)}>
          <NumberInputField id={id} bg="white" placeholder="Ποσό σε €" />
        </NumberInput>
        <Select aria-label={`Περίοδος: ${label}`} bg="white" value={period} onChange={(event) => onPeriodChange(event.target.value)}>
          <option value={OFFER_PERIODS.YEAR}>ανά έτος</option>
          <option value={OFFER_PERIODS.MONTH}>ανά μήνα</option>
        </Select>
      </Grid>
      {helper && <Text color="gray.500" fontSize="xs" mt={1.5}>{helper}</Text>}
    </FormControl>
  );
};

const Section = ({ title, description, children }) => (
  <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="white" p={{ base: 4, md: 5 }}>
    <Heading as="h2" fontSize="lg">{title}</Heading>
    {description && <Text color="gray.500" fontSize="sm" mt={1}>{description}</Text>}
    <Box mt={5}>{children}</Box>
  </Box>
);

export const ComparisonForm = ({ input, setInput, settings = false }) => {
  const rules = getTaxRules(input.taxationYear);
  const company = input.perspective === COMPARISON_PERSPECTIVES.COMPANY;
  const employeeOffer = input.offerType === OFFER_TYPES.EMPLOYEE;
  const effectiveMonths = getEffectiveBillableMonths(input);
  const setField = (field, value) => setInput((current) => ({ ...current, [field]: value }));
  const clampChildren = (children, maximumChildren) =>
    maximumChildren === null
      ? children
      : Math.min(children, maximumChildren);

  const changeYear = (value) => {
    const taxationYear = Number(value);
    const nextRules = getTaxRules(taxationYear);
    setInput((current) => ({
      ...current,
      taxationYear,
      numberOfChildren: clampChildren(
        current.numberOfChildren,
        nextRules.ui.employee.maximumChildren,
      ),
      insuranceScaleSelection: Math.min(
        current.insuranceScaleSelection,
        nextRules.business.insurance.monthlyAmounts.length - 1,
      ),
      vatRate: nextRules.business.invoice.vatRates.includes(current.vatRate)
        ? current.vatRate
        : nextRules.business.invoice.vatRates[0],
    }));
  };

  const changeOfferType = (offerType) => setInput((current) => {
    if (current.hasSecondOffer) return { ...current, offerType };
    const from = current.offerType === OFFER_TYPES.EMPLOYEE ? "employee" : "freelancer";
    const to = offerType === OFFER_TYPES.EMPLOYEE ? "employee" : "freelancer";
    return {
      ...current,
      offerType,
      [`${to}OfferAmount`]: current[`${from}OfferAmount`],
      [`${to}OfferPeriod`]: current[`${from}OfferPeriod`],
    };
  });

  const offerField = (type) => {
    const employee = type === OFFER_TYPES.EMPLOYEE;
    return (
      <MoneyOfferField
        label={employee ? "Μικτή πρόταση μισθωτού" : "Πρόταση τιμολογίου freelancer (χωρίς ΦΠΑ)"}
        amount={employee ? input.employeeOfferAmount : input.freelancerOfferAmount}
        period={employee ? input.employeeOfferPeriod : input.freelancerOfferPeriod}
        onAmountChange={(value) => setField(employee ? "employeeOfferAmount" : "freelancerOfferAmount", value)}
        onPeriodChange={(value) => setField(employee ? "employeeOfferPeriod" : "freelancerOfferPeriod", value)}
        helper={employee
          ? input.employeeOfferPeriod === OFFER_PERIODS.MONTH ? `Μηνιαίο ποσό × ${input.salaryMonthCount} μισθούς ανά έτος.` : `Το ετήσιο ποσό περιλαμβάνει και τους ${input.salaryMonthCount} μισθούς.`
          : input.freelancerOfferPeriod === OFFER_PERIODS.MONTH ? `Μηνιαίο τιμολόγιο × ${effectiveMonths.toLocaleString("el-GR", { maximumFractionDigits: 2 })} χρεώσιμους μήνες, μετά την άδεια.` : "Ετήσια έσοδα μετά την επίδραση της άδειας, χωρίς ΦΠΑ."}
      />
    );
  };

  if (!settings) return (
    <Stack spacing={4}>
      <Section title="Για ποιον συγκρίνεις;">
        <SimpleGrid columns={2} spacing={3}>
          {[
            { value: COMPARISON_PERSPECTIVES.PERSONAL, title: "Για εμένα", description: "Πόσα μου μένουν καθαρά;" },
            { value: COMPARISON_PERSPECTIVES.COMPANY, title: "Για την εταιρεία", description: "Τι αποδίδει το ίδιο budget;" },
          ].map((option) => (
            <Box as="button" type="button" key={option.value} onClick={() => setField("perspective", option.value)} aria-pressed={input.perspective === option.value}
              borderWidth="2px" borderColor={input.perspective === option.value ? "purple.500" : "gray.200"}
              bg={input.perspective === option.value ? "purple.50" : "white"} borderRadius="lg" p={3} textAlign="left"
              _hover={{ borderColor: "purple.400" }}>
              <Text fontWeight="700">{option.title}</Text>
              <Text color="gray.500" fontSize="xs" mt={1}>{option.description}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Section>
      <Section title={company ? "Το budget της εταιρείας" : "Η πρόταση που έχεις"}>
        <Stack spacing={4}>
          <FormControl>
            <FormLabel htmlFor="comparison-year" fontSize="sm" fontWeight="600">Φορολογικό έτος</FormLabel>
            <Select id="comparison-year" value={input.taxationYear} onChange={(event) => changeYear(event.target.value)}>
              {supportedTaxYears.map((year) => <option key={year} value={year}>{year}</option>)}
            </Select>
          </FormControl>
          {company ? (
            <NumberField label="Συνολικό ετήσιο εταιρικό budget" value={input.companyBudget} onChange={(value) => setField("companyBudget", value)} helper="Περιλαμβάνει μικτές αποδοχές και εργοδοτικές εισφορές. Το τιμολόγιο είναι χωρίς ανακτήσιμο ΦΠΑ." />
          ) : (
            <>
              <FormControl>
                <FormLabel htmlFor="comparison-offer-type" fontSize="sm" fontWeight="600">Η γνωστή πρόταση είναι</FormLabel>
                <Select id="comparison-offer-type" value={input.offerType} onChange={(event) => changeOfferType(event.target.value)}>
                  <option value={OFFER_TYPES.EMPLOYEE}>Μισθωτή εργασία</option>
                  <option value={OFFER_TYPES.FREELANCER}>Freelancer</option>
                </Select>
              </FormControl>
              {offerField(input.offerType)}
              <Checkbox colorScheme="purple" isChecked={input.hasSecondOffer} onChange={(event) => setField("hasSecondOffer", event.target.checked)}>
                <Text fontSize="sm">Έχω διαφορετική πρόταση για την άλλη μορφή συνεργασίας</Text>
              </Checkbox>
              {input.hasSecondOffer ? offerField(employeeOffer ? OFFER_TYPES.FREELANCER : OFFER_TYPES.EMPLOYEE) : (
                <Text fontSize="xs" color="purple.700" bg="purple.50" p={3} borderRadius="md">Για την άλλη μορφή υποθέτουμε το ίδιο ετήσιο ποσό προσφοράς. Δεν εξισώνουμε το καθαρό εισόδημα ή το κόστος εταιρείας.</Text>
              )}
            </>
          )}
          <FormControl>
            <FormLabel htmlFor="comparison-salaries" fontSize="sm" fontWeight="600">Μισθοί μισθωτού ανά έτος</FormLabel>
            <Select id="comparison-salaries" value={input.salaryMonthCount} onChange={(event) => setField("salaryMonthCount", Number(event.target.value))}>
              {rules.ui.employee.salaryMonthOptions.map((months) => <option key={months} value={months}>{months}</option>)}
            </Select>
          </FormControl>
        </Stack>
      </Section>
    </Stack>
  );

  return (
    <Stack spacing={4}>
      <Accordion allowToggle borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="white" overflow="hidden">
        <AccordionItem border="none">
          <AccordionButton p={{ base: 4, md: 5 }}>
            <Box flex="1" textAlign="left">
              <Heading as="h2" fontSize="lg">Παραδοχές freelancer</Heading>
              <Text color="gray.500" fontSize="sm" mt={1}>Άδεια, χρόνος τιμολόγησης και επαγγελματικά έξοδα.</Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel px={{ base: 4, md: 5 }} pb={5}>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <NumberField label="Μήνες τιμολόγησης πριν την άδεια" value={input.billableMonths} onChange={(value) => setField("billableMonths", Math.min(12, value))} max={12} precision={2} />
              <NumberField label="Ημέρες άδειας" value={input.unpaidLeaveDays} onChange={(value) => setField("unpaidLeaveDays", Math.min(260, value))} max={260} />
              <NumberField label="Ετήσια επαγγελματικά έξοδα" value={input.businessExpensesAnnual} onChange={(value) => setField("businessExpensesAnnual", value)} />
              <NumberField label="Έτος άσκησης δραστηριότητας" value={input.businessAge} onChange={(value) => setField("businessAge", Math.min(60, Math.max(1, Math.trunc(value))))} min={1} max={60} />
            </SimpleGrid>
            <Checkbox mt={4} colorScheme="purple" isChecked={input.leaveIsBillable} onChange={(event) => setField("leaveIsBillable", event.target.checked)}>
              <Text fontSize="sm">Η άδεια τιμολογείται κανονικά</Text>
            </Checkbox>
            <Text color="gray.500" fontSize="xs" mt={3}>Οι μήνες είναι πριν την άδεια, ώστε να μην αφαιρεθεί δύο φορές. Η άδεια μειώνει τα έσοδα μηνιαίου τιμολογίου. Το ετήσιο ποσό θεωρείται ήδη μετά την άδεια.</Text>
            {effectiveMonths <= 0 && <Text color="red.600" fontSize="sm" mt={3}>Χρειάζεται τουλάχιστον ένα χρεώσιμο διάστημα. Αύξησε τους μήνες ή μείωσε την άδεια.</Text>}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

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
              <NumberField label="Αριθμός τέκνων" value={input.numberOfChildren} onChange={(value) => setField("numberOfChildren", clampChildren(Math.trunc(value), rules.ui.employee.maximumChildren))} max={rules.ui.employee.maximumChildren ?? undefined} />
              {rules.ui.ageGroups?.length ? (
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Ηλικιακή ομάδα</FormLabel>
                  <Select aria-label="Ηλικιακή ομάδα" value={input.ageGroup} onChange={(event) => setField("ageGroup", event.target.value)}>
                    {rules.ui.ageGroups.map((group) => <option key={group.value} value={group.value}>{group.text}</option>)}
                  </Select>
                </FormControl>
              ) : <Box />}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">Ασφαλιστική κατηγορία freelancer</FormLabel>
                <Select aria-label="Ασφαλιστική κατηγορία freelancer" isDisabled={input.specialInsuranceScale} value={input.insuranceScaleSelection} onChange={(event) => setField("insuranceScaleSelection", Number(event.target.value))}>
                  {getInsuranceMonthlyAmounts({ rules: rules.business }).slice(1).map((amount, index) => <option key={index + 1} value={index + 1}>{index + 1}η · {amount.toLocaleString("el-GR")} € / μήνα</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">ΦΠΑ τιμολογίου</FormLabel>
                <Select aria-label="ΦΠΑ τιμολογίου" value={input.vatRate} onChange={(event) => setField("vatRate", Number(event.target.value))}>
                  {rules.business.invoice.vatRates.map((rate) => <option key={rate} value={rate}>{formatRatePercentage(rate)}</option>)}
                </Select>
              </FormControl>
            </SimpleGrid>

            {rules.business.insurance.monthlyUnemploymentContribution > 0 && (
              <Text mt={3} fontSize="xs" color="gray.500">
                Τα ποσά ΕΦΚΑ περιλαμβάνουν εισφορά ανεργίας €
                {rules.business.insurance.monthlyUnemploymentContribution} ανά
                ασφαλισμένο μήνα. Δεν περιλαμβάνουν τυχόν επαγγελματικές
                πρόσθετες εισφορές.
              </Text>
            )}

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
