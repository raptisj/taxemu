import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Text,
} from "@chakra-ui/react";
import { useStore } from "store";
import { formatCellValue } from "utils";

const EmployeeTable = () => {
  const userDetails = useStore((state) => state.userDetails.employee);

  const {
    finalIncomeMonthly,
    finalIncomeYearly,
    grossIncomeMonthly,
    grossIncomeYearly,
    finalTax,
    tableResults: { grossIncome, finalIncome },
  } = userDetails;

  return (
    <TableContainer mt={6} background='#ffffff70'>
      <Table variant="simple">
        <TableCaption color="gray.500" textAlign="left">
          Οι υπολογισμοί είναι κατά προσέγγιση και δεν αποτελούν λογιστικη
          συμβουλή*
        </TableCaption>
        <Thead>
          <Tr>
            <Th border="none"></Th>
            <Th border="none">ΑΝΑ ΜΗΝΑ</Th>
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
                {formatCellValue(finalIncome.month)}
              </Text>
            </Td>
            <Td isNumeric borderBottomWidth={1} borderColor="gray.500">
              <Text fontWeight="600" fontSize="sm">
                {formatCellValue(finalIncome.year)}
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
                {formatCellValue(grossIncome.month)}
              </Text>
            </Td>
            <Td isNumeric border="none">
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(grossIncome.year)}
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td border="none">
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Φορός
              </Text>
            </Td>
            <Td border="none">
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(
                  grossIncomeMonthly > finalTax.month && finalTax.month > 0
                    ? finalTax.month
                    : null
                )}
              </Text>
            </Td>
            <Td isNumeric border="none">
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(
                  grossIncomeYearly > finalTax.year && finalTax.year > 0
                    ? finalTax.year
                    : null
                )}
              </Text>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default EmployeeTable;
