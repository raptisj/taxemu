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
    discountOptions,
    prePaidNextYearTax,
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
    <TableContainer mt={6} background="#ffffff70">
      <Table variant="simple">
        <TableCaption color="gray.500" textAlign="left">
          Οι υπολογισμοί είναι κατά προσέγγιση και δεν αποτελούν λογιστική
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
                Καθαρό εισόδημα
              </Text>
            </Td>
            <Td borderBottomWidth={1} borderColor="gray.500">
              <Text fontWeight="600" fontSize="sm">
                {formatCellValue(finalIncome.month, !!finalIncome.year)}
              </Text>
            </Td>
            <Td isNumeric borderBottomWidth={1} borderColor="gray.500">
              <Text fontWeight="600" fontSize="sm" textAlign="left">
                {formatCellValue(finalIncome.year, !!finalIncome.year)}
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td border="none">
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Μικτό εισόδημα
              </Text>
            </Td>
            <Td border="none">
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(grossIncome.month, !!finalIncome.year)}
              </Text>
            </Td>
            <Td isNumeric border="none">
              <Text color="gray.700" fontSize="sm" textAlign="left">
                {formatCellValue(grossIncome.year, !!finalIncome.year)}
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td border="none">
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Πρόσθετα έξοδα
              </Text>
            </Td>
            <Td border="none">
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(businessExpenses.month, !!finalIncome.year)}
              </Text>
            </Td>
            <Td isNumeric border="none">
              <Text color="gray.700" fontSize="sm" textAlign="left">
                {formatCellValue(businessExpenses.year, !!finalIncome.year)}
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td border="none">
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Ασφάλιση
              </Text>
            </Td>
            <Td border="none">
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(insurance.month, !!finalIncome.year)}
              </Text>
            </Td>
            <Td isNumeric border="none">
              <Text color="gray.700" fontSize="sm" textAlign="left">
                {formatCellValue(insurance.year, !!finalIncome.year)}
              </Text>
            </Td>
          </Tr>

          {prePaidNextYearTax && (
            <Tr>
              <Td border="none">
                <Text color="gray.700" fontWeight="500" fontSize="sm">
                  Προκαταβολή φόρου{" "}
                  {discountOptions.prePaidTaxDiscount ? "(με έκπτωση)" : ""}
                </Text>
              </Td>
              <Td border="none">
                <Text color="gray.700" fontSize="sm">
                  {formatCellValue(
                    taxInAdvance.month > 0 ? taxInAdvance.month : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Td>
              <Td isNumeric border="none">
                <Text color="gray.700" fontSize="sm" textAlign="left">
                  {formatCellValue(
                    taxInAdvance.year > 0 ? taxInAdvance.year : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Td>
            </Tr>
          )}

          {!!previousYearTaxInAdvance.year && (
            <Tr>
              <Td border="none">
                <Text color="gray.700" fontWeight="500" fontSize="sm">
                  Περσινή προκαταβολή φόρου
                </Text>
              </Td>
              <Td border="none">
                <Text color="gray.700" fontSize="sm">
                  {formatCellValue(
                    previousYearTaxInAdvance.month > 0
                      ? previousYearTaxInAdvance.month
                      : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Td>
              <Td isNumeric border="none">
                <Text color="gray.700" fontSize="sm" textAlign="left">
                  {formatCellValue(
                    previousYearTaxInAdvance.year > 0
                      ? previousYearTaxInAdvance.year
                      : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Td>
            </Tr>
          )}

          {withholdingTax && (
            <Tr>
              <Td border="none">
                <Text color="gray.700" fontWeight="500" fontSize="sm">
                  Παρακράτηση φόρου(-20%)
                </Text>
              </Td>
              <Td border="none">
                <Text color="gray.700" fontSize="sm">
                  {formatCellValue(
                    withholdingTaxAmount.month > 0
                      ? withholdingTaxAmount.month
                      : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Td>
              <Td isNumeric border="none">
                <Text color="gray.700" fontSize="sm" textAlign="left">
                  {formatCellValue(
                    withholdingTaxAmount.year > 0
                      ? withholdingTaxAmount.year
                      : null,
                    !!finalIncome.year
                  )}
                </Text>
              </Td>
            </Tr>
          )}

          <Tr>
            <Td border="none">
              <Text color="gray.700" fontWeight="500" fontSize="sm">
                Φορός
              </Text>
            </Td>
            <Td border="none">
              <Text color="gray.700" fontSize="sm">
                {formatCellValue(finalTax.month, !!finalIncome.year)}
              </Text>
            </Td>
            <Td isNumeric border="none">
              <Text color="gray.700" fontSize="sm" textAlign="left">
                {formatCellValue(finalTax.year, !!finalIncome.year)}
              </Text>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default BusinessTable;
