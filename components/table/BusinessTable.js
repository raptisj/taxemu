import {
  Tr,
  Th,
  Td,
  Text,
  Table,
  Thead,
  Tbody,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import { useStore } from "store";
import { formatCellValue } from "utils";

const BusinessTable = () => {
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
    <TableContainer mt={6}>
      <Table variant="simple">
        <TableCaption color="gray.500" textAlign="left">
          Οι υπολογισμοί είναι κατά προσέγγιση και δεν αποτελούν λογιστικη
          συμβουλή*
        </TableCaption>
        <Thead>
          <Tr>
            <Th></Th>
            <Th>ΑΝΑ ΜΗΝΑ</Th>
            <Th>ΑΝΑ ΕΤΟΣ</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr background="purple.400">
            <Td>
              <Text color="white" fontWeight="700" fontSize="sm">
                Καθαρό Εισόδημα
              </Text>
            </Td>
            <Td>
              <Text color="white" fontWeight="600" fontSize="sm">
                {formatCellValue(finalIncome.month, !!finalIncome.year)}
              </Text>
            </Td>
            <Td isNumeric>
              <Text color="white" fontWeight="600" fontSize="sm">
                {formatCellValue(finalIncome.year, !!finalIncome.year)}
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Μικτό Εισόδημα
              </Text>
            </Td>
            <Td>
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(grossIncomeMonthly, !!finalIncome.year)}
              </Text>
            </Td>
            <Td isNumeric>
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(
                  (grossIncomeYearly / 12) * taxYearDuration,
                  !!finalIncome.year
                )}
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Πρόσθετα έξοδα
              </Text>
            </Td>
            <Td>
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(
                  extraBusinessExpenses / taxYearDuration,
                  !!finalIncome.year
                )}
              </Text>
            </Td>
            <Td isNumeric>
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(extraBusinessExpenses, !!finalIncome.year)}
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Ασφάλιση
              </Text>
            </Td>
            <Td>
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(insurance.month, !!finalIncome.year)}
              </Text>
            </Td>
            <Td isNumeric>
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(insurance.year, !!finalIncome.year)}
              </Text>
            </Td>
          </Tr>

          {discountOptions.prePaidNextYearTax && (
            <Tr>
              <Td>
                <Text color="gray.700" fontWeight="500" fontSize="sm">
                  Προκαταβολή φόρου
                </Text>
              </Td>
              <Td>
                <Text color="gray.700" fontSize="sm">
                  {formatCellValue(
                    taxInAdvance.month > 0 ? taxInAdvance.month : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Td>
              <Td isNumeric>
                <Text color="gray.700" fontSize="sm">
                  {formatCellValue(
                    taxInAdvance.year > 0 ? taxInAdvance.year : null,
                    !!finalIncome.yea
                  )}
                </Text>
              </Td>
            </Tr>
          )}
          <Tr>
            <Td>
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Φορός
              </Text>
            </Td>
            <Td>
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(totalTax.month, !!finalIncome.year)}
              </Text>
            </Td>
            <Td isNumeric>
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(totalTax.year, !!finalIncome.year)}
              </Text>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default BusinessTable;
