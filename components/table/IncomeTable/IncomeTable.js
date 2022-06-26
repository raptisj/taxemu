import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableCaption,
  TableContainer,
  Box,
} from "@chakra-ui/react";
import { finalIncome } from "utils";
import { useStore } from "store";
import { TableCell } from "./IncomeTableCell";
import TaxAnalysisIcon from "./TaxAnalysisIcon";
import PieChart from "components/charts";

const IncomeTable = () => {
  const details = useStore((state) => state.userDetails);

  const PRE_PAID_TAX = 0.2;
  const {
    grossIncome,
    totalTax,
    accountantFees,
    healthInsuranceFees,
    extraBusinessExpenses,
    totalBusinessExpenses,
    savings,
    taxYearDuration,
    discountOptions: { prePaidNextYearTax, prePaidTaxDiscount },
    prePaidTax,
    previousYearTaxInAdvance,
  } = details;

  const grossIncomePerMonth = grossIncome / 12;
  const grossIncomePerYear = (grossIncome / 12) * taxYearDuration;
  const totalTaxPerMonth = totalTax / 12;
  const totalTaxPerYear = (totalTax / 12) * taxYearDuration;

  const calcTotalTax = (taxAmount, grossIncome, previousYearTaxInAdvance) => {
    const prePaidTaxCalculation = taxAmount - grossIncome * PRE_PAID_TAX;
    return (
      (prePaidTax ? prePaidTaxCalculation : taxAmount) -
      previousYearTaxInAdvance
    );
  };

  const totalTaxPerMonthResult = calcTotalTax(
    totalTaxPerMonth,
    grossIncomePerMonth,
    previousYearTaxInAdvance / taxYearDuration
  );

  const totalTaxPerYearResult = calcTotalTax(
    totalTax,
    grossIncomePerYear,
    previousYearTaxInAdvance
  );

  const taxInAdvance = totalTax * 0.55 * (prePaidTaxDiscount ? 0.5 : 1);

  const amount = {
    grossIncome: {
      month: grossIncomePerMonth,
      year: grossIncomePerYear,
    },
    totalTax: {
      month: totalTaxPerMonth,
      year: totalTaxPerYear,
    },
    accountantFees: {
      month: accountantFees,
      year: accountantFees * 12,
    },
    healthInsuranceFees: {
      month: healthInsuranceFees,
      year: healthInsuranceFees * 12,
    },
    extraBusinessExpenses: {
      month: extraBusinessExpenses / 12,
      year: extraBusinessExpenses,
    },
    savings: {
      month: savings,
      year: savings * 12,
    },
    prePaidNextYearTax: {
      month: (prePaidNextYearTax ? taxInAdvance : 0) / 12,
      year: prePaidNextYearTax ? taxInAdvance : 0,
    },
    totalBusinessExpenses: {
      month: 0,
      year: totalBusinessExpenses,
    },
  };

  const prePaidTaxAmount = prePaidTax ? grossIncomePerMonth * PRE_PAID_TAX : 0;

  return (
    <Box position="sticky" top={8}>
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
            <TableCell
              text="Μικτός μισθός"
              perMonth={grossIncomePerMonth}
              perYear={grossIncomePerYear}
            />

            {!!totalBusinessExpenses && (
              <TableCell
                text="Έξοδα Επιχείρησης"
                perMonth="--"
                perYear={totalBusinessExpenses}
              />
            )}

            {!!accountantFees && (
              <TableCell
                text="Αμοιβή Λογιστή"
                perMonth={accountantFees}
                perYear={accountantFees * 12}
              />
            )}

            {!!healthInsuranceFees && (
              <TableCell
                text="Κοινωνική Ασφάλιση(ΕΦΚΑ)"
                perMonth={healthInsuranceFees}
                perYear={healthInsuranceFees * 12}
              />
            )}

            {!!extraBusinessExpenses && (
              <TableCell
                text="Πρόσθετα έξοδα"
                perMonth={extraBusinessExpenses / 12}
                perYear={extraBusinessExpenses}
              />
            )}

            <TableCell
              text={
                <div>
                  Φόρος <TaxAnalysisIcon />
                </div>
              }
              perMonth={totalTaxPerMonthResult}
              perYear={totalTaxPerYearResult}
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
                  (totalTax * 0.55 * (prePaidTaxDiscount ? 0.5 : 1)) / 12
                }
                perYear={taxInAdvance}
              />
            )}

            {!!previousYearTaxInAdvance && (
              <TableCell
                text="Περσινή Προκαταβολή φόρου"
                perMonth={previousYearTaxInAdvance / taxYearDuration}
                perYear={previousYearTaxInAdvance}
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

      <Box width="70%" mx="auto" mt={6}>
        <PieChart
          amount={amount}
          finalIncome={() => finalIncome(amount, "year")}
        />
      </Box>
    </Box>
  );
};

export default IncomeTable;
