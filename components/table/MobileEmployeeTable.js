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
import { formatCellPercentage, formatCellValue } from "utils";
import MobileTableHeader from "./MobileTableHeader";

const MobileEmployeeTable = ({ onSubmitAction }) => {
  const userDetails = useStore((state) => state.userDetails.employee);

  const {
    finalIncomeMonthly,
    finalIncomeYearly,
    grossIncomeMonthly,
    grossIncomeYearly,
    finalTax,
    insurance,
    employerObligations,
    totalEmployerCost,
    taxWedge,
    taxWedgePercentage,
    childrenDiscountAmount,
    taxableIncome,
  } = userDetails;

  return (
    <>
      <MobileTableHeader entity="μισθωτού" onSubmitAction={onSubmitAction} />

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
                {formatCellValue(finalIncomeMonthly)}
              </Text>
            </Flex>
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Μικτό εισόδημα</Text>
              <Text>{formatCellValue(grossIncomeMonthly)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Ασφαλιστικές εισφορές</Text>
              <Text>{formatCellValue(insurance.month)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φορολογητέο εισόδημα</Text>
              <Text>{formatCellValue(taxableIncome.month)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φόρος εισοδήματος</Text>
              <Text>
                {formatCellValue(
                  grossIncomeMonthly > finalTax.month && finalTax.month > 0
                    ? finalTax.month
                    : null,
                )}
              </Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Έκπτωση τέκνων</Text>
              <Text>{formatCellValue(childrenDiscountAmount.month)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Εργοδοτικές εισφορές</Text>
              <Text>{formatCellValue(employerObligations.month)}</Text>
            </Flex>
            <Flex
              padding={3}
              justifyContent="space-between"
              background="purple.50"
            >
              <Text color="purple.800" fontWeight="600" fontSize="sm">
                Συνολικό εργοδοτικό κόστος
              </Text>
              <Text color="purple.800" fontWeight="600">
                {formatCellValue(totalEmployerCost.month)}
              </Text>
            </Flex>
            <Flex
              padding={3}
              justifyContent="space-between"
              background="purple.50"
            >
              <Text color="purple.800" fontWeight="600" fontSize="sm">
                Φορολογική επιβάρυνση
              </Text>
              <Text color="purple.800" fontWeight="600">
                {formatCellValue(taxWedge.month)} (
                {formatCellPercentage(
                  taxWedgePercentage.month,
                  totalEmployerCost.month > 0,
                )}
                )
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
              <Text fontSize="sm">Μικτό εισόδημα</Text>
              <Text>{formatCellValue(grossIncomeYearly)}</Text>
            </Flex>
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Ασφαλιστικές εισφορές</Text>
              <Text>{formatCellValue(insurance.year)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φορολογητέο εισόδημα</Text>
              <Text>{formatCellValue(taxableIncome.year)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φόρος εισοδήματος</Text>
              <Text>
                {formatCellValue(
                  grossIncomeYearly > finalTax.year && finalTax.year > 0
                    ? finalTax.year
                    : null,
                )}
              </Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Έκπτωση τέκνων</Text>
              <Text>{formatCellValue(childrenDiscountAmount.year)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Εργοδοτικές εισφορές</Text>
              <Text>{formatCellValue(employerObligations.year)}</Text>
            </Flex>
            <Flex
              padding={3}
              justifyContent="space-between"
              background="purple.50"
            >
              <Text color="purple.800" fontWeight="600" fontSize="sm">
                Συνολικό εργοδοτικό κόστος
              </Text>
              <Text color="purple.800" fontWeight="600">
                {formatCellValue(totalEmployerCost.year)}
              </Text>
            </Flex>
            <Flex
              padding={3}
              justifyContent="space-between"
              background="purple.50"
            >
              <Text color="purple.800" fontWeight="600" fontSize="sm">
                Φορολογική επιβάρυνση
              </Text>
              <Text color="purple.800" fontWeight="600">
                {formatCellValue(taxWedge.year)} (
                {formatCellPercentage(
                  taxWedgePercentage.year,
                  totalEmployerCost.year > 0,
                )}
                )
              </Text>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default MobileEmployeeTable;
