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
import { Navigation } from "../components/navigation";
import {
  Layout,
  Sidebar,
  SidebarSubSection,
  SidebarSubSectionAccordion,
} from "../components/layout";
import Table from "../components/table";
import FormElements from "../components/input";
import { useCalculateBusiness } from "hooks";

const CalculatorBusiness = () => {
  const userDetails = useStore((state) => state.userDetails.business);
  const addBusinessDetail = useStore((state) => state.addBusinessDetail);
  const changeCalculatorType = useStore((state) => state.changeCalculatorType);
  const { push, pathname } = useRouter();
  const { centralCalculation, getInsuranceTotal, hasError } =
    useCalculateBusiness({ userDetails });

  const {
    grossIncomeYearly,
    grossIncomeMonthly,
    taxationYear,
    taxYearDuration,
    grossMonthOrYear,
    businessExpensesMonthOrYear,
    discountOptions,
    withholdingTax,
  } = userDetails;

  const onChange = (value) => {
    changeCalculatorType({
      value,
      field: "calculatorType",
    });

    push(`/${value}`);
  };

  const calculatorTypeValue = pathname?.split("/")[1];
  const isGrossMonthly = grossMonthOrYear === "month";

  const onSelectTaxationYear = (e) => {
    addBusinessDetail({
      value: Number(e.target.value),
      field: "taxationYear",
    });
  };

  const onChangeTaxYearDuration = (value) => {
    addBusinessDetail({
      value: Number(value),
      field: "taxYearDuration",
    });
  };

  const onChangeGrossIncome = (value, count) => {
    addBusinessDetail({
      value: Math.round(Number(value)),
      field: isGrossMonthly ? "grossIncomeMonthly" : "grossIncomeYearly",
    });

    // to upate the opposite.
    addBusinessDetail({
      value: isGrossMonthly
        ? Math.round(Number(value) * count)
        : Math.round(Number(value) / count),
      field: isGrossMonthly ? "grossIncomeYearly" : "grossIncomeMonthly",
    });
  };

  const onSelectGrossIncomeMonthOfYear = (e) => {
    addBusinessDetail({
      value: e.target.value,
      field: "grossMonthOrYear",
    });
  };

  const onChangeBusinessExpensesMonthOrYear = (value) => {
    addBusinessDetail({
      value,
      field: "businessExpensesMonthOrYear",
    });
  };

  const onChangeInsuranceScales = (value) => {
    addBusinessDetail({
      value: Number(value),
      field: "insuranceScaleSelection",
    });
  };

  const onChangeExtraBusinessExpenses = (value) => {
    addBusinessDetail({
      value: Number(value),
      field: "extraBusinessExpenses",
    });
  };

  const onChangePreviousYearTaxInAdvance = (value) => {
    addBusinessDetail({
      value: Number(value),
      field: "previousYearTaxInAdvance",
    });
  };

  return (
    <Layout>
      <Navigation />

      <Grid
        width="100%"
        templateColumns="386px 1fr"
        gap={6}
        maxW="1200px"
        mt={16}
        px={4}
        pt={4}
      >
        <GridItem>
          <Sidebar onClick={centralCalculation}>
            <Box>
              <FormElements.RadioGroup
                label="Κατηγορία"
                onChange={onChange}
                value={calculatorTypeValue}
                options={[
                  { title: "Ελέυθερος επαγγελματίας", key: "business" },
                  { title: "Μισθωτός", key: "employee" },
                ]}
              />

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
                isDisabled={grossIncomeYearly > 10000}
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
                      specialInsuranceScale:
                        !discountOptions.specialInsuranceScale,
                    },
                    field: "discountOptions",
                  })
                }
              />

              <Box mt={4}>
                <Text fontWeight="500" color="gray.700">
                  Πρόσθετα έξοδα επιχείρησης
                </Text>
                <NumberInput mt={2} onChange={onChangeExtraBusinessExpenses}>
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
                  <NumberInput
                    mt={2}
                    onChange={onChangePreviousYearTaxInAdvance}
                  >
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
                          prePaidNextYearTax:
                            !discountOptions.prePaidNextYearTax,
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
                            prePaidTaxDiscount:
                              !discountOptions.prePaidTaxDiscount,
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
          </Sidebar>
        </GridItem>
        <GridItem
          borderLeft="1px solid"
          borderColor="gray.100"
          paddingLeft="40px"
          position="relative"
        >
          <Box position="sticky" top={8}>
            <Table.Header onSubmitAction={centralCalculation} />
            <Table.Business />
          </Box>
        </GridItem>
      </Grid>
    </Layout>
  );
};

export default CalculatorBusiness;
