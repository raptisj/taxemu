import {
  Tr,
  Th,
  Td,
  Table,
  Thead,
  Tbody,
  TableCaption,
  TableContainer,
  Flex,
  Text,
} from "@chakra-ui/react";
import { formatContributionMoney } from "../../utils/employeeContributions";
import { useStore } from "store";
import { formatCellPercentage, formatCellValue } from "utils";
import TaxWedgeInfoPopover from "./TaxWedgeInfoPopover";

const EmployeeTable = () => {
  const userDetails = useStore((state) => state.userDetails.employee);

  const {
    monthlyAmountsAreAverages,
    grossIncome,
    finalIncome,
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
    <TableContainer mt={6} background="#ffffff70">
      <Table variant="simple">
        <TableCaption color="gray.500" textAlign="left">
          Οι υπολογισμοί είναι κατά προσέγγιση και δεν αποτελούν λογιστική
          συμβουλή*
        </TableCaption>
        <Thead>
          <Tr>
            <Th border="none"></Th>
            <Th border="none">{monthlyAmountsAreAverages ? "ΜΕΣΟΣ ΟΡΟΣ ΑΝΑ ΜΙΣΘΟ" : "ΑΝΑ ΜΗΝΑ"}</Th>
            <Th border="none">ΑΝΑ ΕΤΟΣ</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td borderBottomWidth={1} borderColor="gray.500">
              <Text fontWeight="700" fontSize="sm">
                Καθαρός μισθός
              </Text>
            </Td>
            <Td borderBottomWidth={1} borderColor="gray.500">
              <Text fontWeight="600" fontSize="sm">
                {formatValue(finalIncome.month)}
              </Text>
            </Td>
            <Td isNumeric borderBottomWidth={1} borderColor="gray.500">
              <Text fontWeight="600" fontSize="sm" textAlign="left">
                {formatValue(finalIncome.year)}
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td border="none">
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Μικτός μισθός
              </Text>
            </Td>
            <Td border="none">
              <Text color="gray.700" fontSize="sm">
                {formatValue(grossIncome.month)}
              </Text>
            </Td>
            <Td isNumeric border="none">
              <Text color="gray.700" fontSize="sm" textAlign="left">
                {formatValue(grossIncome.year)}
              </Text>
            </Td>
          </Tr>

          <Tr>
            <Td border="none">
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Ασφαλιστικές εισφορές
              </Text>
            </Td>
            <Td border="none">
              <Text color="gray.700" fontSize="sm">
                {formatValue(insurance.month)}
              </Text>
            </Td>
            <Td isNumeric border="none">
              <Text color="gray.700" fontSize="sm" textAlign="left">
                {formatValue(insurance.year)}
              </Text>
            </Td>
          </Tr>

          <Tr>
            <Td border="none">
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Φορολογητέο εισόδημα
              </Text>
            </Td>
            <Td border="none">
              <Text color="gray.700" fontSize="sm">
                {formatValue(taxableIncome.month)}
              </Text>
            </Td>
            <Td isNumeric border="none">
              <Text color="gray.700" fontSize="sm" textAlign="left">
                {formatValue(taxableIncome.year)}
              </Text>
            </Td>
          </Tr>

          <Tr>
            <Td border="none">
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Φόρος εισοδήματος
              </Text>
            </Td>
            <Td border="none">
              <Text color="gray.700" fontSize="sm">
                {formatValue(
                  grossIncome.month > finalTax.month && finalTax.month > 0
                    ? finalTax.month
                    : null,
                )}
              </Text>
            </Td>
            <Td isNumeric border="none">
              <Text color="gray.700" fontSize="sm" textAlign="left">
                {formatValue(
                  grossIncome.year > finalTax.year && finalTax.year > 0
                    ? finalTax.year
                    : null,
                )}
              </Text>
            </Td>
          </Tr>

          <Tr>
            <Td border="none">
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Μείωση φόρου
              </Text>
            </Td>
            <Td border="none">
              <Text color="gray.700" fontSize="sm">
                {formatValue(childrenDiscountAmount.month)}
              </Text>
            </Td>
            <Td isNumeric border="none">
              <Text color="gray.700" fontSize="sm" textAlign="left">
                {formatValue(childrenDiscountAmount.year)}
              </Text>
            </Td>
          </Tr>

          <Tr>
            <Td border="none">
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Εργοδοτικές εισφορές
              </Text>
            </Td>
            <Td border="none">
              <Text color="gray.700" fontSize="sm">
                {formatValue(employerObligations.month)}
              </Text>
            </Td>
            <Td isNumeric border="none">
              <Text color="gray.700" fontSize="sm" textAlign="left">
                {formatValue(employerObligations.year)}
              </Text>
            </Td>
          </Tr>
          <Tr background="purple.50">
            <Td border="none">
              <Text color="purple.800" fontWeight="700" fontSize="sm">
                Συνολικό εργοδοτικό κόστος
              </Text>
            </Td>
            <Td border="none">
              <Text color="purple.800" fontWeight="600" fontSize="sm">
                {formatValue(totalEmployerCost.month)}
              </Text>
            </Td>
            <Td isNumeric border="none">
              <Text
                color="purple.800"
                fontWeight="600"
                fontSize="sm"
                textAlign="left"
              >
                {formatValue(totalEmployerCost.year)}
              </Text>
            </Td>
          </Tr>
          <Tr background="purple.50">
            <Td border="none">
              <Flex align="center" gap={1}>
                <Text color="purple.800" fontWeight="700" fontSize="sm">
                  Φορολογική επιβάρυνση
                </Text>
                <TaxWedgeInfoPopover />
              </Flex>
            </Td>
            <Td border="none">
              <Flex align="baseline" gap={1} color="purple.800" fontWeight="600">
                <Text fontSize="sm">{formatValue(taxWedge.month)}</Text>
                <Text fontSize="xs">
                  (
                  {formatCellPercentage(
                    taxWedgePercentage.month,
                    totalEmployerCost.month > 0,
                  )}
                  )
                </Text>
              </Flex>
            </Td>
            <Td isNumeric border="none">
              <Flex align="baseline" gap={1} color="purple.800" fontWeight="600">
                <Text fontSize="sm">{formatValue(taxWedge.year)}</Text>
                <Text fontSize="xs">
                  (
                  {formatCellPercentage(
                    taxWedgePercentage.year,
                    totalEmployerCost.year > 0,
                  )}
                  )
                </Text>
              </Flex>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default EmployeeTable;
