import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import { finalIncome } from "utils";
import { useStore } from "store";
import { TableCell } from "./IncomeTableCell";

const IncomeTable = () => {
  const details = useStore((state) => state.userDetails);

  const PRE_PAID_TAX = 0.2;
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

  const grossIncomePerMonth = grossIncome / 12;
  const grossIncomePerYear = (grossIncome / 12) * taxYearDuration;
  const grossIncomeAfterTaxPerMonth = grossIncomeAfterTax / 12;
  const grossIncomeAfterTaxPerYear =
    (grossIncomeAfterTax / 12) * taxYearDuration;

  const grossIncomeAfterTaxPerMonthResult = prePaidTax
    ? grossIncomeAfterTaxPerMonth - grossIncomePerMonth * PRE_PAID_TAX
    : grossIncomeAfterTaxPerMonth;

  const grossIncomeAfterTaxPerYearResult = prePaidTax
    ? grossIncomeAfterTax - grossIncome * PRE_PAID_TAX
    : grossIncomeAfterTax;

  const taxInAdvance =
    grossIncomeAfterTax * 0.55 * (prePaidTaxDiscount ? 0.5 : 1);

  const amount = {
    grossIncome: {
      month: grossIncomePerMonth,
      year: grossIncomePerYear,
    },
    grossIncomeAfterTax: {
      month: grossIncomeAfterTaxPerMonth,
      year: grossIncomeAfterTaxPerYear,
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

  const prePaidTaxAmount = prePaidTax ? grossIncomePerMonth * PRE_PAID_TAX : 0;

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
          <TableCell
            text="Μικτός μισθός"
            perMonth={grossIncomePerMonth}
            perYear={grossIncomePerYear}
          />

          {!!grossIncomeAfterBusinessExpenses && (
            <TableCell
              text="Έξοδα Επιχείρησης"
              perMonth="--"
              perYear={grossIncomeAfterBusinessExpenses}
            />
          )}

          <TableCell
            text={
              <p>
                Φόρος <br /> (9%, 22%, 28%, 36% και 44%)
              </p>
            }
            perMonth={grossIncomeAfterTaxPerMonthResult}
            perYear={grossIncomeAfterTaxPerYearResult}
          />

          {!!prePaidTaxAmount && (
            <TableCell
              text="Παρακράτηση Φόρου(-20%)"
              perMonth={prePaidTaxAmount}
              perYear={prePaidTaxAmount * taxYearDuration}
            />
          )}

          {prePaidNextYearTax && (
            <TableCell
              text={`Προκαταβολή φόρου
                ${prePaidTaxDiscount ? "(με έκπτωση)" : ""}`}
              perMonth={
                (grossIncomeAfterTax * 0.55 * (prePaidTaxDiscount ? 0.5 : 1)) /
                12
              }
              perYear={taxInAdvance}
            />
          )}

          {!!accountantFees && (
            <TableCell
              text="Αμοιβή Λογιστή"
              perMonth={accountantFees}
              perYear={accountantFees * 12}
            />
          )}

          {!!businessObligations && (
            <TableCell
              text="Κοινωνική Ασφάλιση(ΕΦΚΑ)"
              perMonth={businessObligations}
              perYear={businessObligations * 12}
            />
          )}

          {!!additionalBusinessObligations && (
            <TableCell
              text="Επιπρόσθετος Ποσό"
              perMonth={additionalBusinessObligations / 12}
              perYear={additionalBusinessObligations}
            />
          )}

          {!!savings && (
            <TableCell
              text={<strong>Αποταμίευση</strong>}
              perMonth={savings < grossIncome ? savings : "------"}
              perYear={savings < grossIncome ? savings * 12 : "------"}
              color="green.500"
            />
          )}

          {!!grossIncome && (
            <TableCell
              text={<strong>Καθαρό εισόδημα</strong>}
              perMonth={finalIncome(amount, "month")}
              perYear={finalIncome(amount, "year")}
              color="purple.500"
            />
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default IncomeTable;
