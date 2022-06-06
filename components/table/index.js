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
  } = details;

  const finalMonthlyIncome =
    grossIncome / 12 -
    grossIncomeAfterTax / 12 -
    accountantFees -
    businessObligations -
    additionalBusinessObligations / 12 -
    savings;

  const finalYearlyIncome =
    grossIncome -
    grossIncomeAfterTax -
    accountantFees * 12 -
    businessObligations * 12 -
    additionalBusinessObligations -
    savings * 12;

  return (
    <TableContainer>
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
            <Td isNumeric>
              {grossIncome
                ? "€" + (grossIncome / 12).toFixed(2).toLocaleString("en-US")
                : "xxxxxx"}
            </Td>
            <Td isNumeric>
              {grossIncome
                ? "€" +
                  ((grossIncome / 12) * taxYearDuration).toLocaleString("en-US")
                : "xxxxxx"}
            </Td>
          </Tr>
          <Tr>
            <Td>
              Μικτός μισθός με κρατήσεις
              <br />
              (9%, 22%, 28%, 36% και 44%)
            </Td>
            <Td isNumeric>
              {grossIncome && grossIncomeAfterTax
                ? "€" + (grossIncomeAfterTax / 12).toFixed(2).toLocaleString("en-US")
                : "xxxxxx"}
            </Td>
            <Td isNumeric>
              {grossIncome && grossIncomeAfterTax
                ? "€" + grossIncomeAfterTax.toLocaleString("en-US")
                : "xxxxxx"}
            </Td>
          </Tr>

          {!!accountantFees && (
            <Tr>
              <Td>Αμοιβή Λογιστή</Td>
              <Td isNumeric>{"€" + accountantFees || "xxxxxx"}</Td>
              <Td isNumeric>{"€" + accountantFees * 12 || "xxxxxx"}</Td>
            </Tr>
          )}

          {!!businessObligations && (
            <Tr>
              <Td>Κοινωνική Ασφάλιση(ΕΦΚΑ)</Td>
              <Td isNumeric>{"€" + businessObligations || "xxxxxx"}</Td>
              <Td isNumeric>{"€" + businessObligations * 12 || "xxxxxx"}</Td>
            </Tr>
          )}

          {!!additionalBusinessObligations && (
            <Tr>
              <Td>Επιπρόσθετος Ποσό</Td>
              <Td isNumeric>
                {"€" + (additionalBusinessObligations / 12).toFixed(2) || "xxxxxx"}
              </Td>
              <Td isNumeric>{"€" + additionalBusinessObligations || "xxxxxx"}</Td>
            </Tr>
          )}

          {!!savings && (
            <Tr>
              <Td>
                <strong>Αποταμίευση</strong>
              </Td>
              <Td isNumeric>
                <Text color="green.500">
                  {savings < grossIncome ? "€" + savings.toFixed(2).toLocaleString("en-US") : "xxxxxx"}
                </Text>
              </Td>
              <Td isNumeric>
                <Text color="green.500">
                  {savings < grossIncome ? "€" + (savings * 12).toLocaleString("en-US") : "xxxxxx"}
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
                <Text color="red.500">
                  {finalMonthlyIncome > 0
                    ? "€" + finalMonthlyIncome.toFixed(2).toLocaleString("en-US")
                    : "xxxxxx"}
                </Text>
              </Td>
              <Td isNumeric>
                <Text color="red.500">
                  {finalYearlyIncome > 0
                    ? "€" + finalYearlyIncome.toLocaleString("en-US")
                    : "xxxxxx"}
                </Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default IncomeTable;
