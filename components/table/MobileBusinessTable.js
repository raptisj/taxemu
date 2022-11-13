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
    grossIncomeMonthly,
    grossIncomeYearly,
    taxInAdvance,
    discountOptions,
    finalIncome,
    taxYearDuration,
    insurance,
    extraBusinessExpenses,
    totalTax,
  } = userDetails;

  return (
    <>
      <MobileTableHeader />

      <Tabs isFitted mt={6}>
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
              <Text fontSize="sm">Μικτό Εισόδημα</Text>
              <Text>
                {formatCellValue(grossIncomeMonthly, !!finalIncome.year)}
              </Text>
            </Flex>
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Πρόσθετα έξοδα</Text>
              <Text>
                {formatCellValue(
                  extraBusinessExpenses / taxYearDuration,
                  !!finalIncome.year
                )}
              </Text>
            </Flex>
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Ασφάλιση</Text>
              <Text>
                {formatCellValue(insurance.month, !!finalIncome.year)}
              </Text>
            </Flex>
            {discountOptions.prePaidNextYearTax && (
              <Flex padding={3} justifyContent="space-between">
                <Text fontSize="sm">Προκαταβολή φόρου</Text>
                <Text>
                  {formatCellValue(
                    taxInAdvance.month > 0 ? taxInAdvance.month : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Flex>
            )}
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φορός</Text>
              <Text>{formatCellValue(totalTax.month, !!finalIncome.year)}</Text>
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
              <Text fontSize="sm">Μικτό Εισόδημα</Text>
              <Text>
                {formatCellValue(
                  (grossIncomeYearly / 12) * taxYearDuration,
                  !!finalIncome.year
                )}
              </Text>
            </Flex>
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Πρόσθετα έξοδα</Text>
              <Text>
                {formatCellValue(extraBusinessExpenses, !!finalIncome.year)}
              </Text>
            </Flex>
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Ασφάλιση</Text>
              <Text>{formatCellValue(insurance.year, !!finalIncome.year)}</Text>
            </Flex>
            {discountOptions.prePaidNextYearTax && (
              <Flex padding={3} justifyContent="space-between">
                <Text fontSize="sm">Προκαταβολή φόρου</Text>
                <Text>
                  {formatCellValue(
                    taxInAdvance.year > 0 ? taxInAdvance.year : null,
                    !!finalIncome.yea
                  )}
                </Text>
              </Flex>
            )}
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φορός</Text>
              <Text>{formatCellValue(totalTax.year, !!finalIncome.year)}</Text>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default MobileBusinessTable;
