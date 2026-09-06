import {
  Box,
  Text,
  Grid,
  Divider,
  GridItem,
  FormControl,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useStore } from "store";
import { SidebarSubSection, SidebarSubSectionAccordion } from "../layout";
import FormElements from "../input";
import { useCalculateBusiness, useBusinessActions } from "hooks";
import { BusinessNegotiateWidget } from "../../features";
import { getTaxRules, supportedTaxYears } from "../../rules";

const BusinessForm = ({ showCalculatorType = true }) => {
  const userDetails = useStore((state) => state.userDetails.business);
  const updateBusiness = useStore((state) => state.updateBusiness);
  const update = useStore((state) => state.update);
  const { push, pathname } = useRouter();
  const { getInsuranceTotal, hasError } = useCalculateBusiness();

  const {
    onSelectTaxationYear,
    onChangeTaxYearDuration,
    onChangeGrossIncome,
    onSelectGrossIncomeMonthOfYear,
    onChangeBusinessExpensesMonthOrYear,
    onChangeInsuranceScales,
    onChangeExtraBusinessExpenses,
    onChangePreviousYearTaxInAdvance,
    onChangeNumberOfChildren,
    onSelectAgeGroup,
  } = useBusinessActions();

  const {
    grossIncome,
    taxationYear,
    taxYearDuration,
    grossMonthOrYear,
    businessExpensesMonthOrYear,
    discountOptions,
    withholdingTax,
    extraBusinessExpenses,
    prePaidNextYearTax,
    insuranceScaleSelection,
    numberOfChildren,
    ageGroup,
  } = userDetails;
  const rules = getTaxRules(taxationYear);
  const firstYearsDiscount = rules.business.firstYearsDiscount;

  const onChange = (value) => {
    update({
      calculatorType: value,
    });

    push(`/${value}`);
  };

  const calculatorTypeValue = pathname?.split("/")[1];

  return (
    <>
      <Box>
        {showCalculatorType && (
          <FormElements.RadioGroup
            label="Κατηγορία"
            onChange={onChange}
            value={calculatorTypeValue}
            options={[
              { title: "Ελέυθερος επαγγελματίας", key: "business" },
              { title: "Μισθωτός", key: "employee" },
            ]}
          />
        )}

        <Box mt={4}>
          <FormElements.Select
            label="Φορολογικό έτος"
            onChange={onSelectTaxationYear}
            defaultValue={taxationYear}
            options={supportedTaxYears.map((year) => ({
              value: String(year),
              text: String(year),
            }))}
          />
        </Box>

        <Box mt={4}>
          <Text fontWeight="500" color="gray.700">
            Αριθμός μηνών φορολογίας
          </Text>
          <NumberInput
            mt={2}
            defaultValue={12}
            max={12}
            min={1}
            clampValueOnBlur={false}
            onChange={onChangeTaxYearDuration}
          >
            <NumberInputField readOnly />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Box>

        <Text color="gray.500" fontSize="14px" mt={2}>
          Επίλεξε τους μήνες για τους οποίους θα γίνει ο υπολογισμός
        </Text>

        {(rules.ui.business.showChildren || rules.ui.business.showAgeGroup) && (
          <>
            {rules.ui.business.showChildren && (
              <Box mt={4}>
                <Text fontWeight="500" color="gray.700">
                  Αριθμός τέκνων
                </Text>
                <NumberInput
                  mt={2}
                  defaultValue={0}
                  max={rules.ui.business.maximumChildren}
                  min={0}
                  clampValueOnBlur={false}
                  onChange={onChangeNumberOfChildren}
                  value={numberOfChildren}
                >
                  <NumberInputField readOnly />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
            )}

            {rules.ui.business.showAgeGroup && (
              <Box mt={4}>
                <FormElements.Select
                  label="Ηλικιακή ομάδα"
                  onChange={onSelectAgeGroup}
                  defaultValue={ageGroup}
                  options={rules.ui.ageGroups}
                />
              </Box>
            )}
            <Box mt={3}>
              <Link href="/blog/forologia-atomikis-epixirisis-2026">
                <Text color="blue.600" fontSize="sm" textDecoration="underline">
                  Δες τι έχει αλλάξει για το 2026
                </Text>
              </Link>
            </Box>
          </>
        )}
      </Box>

      <Divider pt={6} />
      <SidebarSubSection title="Έσοδα">
        <Grid gridTemplateColumns="2fr 1fr" gap="0 16px">
          <GridItem>
            <Text fontWeight="500" color="gray.700" mt={4}>
              Μικτό εισόδημα
            </Text>
            <FormControl isInvalid={hasError}>
              <NumberInput
                mt={2}
                onChange={(value) =>
                  onChangeGrossIncome(value, taxYearDuration)
                }
                value={
                  grossMonthOrYear === "month"
                    ? grossIncome.month || ""
                    : grossIncome.year || ""
                }
              >
                <NumberInputField />
              </NumberInput>

              <FormErrorMessage>
                Απαιτείται η προσθήκη αυτού του πεδίου
              </FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem mt={4}>
            <FormElements.Select
              label="Ανά"
              onChange={onSelectGrossIncomeMonthOfYear}
              options={[
                { value: "year", text: "Έτος" },
                { value: "month", text: "Μήνα" },
              ]}
            />
          </GridItem>
        </Grid>

        {firstYearsDiscount.enabled && (
          <FormElements.CheckboxWithTooltip
            label={`${(1 - firstYearsDiscount.taxMultiplier) * 100}% έκπτωση για τα 3 πρώτα χρόνια άσκησης`}
            tootipText={`Για τα τρία πρώτα έτη άσκησης της δραστηριότητας, εφόσον
              το ετήσιο ακαθάριστο εισόδημα δεν υπερβαίνει τις
              ${firstYearsDiscount.maximumTaxableIncome.toLocaleString("el-GR")} €,
              ο φόρος μειώνεται κατά ${(1 - firstYearsDiscount.taxMultiplier) * 100}%.`}
            isChecked={discountOptions.firstScaleDiscount}
            isDisabled={
              grossIncome.year > firstYearsDiscount.maximumTaxableIncome ||
              !grossIncome.year
            }
            onChange={() =>
              updateBusiness({
                discountOptions: {
                  ...discountOptions,
                  firstScaleDiscount: !discountOptions.firstScaleDiscount,
                },
              })
            }
          />
        )}
      </SidebarSubSection>

      <Box mt={6}>
        <BusinessNegotiateWidget />
      </Box>

      <Divider pt={6} />

      <SidebarSubSection title="Έξοδα">
        <FormElements.RadioGroup
          onChange={onChangeBusinessExpensesMonthOrYear}
          value={businessExpensesMonthOrYear}
          options={[
            { title: "Ανά μήνα", key: "month" },
            { title: "Ανά έτος", key: "year" },
          ]}
        />

        <Grid gridTemplateColumns="2fr 1fr" gap="0 16px" mt={4}>
          <GridItem>
            <Text fontWeight="500" color="gray.700">
              Κοινωνική ασφάλιση (ΕΦΚΑ)
            </Text>
            <NumberInput readOnly value={getInsuranceTotal()}>
              <NumberInputField />
            </NumberInput>
          </GridItem>
          <GridItem>
            <Text fontWeight="500" color="gray.700">
              Κλίμακα
            </Text>

            <NumberInput
              isDisabled={discountOptions.specialInsuranceScale}
              defaultValue={1}
              value={
                insuranceScaleSelection === 0 ? 1 : insuranceScaleSelection
              }
              max={rules.business.insurance.monthlyAmounts.length - 1}
              min={1}
              clampValueOnBlur={false}
              onChange={onChangeInsuranceScales}
            >
              <NumberInputField readOnly />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </GridItem>
        </Grid>

        <FormElements.Checkbox
          label="Ειδική (Νέοι ελεύθεροι επαγγελματίες μέχρι 5 έτη)"
          isChecked={discountOptions.specialInsuranceScale}
          onChange={() =>
            updateBusiness({
              discountOptions: {
                ...discountOptions,
                specialInsuranceScale: !discountOptions.specialInsuranceScale,
              },
              insuranceScaleSelection: !discountOptions.specialInsuranceScale
                ? 1
                : insuranceScaleSelection,
            })
          }
        />

        <Box mt={4}>
          <Text fontWeight="500" color="gray.700">
            Πρόσθετα έξοδα επιχείρησης
          </Text>
          <NumberInput
            mt={2}
            onChange={onChangeExtraBusinessExpenses}
            value={extraBusinessExpenses || ""}
          >
            <NumberInputField />
          </NumberInput>
        </Box>
      </SidebarSubSection>

      <Divider pt={6} />

      <SidebarSubSectionAccordion title="Φόροι & κρατήσεις">
        <Box>
          <Box mt={4}>
            <Text fontWeight="500" color="gray.700">
              Περσινή προκαταβολή φόρου
            </Text>
            <NumberInput mt={2} onChange={onChangePreviousYearTaxInAdvance}>
              <NumberInputField />
            </NumberInput>
          </Box>

          <Box mt={4}>
            <Text fontWeight="500" color="gray.700">
              Κρατήσεις
            </Text>

            <FormElements.CheckboxNested
              label={`Προκαταβολή φόρου (${rules.business.taxPrepayment.rate * 100}% επί του συνολικού φόρου)`}
              isChecked={prePaidNextYearTax}
              show={prePaidNextYearTax}
              onChange={() =>
                updateBusiness({
                  prePaidNextYearTax: !prePaidNextYearTax,
                })
              }
            >
              <FormElements.CheckboxWithTooltip
                label={`Έκπτωση ${(1 - rules.business.taxPrepayment.discountMultiplier) * 100}% στην προκαταβολή`}
                tootipText={`Ο συντελεστής προκαταβολής φόρου είναι ${rules.business.taxPrepayment.rate * 100}%.
                    Για τα πρώτα τρία (3) έτη λειτουργίας υπάρχει
                    έκπτωση ${(1 - rules.business.taxPrepayment.discountMultiplier) * 100}%.`}
                isChecked={discountOptions.prePaidTaxDiscount}
                onChange={() =>
                  updateBusiness({
                    discountOptions: {
                      ...discountOptions,
                      prePaidTaxDiscount: !discountOptions.prePaidTaxDiscount,
                    },
                  })
                }
              />
            </FormElements.CheckboxNested>

            <FormElements.Checkbox
              label="Παρακράτηση φόρου"
              isChecked={withholdingTax}
              onChange={() =>
                updateBusiness({
                  withholdingTax: !withholdingTax,
                })
              }
            />
          </Box>
        </Box>
      </SidebarSubSectionAccordion>
    </>
  );
};

export default BusinessForm;
