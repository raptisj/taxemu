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
import { useRouter } from "next/router";
import { useStore } from "store";
import { SidebarSubSection, SidebarSubSectionAccordion } from "../layout";
import FormElements from "../input";
import { useCalculateBusiness, useBusinessActions } from "hooks";

const BusinessForm = ({ showCalculatorType = true }) => {
  const userDetails = useStore((state) => state.userDetails.business);
  const addBusinessDetail = useStore((state) => state.addBusinessDetail);
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
  } = useBusinessActions();

  const {
    grossIncomeYearly,
    grossIncomeMonthly,
    taxationYear,
    taxYearDuration,
    grossMonthOrYear,
    businessExpensesMonthOrYear,
    discountOptions,
    withholdingTax,
    extraBusinessExpenses,
  } = userDetails;

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
            options={[
              { value: "2022", text: "2022" },
              { value: "2021", text: "2021" },
            ]}
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
                    ? grossIncomeMonthly || ""
                    : grossIncomeYearly || ""
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

        <FormElements.CheckboxWithTooltip
          label="50% έκπτωση για τα 3 πρώτα χρόνια άσκησης"
          tootipText="Για τα τρία πρώτα έτη άσκησης της δραστηριότητας, εφόσον
              το ετήσιο ακαθάριστο εισόδημα σας από επιχειρηματική
              δραστηριότητα δεν υπερβαίνει τις 10.000 €, ο φορολογικός
              συντελεστής (9%) μειώνεται κατά 50%, δηλαδή η φορολογία
              είναι με 4,5%"
          isChecked={discountOptions.firstScaleDiscount}
          isDisabled={grossIncomeYearly > 10000 || !grossIncomeYearly}
          onChange={() =>
            addBusinessDetail({
              value: {
                ...discountOptions,
                firstScaleDiscount: !discountOptions.firstScaleDiscount,
              },
              field: "discountOptions",
            })
          }
        />
      </SidebarSubSection>

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
              max={5}
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
            addBusinessDetail({
              value: {
                ...discountOptions,
                specialInsuranceScale: !discountOptions.specialInsuranceScale,
              },
              field: "discountOptions",
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
              label=" Προκαταβολή φόρου (55% επί του συνολικού φόρου)"
              isChecked={discountOptions.prePaidNextYearTax}
              show={discountOptions.prePaidNextYearTax}
              onChange={() =>
                addBusinessDetail({
                  value: {
                    ...discountOptions,
                    prePaidNextYearTax: !discountOptions.prePaidNextYearTax,
                  },
                  field: "discountOptions",
                })
              }
            >
              <FormElements.CheckboxWithTooltip
                label="Έκπτωση 50% στην προκαταβολή"
                tootipText="Ο συντελεστής προκαταβολής φόρου είναι 55%.
                    Για τα πρώτα τρία (3) έτη λειτουργίας υπάρχει
                    έκπτωση 50%."
                isChecked={discountOptions.prePaidTaxDiscount}
                onChange={() =>
                  addBusinessDetail({
                    value: {
                      ...discountOptions,
                      prePaidTaxDiscount: !discountOptions.prePaidTaxDiscount,
                    },
                    field: "discountOptions",
                  })
                }
              />
            </FormElements.CheckboxNested>

            <FormElements.Checkbox
              label="Παρακράτηση φόρου"
              isChecked={withholdingTax}
              onChange={() =>
                addBusinessDetail({
                  value: !withholdingTax,
                  field: "withholdingTax",
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
