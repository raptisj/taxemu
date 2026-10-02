import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Text,
} from "@chakra-ui/react";
import { formatContributionMoney } from "../../utils/employeeContributions";
import { useStore } from "store";
import { formatCellPercentage, formatCellValue } from "utils";
import MobileTableHeader from "./MobileTableHeader";
import TaxWedgeInfoPopover from "./TaxWedgeInfoPopover";

const MobileEmployeeTable = ({ onSubmitAction }) => {
  const userDetails = useStore((state) => state.userDetails.employee);

  const {
    finalIncome,
    monthlyAmountsAreAverages,
    grossIncome,
    finalTax,
    insurance,
    employerObligations,
    totalEmployerCost,
    taxWedge,
    taxWedgePercentage,
    childrenDiscountAmount,
    taxableIncome,
  } = userDetails.tableResults;

  const formatValue = monthlyAmountsAreAverages
    ? (value) => value === null || value === undefined ? "------" : formatContributionMoney(Math.round(value * 100) / 100)
    : formatCellValue;

  return (
    <>
      <MobileTableHeader
        calculatorEntity="employee"
        onSubmitAction={onSubmitAction}
      />

      <Tabs isFitted mt={2}>
        <TabList>
          <Tab _focus={{ outline: 0 }}>{monthlyAmountsAreAverages ? "Μέσος όρος / μισθό" : "Ανά μήνα"}</Tab>
          <Tab _focus={{ outline: 0 }}>Ανά έτος</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0} pt={4}>
            <Flex padding={3} justifyContent="space-between">
              <Text fontWeight="600" fontSize="sm">
                Καθαρό εισόδημα
              </Text>
              <Text fontWeight="600">
                {formatValue(finalIncome.month)}
              </Text>
            </Flex>
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Μικτό εισόδημα</Text>
              <Text>{formatValue(grossIncome.month)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Ασφαλιστικές εισφορές</Text>
              <Text>{formatValue(insurance.month)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φορολογητέο εισόδημα</Text>
              <Text>{formatValue(taxableIncome.month)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φόρος εισοδήματος</Text>
              <Text>
                {formatValue(
                  grossIncome.month > finalTax.month && finalTax.month > 0
                    ? finalTax.month
                    : null,
                )}
              </Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Μείωση φόρου</Text>
              <Text>{formatValue(childrenDiscountAmount.month)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Εργοδοτικές εισφορές</Text>
              <Text>{formatValue(employerObligations.month)}</Text>
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
                {formatValue(totalEmployerCost.month)}
              </Text>
            </Flex>
            <Flex
              padding={3}
              justifyContent="space-between"
              background="purple.50"
            >
              <Flex align="center" gap={1}>
                <Text color="purple.800" fontWeight="600" fontSize="sm">
                  Φορολογική επιβάρυνση
                </Text>
                <TaxWedgeInfoPopover isMobile />
              </Flex>
              <Flex
                align="baseline"
                gap={1}
                color="purple.800"
                fontWeight="600"
                flexShrink={0}
              >
                <Text>{formatValue(taxWedge.month)}</Text>
                <Text fontSize="xs">
                  (
                  {formatCellPercentage(
                    taxWedgePercentage.month,
                    totalEmployerCost.month > 0,
                  )}
                  )
                </Text>
              </Flex>
            </Flex>
          </TabPanel>
          <TabPanel p={0} pt={4}>
            <Flex padding={3} justifyContent="space-between">
              <Text fontWeight="600" fontSize="sm">
                Καθαρό εισόδημα
              </Text>
              <Text fontWeight="600">{formatValue(finalIncome.year)}</Text>
            </Flex>
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Μικτό εισόδημα</Text>
              <Text>{formatValue(grossIncome.year)}</Text>
            </Flex>
            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Ασφαλιστικές εισφορές</Text>
              <Text>{formatValue(insurance.year)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φορολογητέο εισόδημα</Text>
              <Text>{formatValue(taxableIncome.year)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Φόρος εισοδήματος</Text>
              <Text>
                {formatValue(
                  grossIncome.year > finalTax.year && finalTax.year > 0
                    ? finalTax.year
                    : null,
                )}
              </Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Μείωση φόρου</Text>
              <Text>{formatValue(childrenDiscountAmount.year)}</Text>
            </Flex>

            <Flex padding={3} justifyContent="space-between">
              <Text fontSize="sm">Εργοδοτικές εισφορές</Text>
              <Text>{formatValue(employerObligations.year)}</Text>
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
                {formatValue(totalEmployerCost.year)}
              </Text>
            </Flex>
            <Flex
              padding={3}
              justifyContent="space-between"
              background="purple.50"
            >
              <Flex align="center" gap={1}>
                <Text color="purple.800" fontWeight="600" fontSize="sm">
                  Φορολογική επιβάρυνση
                </Text>
                <TaxWedgeInfoPopover isMobile />
              </Flex>
              <Flex
                align="baseline"
                gap={1}
                color="purple.800"
                fontWeight="600"
                flexShrink={0}
              >
                <Text>{formatValue(taxWedge.year)}</Text>
                <Text fontSize="xs">
                  (
                  {formatCellPercentage(
                    taxWedgePercentage.year,
                    totalEmployerCost.year > 0,
                  )}
                  )
                </Text>
              </Flex>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default MobileEmployeeTable;
