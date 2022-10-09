import { useCallback, useState, useEffect } from "react";
import {
  Radio,
  RadioGroup,
  Box,
  Stack,
  Text,
  Select,
  Divider,
  Grid,
  GridItem,
  NumberInput,
  NumberInputField,
  Flex,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  Tooltip,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useStore } from "store";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Navigation } from "../components/navigation";
import { Layout } from "../components/layout";
import { QuestionIcon } from "@chakra-ui/icons";
import Table from "../components/table";
import FormElements from "../components/input";

const CalculatorBusiness = () => {
  const userDetails = useStore((state) => state.userDetails.business);
  const addBusinessDetail = useStore((state) => state.addBusinessDetail);
  const changeCalculatorType = useStore((state) => state.changeCalculatorType);
  const { push, pathname } = useRouter();
  const [showSection, setShowSection] = useState(false);

  const {
    grossIncomeYearly,
    grossIncomeMonthly,
    taxationYearScales,
    taxationYear,
    taxYearDuration,
    grossMonthOrYear,
    businessExpensesMonthOrYear,
    insuranceScaleSelection,
    discountOptions,
    withholdingTax,
    taxInAdvance,
    extraBusinessExpenses,
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

  const getInsuranceTotal = () => {
    const insurancePerMonth =
      taxationYearScales[taxationYear].insuranceScales[
        discountOptions.specialInsuranceScale ? 0 : insuranceScaleSelection
      ].amount;
    const isYear = businessExpensesMonthOrYear === "year";

    return isYear ? taxYearDuration * insurancePerMonth : insurancePerMonth;
  };

  const PRE_PAID_TAX_DISCOUNT = 0.5;
  const PRE_PAID_TAX_PERCENTAGE = 0.55;
  const SCALE_THRESHOLD = 10000;

  const calculateWithCurrentScales = useCallback(
    ({ toBeTaxed }) => {
      let amount = toBeTaxed;
      let scaleResult = 0;

      if (amount > SCALE_THRESHOLD) {
        amount -= SCALE_THRESHOLD;
        scaleResult = scaleResult + 900;
      } else {
        return (
          (amount * 0.09 + scaleResult) *
          (discountOptions.firstScaleDiscount ? 0.5 : 1)
        );
      }

      if (amount > SCALE_THRESHOLD) {
        amount -= SCALE_THRESHOLD;
        scaleResult = scaleResult + 2200;
      } else {
        return amount * 0.22 + scaleResult;
      }

      if (amount > SCALE_THRESHOLD) {
        amount -= SCALE_THRESHOLD;
        scaleResult = scaleResult + 2800;
      } else {
        return amount * 0.28 + scaleResult;
      }

      if (amount > SCALE_THRESHOLD) {
        amount -= SCALE_THRESHOLD;
        scaleResult = scaleResult + 3600;
      } else {
        return amount * 0.36 + scaleResult;
      }

      return amount * 0.44 + scaleResult;
    },
    [discountOptions.firstScaleDiscount]
  );

  const centralCalculation = useCallback(() => {
    const grossPerYear = (grossIncomeYearly / 12) * taxYearDuration;

    const grossIncome = isGrossMonthly
      ? grossIncomeMonthly * taxYearDuration
      : grossPerYear;

    const insurancePerYear =
      taxationYearScales[taxationYear].insuranceScales[
        discountOptions.specialInsuranceScale ? 0 : insuranceScaleSelection
      ].amount * taxYearDuration;

    const insuranceValue = {
      month: insurancePerYear / taxYearDuration,
      year: insurancePerYear,
    };

    addBusinessDetail({
      value: insuranceValue,
      field: "insurance",
    });

    const taxableIncome =
      grossIncome - insurancePerYear - extraBusinessExpenses;

    const totalTax = calculateWithCurrentScales({
      toBeTaxed: taxableIncome,
    });

    const value = {
      month: totalTax / taxYearDuration,
      year: totalTax,
    };

    addBusinessDetail({
      value,
      field: "totalTax",
    });

    if (discountOptions.prePaidNextYearTax) {
      const taxInAdvance =
        totalTax *
        PRE_PAID_TAX_PERCENTAGE *
        (discountOptions.prePaidTaxDiscount ? PRE_PAID_TAX_DISCOUNT : 1);

      const taxInAdvanceValue = {
        month: taxInAdvance / taxYearDuration,
        year: taxInAdvance,
      };

      addBusinessDetail({
        value: taxInAdvanceValue,
        field: "taxInAdvance",
      });
    }

    const final =
      grossPerYear -
      totalTax -
      taxInAdvance.year -
      extraBusinessExpenses -
      insurancePerYear;

    const finalValue = {
      month: final / taxYearDuration,
      year: final,
    };

    addBusinessDetail({
      value: finalValue,
      field: "finalIncome",
    });
  }, [
    grossIncomeMonthly,
    grossIncomeYearly,
    taxationYearScales,
    taxationYear,
    discountOptions.specialInsuranceScale,
    discountOptions.prePaidTaxDiscount,
    discountOptions.prePaidNextYearTax,
    extraBusinessExpenses,
    taxInAdvance.year,
    isGrossMonthly,
    taxYearDuration,
    addBusinessDetail,
    insuranceScaleSelection,
    calculateWithCurrentScales,
  ]);

  useEffect(() => {
    centralCalculation();
  }, [centralCalculation]);

  return (
    <Layout>
      <Navigation />

      <Grid
        width="100%"
        templateColumns="386px 1fr"
        gap={6}
        maxW="1200px"
        mt={16}
        p={4}
        pb={14}
      >
        <GridItem>
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

          <Box mt={6}>
            <Text fontWeight="500" color="gray.500" fontSize="18px">
              Έσοδα
            </Text>
            <Grid gridTemplateColumns="2fr 1fr" gap="0 16px">
              <GridItem>
                <Text fontWeight="500" color="gray.700" mt={4}>
                  Μικτό εισόδημα
                </Text>
                <NumberInput
                  mt={2}
                  onChange={(value) =>
                    onChangeGrossIncome(value, taxYearDuration)
                  }
                  value={
                    grossMonthOrYear === "month"
                      ? grossIncomeMonthly > 0
                        ? grossIncomeMonthly
                        : ""
                      : grossIncomeYearly > 0
                      ? grossIncomeYearly
                      : ""
                  }
                >
                  <NumberInputField />
                </NumberInput>
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

            <Checkbox
              mt={2}
              isDisabled={grossIncomeYearly > 10000}
              colorScheme="purple"
              onChange={() =>
                addBusinessDetail({
                  value: {
                    ...discountOptions,
                    firstScaleDiscount: !discountOptions.firstScaleDiscount,
                  },
                  field: "discountOptions",
                })
              }
            >
              <Flex alignItems="center">
                <Tooltip
                  placement="top"
                  label={
                    <Text color="gray.100" p={2} textAlign="center">
                      Για τα τρία πρώτα έτη άσκησης της δραστηριότητας, εφόσον
                      το ετήσιο ακαθάριστο εισόδημα σας από επιχειρηματική
                      δραστηριότητα δεν υπερβαίνει τις 10.000 €, ο φορολογικός
                      συντελεστής (9%) μειώνεται κατά 50%, δηλαδή η φορολογία
                      είναι με 4,5%
                    </Text>
                  }
                >
                  <Text fontSize="sm" color="gray.500">
                    50% έκπτωση για τα 3 πρώτα χρόνια άσκησης
                    <QuestionIcon marginLeft={2} color="purple.500" />
                  </Text>
                </Tooltip>
              </Flex>
            </Checkbox>
          </Box>

          <Divider pt={6} />

          <Box mt={6}>
            <Text fontWeight="500" color="gray.500" fontSize="18px">
              Έξοδα
            </Text>

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

            <Checkbox
              mt={2}
              colorScheme="purple"
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
            >
              <Text fontSize="sm" color="gray.500">
                Ειδική (Νέοι ελεύθεροι επαγγελματίες μέχρι 5 έτη)
              </Text>
            </Checkbox>

            <Box mt={4}>
              <Text fontWeight="500" color="gray.700">
                Πρόσθετα έξοδα επιχείρησης
              </Text>
              <NumberInput mt={2} onChange={onChangeExtraBusinessExpenses}>
                <NumberInputField />
              </NumberInput>
            </Box>
          </Box>

          <Divider pt={6} />

          <Box mt={6}>
            <Flex
              onClick={() => setShowSection(!showSection)}
              justifyContent="space-between"
              alignItems="center"
              cursor="pointer"
            >
              <Text fontWeight="500" color="gray.500" fontSize="18px">
                Φόροι & κρατήσεις
              </Text>
              <ChevronDownIcon
                fontSize={22}
                style={{ transform: `rotate(${showSection ? "180deg" : "0"})` }}
              />
            </Flex>

            {showSection && (
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

                  <Checkbox
                    mt={2}
                    colorScheme="purple"
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
                    <Text fontSize="sm" color="gray.500">
                      Προκαταβολή φόρου (55% επί του συνολικού φόρου)
                    </Text>
                  </Checkbox>
                  {discountOptions.prePaidNextYearTax && (
                    <Stack pl={6} mt={1} spacing={1}>
                      <Checkbox
                        mt={2}
                        colorScheme="purple"
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
                      >
                        <Flex alignItems="center">
                          <Tooltip
                            placement="top"
                            label={
                              <Text color="gray.100" p={2} textAlign="center">
                                Ο συντελεστής προκαταβολής φόρου είναι 55%. Για
                                τα πρώτα τρία (3) έτη λειτουργίας υπάρχει
                                έκπτωση 50%.
                              </Text>
                            }
                          >
                            <Text fontSize="sm" color="gray.500">
                              Έκπτωση 50% στην προκαταβολή
                              <QuestionIcon marginLeft={2} color="purple.500" />
                            </Text>
                          </Tooltip>
                        </Flex>
                      </Checkbox>
                    </Stack>
                  )}

                  <Checkbox
                    mt={2}
                    colorScheme="purple"
                    onChange={() =>
                      addBusinessDetail({
                        value: !withholdingTax,
                        field: "withholdingTax",
                      })
                    }
                  >
                    <Text fontSize="sm" color="gray.500">
                      Παρακράτηση φόρου
                    </Text>
                  </Checkbox>
                </Box>
              </Box>
            )}
          </Box>
        </GridItem>
        <GridItem
          borderLeft="1px solid"
          borderColor="gray.100"
          paddingLeft="40px"
        >
          <Table.Header />
          <Table.Business />
        </GridItem>
      </Grid>
    </Layout>
  );
};

export default CalculatorBusiness;
