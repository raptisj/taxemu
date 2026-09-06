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
import { getTaxRules, supportedTaxYears } from "../../rules";

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
    ageGroup,
  } = userDetails;
  const rules = getTaxRules(taxationYear);

  const calculatorTypeValue = pathname?.split("/")[1];

  const onChange = (value) => {
    update({
      calculatorType: value,
    });

    push(`/${value}`);
  };

  const taxationYearOptions = supportedTaxYears.map((year) => ({
    value: String(year),
    text: String(year),
  }));

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
            options={rules.ui.employee.salaryMonthOptions.map((months) => ({
              value: String(months),
              text: String(months),
            }))}
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
                options={taxationYearOptions}
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
                max={rules.ui.employee.maximumChildren}
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

            {rules.ui.employee.showAgeGroup && (
              <Box mt={4}>
                <FormElements.Select
                  label="Ηλικιακή ομάδα"
                  onChange={onSelectAgeGroup}
                  defaultValue={ageGroup}
                  options={rules.ui.ageGroups}
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
