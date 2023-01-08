import { useState } from "react";
import {
  Box,
  Text,
  Grid,
  Flex,
  Divider,
  GridItem,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useStore } from "store";
import { ChevronDownIcon } from "@chakra-ui/icons";
import FormElements from "components/input";
import { useEmployeeActions } from "hooks";

const EmployeeForm = ({ showCalculatorType = true }) => {
  const userDetails = useStore((state) => state.userDetails.employee);
  const addEmployeeDetail = useStore((state) => state.addEmployeeDetail);
  const changeCalculatorType = useStore((state) => state.changeCalculatorType);
  const { push, pathname } = useRouter();
  const [showSection, setShowSection] = useState(false);
  const {
    onSelectSalaryMonthCount,
    onChangeGrossIncome,
    onSelectGrossMonthOrYear,
    onChangeFinalIncome,
    onSelectFinalIncomeMonthOfYear,
    onSelectTaxationYear,
    onSelectInsuranceCarrier,
    onChangeNumberOfChildren,
  } = useEmployeeActions();

  const {
    grossIncomeYearly,
    grossIncomeMonthly,
    grossMonthOrYear,
    salaryMonthCount,
    discountOptions,
    insuranceCarrier,
    taxationYear,
    numberOfChildren,
    finalIncomeYearly,
    finalIncomeMonthly,
    finalMonthOrYear,
  } = userDetails;

  const calculatorTypeValue = pathname?.split("/")[1];

  const onChange = (value) => {
    changeCalculatorType({
      value,
      field: "calculatorType",
    });

    push(`/${value}`);
  };

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
            label="Ετήσιοι μισθοί"
            onChange={onSelectSalaryMonthCount}
            defaultValue={salaryMonthCount}
            options={[
              { value: "12", text: "12" },
              { value: "14", text: "14" },
              { value: "14.5", text: "14.5" },
            ]}
          />
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
              onChange={(value) => onChangeGrossIncome(value, salaryMonthCount)}
              value={
                grossMonthOrYear === "month"
                  ? grossIncomeMonthly || ""
                  : grossIncomeYearly || ""
              }
            >
              <NumberInputField placeholder="π.χ. €10000" />
            </NumberInput>
          </GridItem>
          <GridItem mt={4}>
            <FormElements.Select
              label="Ανά"
              onChange={onSelectGrossMonthOrYear}
              options={[
                { value: "year", text: "Έτος" },
                { value: "month", text: "Μήνα" },
              ]}
            />
          </GridItem>
        </Grid>

        <Text my={4} textAlign="center" color="blackAlpha.300">
          Ή
        </Text>

        <Grid gridTemplateColumns="2fr 1fr" gap="0 16px">
          <GridItem>
            <Text fontWeight="500" color="gray.700">
              Καθαρό εισόδημα
            </Text>
            <NumberInput
              mt={2}
              onChange={(value) => onChangeFinalIncome(value, salaryMonthCount)}
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
            <FormElements.Select
              label="Ανά"
              onChange={onSelectFinalIncomeMonthOfYear}
              options={[
                { value: "year", text: "Έτος" },
                { value: "month", text: "Μήνα" },
              ]}
            />
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
            style={{
              transform: `rotate(${showSection ? "180deg" : "0"})`,
            }}
          />
        </Flex>

        {showSection && (
          <Box>
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
              <FormElements.Select
                label="Ασφαλιστικός φορέας"
                onChange={onSelectInsuranceCarrier}
                defaultValue={insuranceCarrier}
                options={[
                  { value: "efka", text: "ΕΦΚΑ" },
                  { value: "tsmede", text: "ΤΣΜΕΔΕ" },
                ]}
              />
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
    </>
  );
};

export default EmployeeForm;
