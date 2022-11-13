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
    taxMonthly,
    taxYearly,
  } = userDetails;

  return (
    <>
      <MobileTableHeader />

      <Tabs isFitted mt={6}>
        <TabList>
          <Tab>Ανά μήνα</Tab>
          <Tab>Ανά έτος</Tab>
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
              <Text fontSize="sm">Φορός</Text>
              <Text>
                {formatCellValue(
                  grossIncomeMonthly > taxMonthly && taxMonthly > 0
                    ? taxMonthly
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
              <Text fontSize="sm">Φορός</Text>
              <Text>
                {formatCellValue(
                  grossIncomeYearly > taxYearly && taxYearly > 0
                    ? taxYearly
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
