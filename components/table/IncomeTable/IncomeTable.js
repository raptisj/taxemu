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

  const WITHHOLDING_TAX_PERCENTAGE = 0.2;
  const PRE_PAID_TAX_DISCOUNT = 0.5;
  const PRE_PAID_TAX_PERCENTAGE = 0.55;

  const {
    grossIncome,
    taxYearDuration,
    totalTax,
    totalBusinessExpenses,
    extraBusinessExpenses,
    discountOptions: { prePaidNextYearTax, prePaidTaxDiscount },
    withholdingTax,
    previousYearTaxInAdvance,
  } = details;

  const grossIncomePerMonth = grossIncome / 12;
  const grossIncomePerYear = (grossIncome / 12) * taxYearDuration;

  const calcTotalTax = (taxAmount, grossIncome, previousYearTaxInAdvance) => {
    const prePaidTaxCalculation =
      taxAmount - grossIncome * WITHHOLDING_TAX_PERCENTAGE;
    return (
      (withholdingTax ? prePaidTaxCalculation : taxAmount) -
      previousYearTaxInAdvance
    );
  };

  const totalTaxPerYearResult = calcTotalTax(
    totalTax,
    grossIncomePerYear,
    previousYearTaxInAdvance
  );

  const taxInAdvance =
    totalTax *
    PRE_PAID_TAX_PERCENTAGE *
    (prePaidTaxDiscount ? PRE_PAID_TAX_DISCOUNT : 1);

  const amount = {
    grossIncome: {
      month: grossIncomePerMonth,
      year: grossIncomePerYear,
    },
    totalTax: {
      month: totalTax / taxYearDuration,
      year: totalTax,
    },
    prePaidNextYearTax: {
      month: (prePaidNextYearTax ? taxInAdvance : 0) / taxYearDuration,
      year: prePaidNextYearTax ? taxInAdvance : 0,
    },
    totalBusinessExpenses: {
      month: totalBusinessExpenses / taxYearDuration,
      year: totalBusinessExpenses,
    },
    // extraBusinessExpenses: {
    //   month: extraBusinessExpenses / 12,
    //   year: extraBusinessExpenses,
    // },
  };

  const prePaidTaxAmount = withholdingTax
    ? grossIncomePerMonth * WITHHOLDING_TAX_PERCENTAGE
    : 0;

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
              dataTestId="grossIncome"
            />

            {!!totalBusinessExpenses && (
              <TableCell
                text="Έξοδα Επιχείρησης"
                perMonth={totalBusinessExpenses / taxYearDuration}
                perYear={totalBusinessExpenses}
                dataTestId="totalBusinessExpenses"
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
              perMonth={totalTaxPerYearResult / taxYearDuration}
              perYear={totalTaxPerYearResult}
              dataTestId="totalTax"
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
                perMonth={taxInAdvance / taxYearDuration}
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

            {!!grossIncome && (
              <TableCell
                text={<strong>Καθαρό εισόδημα</strong>}
                perMonth={finalIncome(amount, "month")}
                perYear={finalIncome(amount, "year")}
                color="purple.500"
                dataTestId="finalIncome"
              />
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <Box width="70%" mx="auto" mt={6}>
        <PieChart
          amount={amount}
          finalIncome={() => finalIncome(amount, "year")}
          totalTaxPerYearResult={totalTaxPerYearResult}
        />
      </Box>
    </Box>
  );
};

export default IncomeTable;
