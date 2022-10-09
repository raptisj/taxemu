import { useEffect, useState, useCallback } from "react";
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
  Heading,
  Button,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useStore } from "store";
import { ChevronDownIcon, CloseIcon } from "@chakra-ui/icons";
import { Navigation } from "../components/navigation";
import { Layout } from "../components/layout";
import Table from "../components/table";
import { sortByMultiplier } from "../utils";

const CalculatorEmployee = () => {
  const userDetails = useStore((state) => state.userDetails.employee);
  const removeUserDetails = useStore((state) => state.removeUserDetails);
  const addDetail = useStore((state) => state.addDetail); // maybe a function of its own to change calc type
  const addEmployeeDetail = useStore((state) => state.addEmployeeDetail);
  const { push, pathname } = useRouter();
  const [showSection, setShowSection] = useState(false);

  // console.log(userDetails, "userDetals");

  const {
    grossIncomeYearly,
    grossIncomeMonthly,
    grossMonthOrYear,
    salaryMonthCount,
    discountOptions,
    insuranceCarrier,
    taxationYear,
    taxationYearScales,
    numberOfChildren,
    numberOfChildrenScales,
    finalIncomeYearly,
    finalIncomeMonthly,
    finalMonthOrYear,
    taxScales,
    activeInput,
  } = userDetails;

  const calculatorTypeValue = pathname?.split("/")[1];
  const isGrossMonthly = grossMonthOrYear === "month";
  const isFinalMonthly = finalMonthOrYear === "month";

  const onChange = (value) => {
    addDetail({
      value,
      field: "calculatorType",
    });

    push(`/${value}`);
  };

  const onSelectSalaryMonthCount = (e) => {
    addEmployeeDetail({
      value: Number(e.target.value),
      field: "salaryMonthCount",
    });

    addEmployeeDetail({
      value: Math.round(Number(grossIncomeYearly) / Number(e.target.value)),
      field: "grossIncomeMonthly",
    });

    addEmployeeDetail({
      value: Math.round(
        (grossIncomeYearly / Number(e.target.value)) *
          taxationYearScales[taxationYear].insurancePercentage
      ),
      field: "insurancePerMonth",
    });
  };

  // dedicated function in store
  const onChangeGrossIncome = (value, count) => {
    addEmployeeDetail({
      value: Math.round(Number(value)),
      field: isGrossMonthly ? "grossIncomeMonthly" : "grossIncomeYearly",
    });

    // to upate the opposite.
    addEmployeeDetail({
      value: isGrossMonthly
        ? Math.round(Number(value) * count)
        : Math.round(Number(value) / count),
      field: isGrossMonthly ? "grossIncomeYearly" : "grossIncomeMonthly",
    });

    addEmployeeDetail({
      value: "gross",
      field: "activeInput",
    });
  };

  const onSelectGrossMonthOrYear = (e) => {
    addEmployeeDetail({
      value: e.target.value,
      field: "grossMonthOrYear",
    });
  };

  const onChangeFinalIncome = (value, count) => {
    addEmployeeDetail({
      value: Math.round(Number(value)),
      field: isFinalMonthly ? "finalIncomeMonthly" : "finalIncomeYearly",
    });

    // to upate the opposite.
    addEmployeeDetail({
      value: isFinalMonthly
        ? Math.round(Number(value) * count)
        : Math.round(Number(value) / count),
      field: isFinalMonthly ? "finalIncomeYearly" : "finalIncomeMonthly",
    });

    addEmployeeDetail({
      value: "final",
      field: "activeInput",
    });
  };

  const onSelectFinalIncomeMonthOfYear = (e) => {
    addEmployeeDetail({
      value: e.target.value,
      field: "finalMonthOrYear",
    });
  };

  const onSelectTaxationYear = (e) => {
    addEmployeeDetail({
      value: Number(e.target.value),
      field: "taxationYear",
    });
  };

  const onSelectInsuranceCarrier = (e) => {
    addEmployeeDetail({
      value: e.target.value,
      field: "insuranceCarrier",
    });
  };

  const onChangeNumberOfChildren = (value) => {
    addEmployeeDetail({
      value: Number(value),
      field: "numberOfChildren",
    });
  };

  const SCALE_THRESHOLD = 10000;
  const RETURN_BASE_INLAND_PERCENTAGE = 0.5;

  const calculateWithCurrentScales = ({ currentScales, toBeTaxed }) => {
    let amount = toBeTaxed;
    let scales = currentScales;

    currentScales.map((scale, index) => {
      if (amount > SCALE_THRESHOLD) {
        if (index < 4) {
          amount -= SCALE_THRESHOLD;

          scales = [
            ...scales.filter((t) => t.multiplier !== scale.multiplier),
            {
              ...scales.find((t) => t.multiplier === scale.multiplier),
              amount: SCALE_THRESHOLD * scale.multiplier,
            },
          ].sort(sortByMultiplier);
        } else {
          scales = [
            ...scales.filter((t) => t.multiplier !== scale.multiplier),
            {
              ...scales.find((t) => t.multiplier === scale.multiplier),
              amount: amount * scale.multiplier,
            },
          ].sort(sortByMultiplier);
        }
      } else {
        scales = [
          ...scales.filter((t) => t.multiplier !== scale.multiplier),
          {
            ...scales.find((t) => t.multiplier === scale.multiplier),
            amount: amount * scale.multiplier,
          },
        ].sort(sortByMultiplier);
        amount = 0;
      }
      return scale;
    });

    return scales;
  };

  const calculateChildrenDiscount = ({ amount, tax, childDiscountAmount }) => {
    let discount;
    let canApplyDiscount = tax > childDiscountAmount;

    if (amount > 12000) {
      const aboveThresholdAmount = amount - 12000;
      const result = aboveThresholdAmount * 0.02;
      discount = childDiscountAmount - result;
    } else {
      discount = amount - childDiscountAmount;
    }

    return { discount, canApplyDiscount };
  };

  // TOOO improve this function
  const centralCalculation = useCallback(() => {
    const grossMonthly = discountOptions.returnBaseInland
      ? grossIncomeMonthly * RETURN_BASE_INLAND_PERCENTAGE
      : grossIncomeMonthly;

    const insuranceMonthly =
      grossIncomeMonthly * taxationYearScales[taxationYear].insurancePercentage;

    const toBeTaxed = (grossMonthly - insuranceMonthly) * salaryMonthCount;
    const grossAfterInsurance = grossIncomeMonthly - insuranceMonthly;

    addEmployeeDetail({
      value: insuranceMonthly,
      field: "insurancePerMonth",
    });

    addEmployeeDetail({
      value: insuranceMonthly * salaryMonthCount,
      field: "insurancePerYear",
    });

    const scales = calculateWithCurrentScales({
      currentScales: taxScales,
      toBeTaxed,
    });

    const totalTax = scales
      .map((scale) => scale.amount)
      .reduce((a, b) => a + b);

    const { discount, canApplyDiscount } = calculateChildrenDiscount({
      amount: grossAfterInsurance * salaryMonthCount,
      tax: totalTax,
      childDiscountAmount: numberOfChildrenScales[numberOfChildren].discount,
    });

    const taxAfterDiscount = totalTax - discount;
    const insuranceYearly = insuranceMonthly * salaryMonthCount;

    addEmployeeDetail({
      value: taxAfterDiscount + insuranceYearly,
      field: "taxYearly",
    });

    addEmployeeDetail({
      value: (taxAfterDiscount + insuranceYearly) / salaryMonthCount,
      field: "taxMonthly",
    });

    // TODO: proper check
    if (activeInput === "gross") {
      // console.log("in gross mode");
      addEmployeeDetail({
        value: Number(
          (
            grossAfterInsurance -
            (canApplyDiscount ? Math.round(totalTax - discount) : 0) /
              salaryMonthCount
          ).toFixed(0)
        ),
        field: "finalIncomeMonthly",
      });

      addEmployeeDetail({
        value: Number(
          (
            (grossAfterInsurance -
              (canApplyDiscount ? Math.round(totalTax - discount) : 0) /
                salaryMonthCount) *
            salaryMonthCount
          ).toFixed(0)
        ),
        field: "finalIncomeYearly",
      });
    }

    if (activeInput === "final") {
      // console.log("in final mode");
      addEmployeeDetail({
        value: Number(
          (
            grossAfterInsurance -
            (canApplyDiscount ? Math.round(totalTax - discount) : 0) /
              salaryMonthCount
          ).toFixed(0)
        ),
        field: "grossIncomeMonthly",
      });

      addEmployeeDetail({
        value: (
          Number(
            grossAfterInsurance -
              (canApplyDiscount ? Math.round(totalTax - discount) : 0) /
                salaryMonthCount
          ) * salaryMonthCount
        ).toFixed(0),
        field: "grossIncomeYearly",
      });
    }

    // console.log(finalIncomeYearly, "finalIncomeYearly");
    // console.log(finalIncomeMonthly, "finalIncomeMonthly");
  }, [
    activeInput,
    grossIncomeMonthly,
    // grossIncomeYearly,
    // finalIncomeMonthly,
    // finalIncomeYearly,
    salaryMonthCount,
    discountOptions,
    taxScales,
    taxationYearScales,
    taxationYear,
    numberOfChildren,
    numberOfChildrenScales,
    addEmployeeDetail,
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
            <Box>
              <Text fontWeight="500" color="gray.700">
                Κατηγορία
              </Text>
              <RadioGroup
                onChange={onChange}
                value={calculatorTypeValue}
                mt={2}
              >
                <Stack direction="row">
                  <Radio value="business">
                    <Text fontSize="14px">Ελέυθερος επαγγελματίας</Text>
                  </Radio>
                  <Radio value="employee" fontSize="14px">
                    <Text fontSize="14px">Μισθωτός</Text>
                  </Radio>
                </Stack>
              </RadioGroup>
            </Box>

            <Box mt={4}>
              <Text fontWeight="500" color="gray.700">
                Ετήσιοι μισθοί
              </Text>
              <Select
                onChange={onSelectSalaryMonthCount}
                mt={2}
                defaultValue={salaryMonthCount}
              >
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="14.5">14.5</option>
              </Select>
            </Box>
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
                    onChangeGrossIncome(value, salaryMonthCount)
                  }
                  value={
                    grossMonthOrYear === "month"
                      ? grossIncomeMonthly || ""
                      : grossIncomeYearly || ""
                  }
                >
                  <NumberInputField placeholder="π.χ. €10000" />
                </NumberInput>
              </GridItem>
              <GridItem>
                <Text fontWeight="500" color="gray.700" mt={4}>
                  Ανά
                </Text>

                <Select
                  onChange={onSelectGrossMonthOrYear}
                  borderColor="gray.200"
                  mt={2}
                >
                  <option value="year">Έτος</option>
                  <option value="month">Μήνα</option>
                </Select>
              </GridItem>
            </Grid>

            <Text my={4} textAlign="center" color="blackAlpha.300">
              Ή
            </Text>

            <Grid gridTemplateColumns="2fr 1fr" gap="0 16px">
              <GridItem>
                <Text fontWeight="500" color="gray.700" mt={4}>
                  Καθαρό εισόδημα
                </Text>
                <NumberInput
                  isDisabled // this is temporary until formula is ready
                  mt={2}
                  onChange={(value) =>
                    onChangeFinalIncome(value, salaryMonthCount)
                  }
                  value={
                    finalMonthOrYear === "month"
                      ? finalIncomeMonthly > 0
                        ? finalIncomeMonthly
                        : ""
                      : finalIncomeYearly > 0
                      ? finalIncomeYearly
                      : ""
                  }
                >
                  <NumberInputField placeholder="π.χ. €10000" />
                </NumberInput>
              </GridItem>
              <GridItem>
                <Text fontWeight="500" color="gray.700" mt={4}>
                  Ανά
                </Text>

                <Select
                  onChange={onSelectFinalIncomeMonthOfYear}
                  borderColor="gray.200"
                  mt={2}
                >
                  <option value="year">Έτος</option>
                  <option value="month">Μήνα</option>
                </Select>
              </GridItem>
            </Grid>
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
                Επιπλέον παράμετροι
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
                    Φορολογικό έτος
                  </Text>
                  <Select
                    onChange={onSelectTaxationYear}
                    mt={2}
                    defaultValue={taxationYear}
                  >
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </Select>
                </Box>

                <Box mt={4}>
                  <Text fontWeight="500" color="gray.700">
                    Ασφαλιστικός φορέας
                  </Text>
                  <Select
                    onChange={onSelectInsuranceCarrier}
                    mt={2}
                    defaultValue={insuranceCarrier}
                  >
                    <option value="efka">ΕΦΚΑ</option>
                    <option value="tsmede">ΤΣΜΕΔΕ</option>
                  </Select>
                </Box>

                <Box mt={4}>
                  <Text fontWeight="500" color="gray.700">
                    Αριθμός τέκνων
                  </Text>
                  <NumberInput
                    mt={2}
                    defaultValue={0}
                    max={4} // TODO: make this support more children
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

                <Box mt={4}>
                  <Text fontWeight="500" color="gray.700">
                    Επιστροφή στην Ελλάδα
                  </Text>

                  <Checkbox
                    mt={2}
                    colorScheme="purple"
                    isChecked={discountOptions.returnBaseInland}
                    onChange={() =>
                      addEmployeeDetail({
                        value: {
                          ...discountOptions,
                          returnBaseInland: !discountOptions.returnBaseInland,
                        },
                        field: "discountOptions",
                      })
                    }
                  >
                    <Text fontSize="sm" color="gray.500">
                      Μεταφορά φορολογικής κατοικίας
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
          <Flex justifyContent="space-between">
            <Heading
              as="h2"
              size="lg"
              noOfLines={1}
              fontWeight="500"
              color="gray.500"
            >
              Αποτέλεσμα*
            </Heading>
            <Button
              leftIcon={<CloseIcon fontSize={8} />}
              colorScheme="gray"
              variant="outline"
              fontSize="12px"
              height="30px"
              onClick={removeUserDetails}
            >
              Εκκαθάριση όλων των πεδίων
            </Button>
          </Flex>
          <Table.V2 />
        </GridItem>
      </Grid>
    </Layout>
  );
};

export default CalculatorEmployee;
