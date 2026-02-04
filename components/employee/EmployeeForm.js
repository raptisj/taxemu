import {
  Box,
  Text,
  Grid,
  Flex,
  Divider,
  GridItem,
  Checkbox,
  FormControl,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "store";
import { useRouter } from "next/router";
import FormElements from "components/input";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useEmployeeActions, useCalculateEmployee } from "hooks";

const EmployeeForm = ({ showCalculatorType = true }) => {
  const userDetails = useStore((state) => state.userDetails.employee);
  const updateEmployee = useStore((state) => state.updateEmployee);
  const update = useStore((state) => state.update);
  const { push, pathname } = useRouter();
  const [showSection, setShowSection] = useState(false);
  const { hasError } = useCalculateEmployee();

  const {
    onSelectSalaryMonthCount,
    onChangeGrossIncome,
    onSelectGrossMonthOrYear,
    onChangeFinalIncome,
    onSelectFinalIncomeMonthOfYear,
    onSelectTaxationYear,
    onSelectInsuranceCarrier,
    onChangeNumberOfChildren,
    onSelectAgeGroup,
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
    taxationYearScales,
    ageGroup,
  } = userDetails;

  const calculatorTypeValue = pathname?.split("/")[1];

  const onChange = (value) => {
    update({
      calculatorType: value,
    });

    push(`/${value}`);
  };

  const insuranceTaxationYearList = Object.keys(taxationYearScales)
    .reverse()
    .map((t) => ({ value: t, text: t }));

  return (
    <>
      <Box>
        {showCalculatorType && (
          <FormElements.RadioGroup
            label="Κατηγορία"
            onChange={onChange}
            value={calculatorTypeValue}
            options={[
              { title: "Ελεύθερος επαγγελματίας", key: "business" },
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

            <FormControl isInvalid={hasError}>
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
              <FormErrorMessage>
                Απαιτείται η προσθήκη αυτού του πεδίου
              </FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem mt={4}>
            <FormElements.Select
              label="Ανά"
              onChange={onSelectGrossMonthOrYear}
              options={[
                { value: "year", text: "Έτος" },
                { value: "month", text: "Μήνα" },
              ]}
              defaultValue={grossMonthOrYear}
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
              defaultValue={finalMonthOrYear}
            />
          </GridItem>
        </Grid>
      </Box>

      <Box mt={3}>
        <Link href="/blog/forologia-misthoton-2026">
          <Text color="blue.600" fontSize="sm" textDecoration="underline">
            Δες τι έχει αλλάξει για το 2026
          </Text>
        </Link>
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
                options={[...insuranceTaxationYearList]}
              />
            </Box>

            <Box mt={4}>
              <FormElements.Select
                label="Ασφαλιστικός φορέας"
                onChange={onSelectInsuranceCarrier}
                defaultValue={insuranceCarrier}
                options={[{ value: "efka", text: "ΕΦΚΑ" }]}
                disabled
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

            {taxationYear >= 2026 && (
              <Box mt={4}>
                <FormElements.Select
                  label="Ηλικιακή ομάδα"
                  onChange={onSelectAgeGroup}
                  defaultValue={ageGroup}
                  options={[
                    { value: "U25", text: "Έως 25" },
                    { value: "A26_30", text: "26 έως 30" },
                    { value: "A30P", text: "Άνω των 30" },
                  ]}
                />
              </Box>
            )}

            <Box mt={4}>
              <Text fontWeight="500" color="gray.700">
                Επιστροφή στην Ελλάδα
              </Text>

              <Checkbox
                mt={2}
                colorScheme="purple"
                isChecked={discountOptions.returnBaseInland}
                onChange={() =>
                  updateEmployee({
                    discountOptions: {
                      ...discountOptions,
                      returnBaseInland: !discountOptions.returnBaseInland,
                    },
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
