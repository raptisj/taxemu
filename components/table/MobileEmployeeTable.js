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

const MobileEmployeeTable = () => {
  const userDetails = useStore((state) => state.userDetails.employee);

  const {
    finalIncomeMonthly,
    finalIncomeYearly,
    grossIncomeMonthly,
    grossIncomeYearly,
    finalTax,
    insurance,
  } = userDetails;

  return (
    <>
      <MobileTableHeader entity='Μισθωτός' />

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
                {formatCellValue(finalIncomeMonthly)}
              </Text>
            </Flex>
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Μικτό Εισόδημα</Text>
              <Text>{formatCellValue(grossIncomeMonthly)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Ασφαλιστικές εισφορές</Text>
              <Text>{formatCellValue(insurance.month)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φόρος εισοδήματος</Text>
              <Text>
                {formatCellValue(
                  grossIncomeMonthly > finalTax.month && finalTax.month > 0
                    ? finalTax.month
                    : null
                )}
              </Text>
            </Flex>
          </TabPanel>
          <TabPanel p={0} pt={4}>
            <Flex padding={3} justifyContent="space-between">
              <Text fontWeight="600" fontSize="sm">
                Καθαρό εισόδημα
              </Text>
              <Text fontWeight="600">{formatCellValue(finalIncomeYearly)}</Text>
            </Flex>
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Μικτό Εισόδημα</Text>
              <Text>{formatCellValue(grossIncomeYearly)}</Text>
            </Flex>
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Ασφαλιστικές εισφορές</Text>
              <Text>{formatCellValue(insurance.year)}</Text>
            </Flex>
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φόρος εισοδήματος</Text>
              <Text>
                {formatCellValue(
                  grossIncomeYearly > finalTax.year && finalTax.year > 0
                    ? finalTax.year
                    : null
                )}
              </Text>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default MobileEmployeeTable;
