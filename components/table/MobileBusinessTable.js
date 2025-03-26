import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useStore } from "store";
import { formatCellValue } from "utils";
import MobileTableHeader from "./MobileTableHeader";

const MobileBusinessTable = () => {
  const userDetails = useStore((state) => state.userDetails.business);

  const {
    prePaidNextYearTax,
    discountOptions,
    tableResults: {
      finalTax,
      insurance,
      grossIncome,
      finalIncome,
      taxInAdvance,
      businessExpenses,
      withholdingTax,
      withholdingTaxAmount,
      previousYearTaxInAdvance,
    },
  } = userDetails;

  return (
    <>
      <MobileTableHeader entity="ελεύθερου επαγγελματία" />

      <Tabs isFitted mt={2}>
        <TabList>
          <Tab _focus={{ outline: 0 }}>Ανά μήνα</Tab>
          <Tab _focus={{ outline: 0 }}>Ανά έτος</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0} pt={4}>
            <Flex padding={3} justifyContent="space-between">
              <Text fontWeight="600" fontSize="sm">
                Καθαρό εισόδημα
              </Text>

              <Text fontWeight="600">
                {formatCellValue(finalIncome.month, !!finalIncome.year)}
              </Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Μικτό εισόδημα</Text>
              <Text>
                {formatCellValue(grossIncome.month, !!finalIncome.year)}
              </Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Πρόσθετα έξοδα</Text>
              <Text>
                {formatCellValue(businessExpenses.month, !!finalIncome.year)}
              </Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Ασφάλιση</Text>
              <Text>
                {formatCellValue(insurance.month, !!finalIncome.year)}
              </Text>
            </Flex>

            {prePaidNextYearTax && (
              <Flex padding={3} justifyContent="space-between">
                <Text fontSize="sm">
                  Προκαταβολή φόρου{" "}
                  {discountOptions.prePaidTaxDiscount ? "(με έκπτωση)" : ""}
                </Text>
                <Text>
                  {formatCellValue(
                    taxInAdvance.month > 0 ? taxInAdvance.month : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Flex>
            )}

            {!!previousYearTaxInAdvance.year && (
              <Flex padding={3} justifyContent="space-between">
                <Text fontSize="sm">Περσινή προκαταβολή φόρου</Text>
                <Text>
                  {formatCellValue(
                    previousYearTaxInAdvance.month > 0
                      ? previousYearTaxInAdvance.month
                      : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Flex>
            )}

            {withholdingTax && (
              <Flex padding={3} justifyContent="space-between">
                <Text fontSize="sm">Παρακράτηση φόρου(-20%)</Text>
                <Text>
                  {formatCellValue(
                    withholdingTaxAmount.month > 0
                      ? withholdingTaxAmount.month
                      : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Flex>
            )}

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φορός</Text>
              <Text>{formatCellValue(finalTax.month, !!finalIncome.year)}</Text>
            </Flex>
          </TabPanel>

          <TabPanel p={0} pt={4}>
            <Flex padding={3} justifyContent="space-between">
              <Text fontWeight="600" fontSize="sm">
                Καθαρό εισόδημα
              </Text>

              <Text fontWeight="600">
                {formatCellValue(finalIncome.year, !!finalIncome.year)}
              </Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Μικτό εισόδημα</Text>
              <Text>
                {formatCellValue(grossIncome.year, !!finalIncome.year)}
              </Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Πρόσθετα έξοδα</Text>
              <Text>
                {formatCellValue(businessExpenses.year, !!finalIncome.year)}
              </Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Ασφάλιση</Text>
              <Text>{formatCellValue(insurance.year, !!finalIncome.year)}</Text>
            </Flex>

            {prePaidNextYearTax && (
              <Flex padding={3} justifyContent="space-between">
                <Text fontSize="sm">
                  Προκαταβολή φόρου{" "}
                  {discountOptions.prePaidTaxDiscount ? "(με έκπτωση)" : ""}
                </Text>
                <Text>
                  {formatCellValue(
                    taxInAdvance.year > 0 ? taxInAdvance.year : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Flex>
            )}

            {!!previousYearTaxInAdvance.year && (
              <Flex padding={3} justifyContent="space-between">
                <Text fontSize="sm">Περσινή προκαταβολή φόρου</Text>
                <Text>
                  {formatCellValue(
                    previousYearTaxInAdvance.year > 0
                      ? previousYearTaxInAdvance.year
                      : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Flex>
            )}

            {withholdingTax && (
              <Flex padding={3} justifyContent="space-between">
                <Text fontSize="sm">Παρακράτηση φόρου(-20%)</Text>
                <Text>
                  {formatCellValue(
                    withholdingTaxAmount.year > 0
                      ? withholdingTaxAmount.year
                      : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Flex>
            )}

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φορός</Text>
              <Text>{formatCellValue(finalTax.year, !!finalIncome.year)}</Text>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default MobileBusinessTable;
