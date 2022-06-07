import {
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import { useStore } from "../../store";

const IncomeTable = () => {
  const details = useStore((state) => state.userDetails);

  const {
    grossIncome,
    grossIncomeAfterTax,
    accountantFees,
    businessObligations,
    additionalBusinessObligations,
    savings,
    taxYearDuration,
    grossIncomeAfterBusinessExpenses,
    discountOptions: { prePaidNextYearTax, prePaidTaxDiscount },
    prePaidTax,
  } = details;

  const taxInAdvance =
    grossIncomeAfterTax * 0.55 * (prePaidTaxDiscount ? 0.5 : 1);

  const amount = {
    grossIncome: {
      month: grossIncome / 12,
      year: (grossIncome / 12) * taxYearDuration,
    },
    grossIncomeAfterTax: {
      month: grossIncomeAfterTax / 12,
      year: (grossIncomeAfterTax / 12) * taxYearDuration,
    },
    accountantFees: {
      month: accountantFees,
      year: accountantFees * 12,
    },
    businessObligations: {
      month: businessObligations,
      year: businessObligations * 12,
    },
    additionalBusinessObligations: {
      month: additionalBusinessObligations / 12,
      year: additionalBusinessObligations,
    },
    savings: {
      month: savings,
      year: savings * 12,
    },
    prePaidNextYearTax: {
      month: (prePaidNextYearTax ? taxInAdvance : 0) / 12,
      year: prePaidNextYearTax ? taxInAdvance : 0,
    },
  };

  const prePaidTaxAmount = prePaidTax ? (grossIncome / 12) * 0.2 : 0;

  const calcFinal = (obj, type) => {
    return Object.keys(obj)
      .map((p) => obj[p][type])
      .reduce((pre, cur) => (cur = pre - cur));
  };

  const formatCellValue = (val) =>
    val ? `€${val.toLocaleString("en-US").split(".")[0]}` : "xxxxxx";

  const finalIncome = (amount, type) =>
    calcFinal(amount, type) > 0
      ? formatCellValue(calcFinal(amount, type))
      : "xxxxxx";

  return (
    <TableContainer position="sticky" top={8}>
      <Table variant="simple">
        <TableCaption>*τα ποσά είναι κατα προσέγγιση</TableCaption>
        <Thead>
          <Tr>
            <Th></Th>
            <Th isNumeric>Ανα μηνα</Th>
            <Th isNumeric>Ανα ετος</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Μικτός μισθός</Td>
            <Td isNumeric>{formatCellValue(grossIncome / 12)}</Td>
            <Td isNumeric>
              {formatCellValue((grossIncome / 12) * taxYearDuration)}
            </Td>
          </Tr>

          {!!grossIncomeAfterBusinessExpenses && (
            <Tr>
              <Td>Έξοδα Επιχείρησης</Td>
              <Td isNumeric> -- </Td>
              <Td isNumeric>
                {formatCellValue(grossIncomeAfterBusinessExpenses)}
              </Td>
            </Tr>
          )}

          <Tr>
            <Td>
              Φόρος
              <br />
              (9%, 22%, 28%, 36% και 44%)
            </Td>
            <Td isNumeric>
              {formatCellValue(
                prePaidTax
                  ? grossIncomeAfterTax / 12 - (grossIncome / 12) * 0.2
                  : grossIncomeAfterTax / 12
              )}
            </Td>
            <Td isNumeric>
              {formatCellValue(
                prePaidTax
                  ? grossIncomeAfterTax - grossIncome * 0.2
                  : grossIncomeAfterTax
              )}
            </Td>
          </Tr>

          {!!prePaidTaxAmount && (
            <Tr>
              <Td>Παρακράτηση Φόρου(-20%)</Td>
              <Td isNumeric> {formatCellValue(prePaidTaxAmount)} </Td>
              <Td isNumeric>
                {formatCellValue(prePaidTaxAmount * taxYearDuration)}
              </Td>
            </Tr>
          )}

          {prePaidNextYearTax && (
            <Tr>
              <Td>
                Προκαταβολή φόρου
                {prePaidTaxDiscount ? "(με έκπτωση)" : ""}
              </Td>
              <Td isNumeric>
                {formatCellValue(
                  (grossIncomeAfterTax *
                    0.55 *
                    (prePaidTaxDiscount ? 0.5 : 1)) /
                    12
                )}
              </Td>
              <Td isNumeric>{formatCellValue(taxInAdvance)}</Td>
            </Tr>
          )}

          {!!accountantFees && (
            <Tr>
              <Td>Αμοιβή Λογιστή</Td>
              <Td isNumeric>{formatCellValue(accountantFees)}</Td>
              <Td isNumeric>{formatCellValue(accountantFees * 12)}</Td>
            </Tr>
          )}

          {!!businessObligations && (
            <Tr>
              <Td>Κοινωνική Ασφάλιση(ΕΦΚΑ)</Td>
              <Td isNumeric>{formatCellValue(businessObligations)}</Td>
              <Td isNumeric>{formatCellValue(businessObligations * 12)}</Td>
            </Tr>
          )}

          {!!additionalBusinessObligations && (
            <Tr>
              <Td>Επιπρόσθετος Ποσό</Td>
              <Td isNumeric>
                {formatCellValue(additionalBusinessObligations / 12)}
              </Td>
              <Td isNumeric>
                {formatCellValue(additionalBusinessObligations)}
              </Td>
            </Tr>
          )}

          {!!savings && (
            <Tr>
              <Td>
                <strong>Αποταμίευση</strong>
              </Td>
              <Td isNumeric>
                <Text color="green.500">
                  {savings < grossIncome ? formatCellValue(savings) : "xxxxxx"}
                </Text>
              </Td>
              <Td isNumeric>
                <Text color="green.500">
                  {savings < grossIncome
                    ? formatCellValue(savings * 12)
                    : "xxxxxx"}
                </Text>
              </Td>
            </Tr>
          )}

          {!!grossIncome && (
            <Tr>
              <Td>
                <strong>Καθαρό εισόδημα</strong>
              </Td>
              <Td isNumeric>
                <Text color="purple.500">{finalIncome(amount, "month")}</Text>
              </Td>
              <Td isNumeric>
                <Text color="purple.500">{finalIncome(amount, "year")}</Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default IncomeTable;
