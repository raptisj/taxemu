import { useEffect, useCallback } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
} from "@chakra-ui/react";
import { TableCell } from "./TaxTableCell";
import { formatCellValue } from "utils";
import { useStore } from "store";

const TaxTable = () => {
  const details = useStore((state) => state.userDetails);
  const addDetail = useStore((state) => state.addDetail);

  const { discountOptions, taxableIncome, totalTax, taxScales } = details;

  const SCALE_THRESHOLD = 10000;

  const addTaxScalesWrapper = useCallback((value) => {
    return (
      addDetail({
        value,
        field: "taxScales",
      }),
      [addDetail]
    );
  });

  const handleTaxScales = useCallback(() => {
    let amount = taxableIncome;
    let scales = taxScales.map((scale, index) => {
      if (amount > SCALE_THRESHOLD) {
        if (index < 4) {
          amount -= SCALE_THRESHOLD;
          scale.amount = SCALE_THRESHOLD * scale.multiplier;
          scale.from = SCALE_THRESHOLD * index + 1;
          scale.to = SCALE_THRESHOLD * (index + 1);
        } else {
          // Top tax rate, add all other taxable income to scale.to
          scale.amount = amount * scale.multiplier;
          scale.from = SCALE_THRESHOLD * index + 1;
          scale.to = taxableIncome;
        }
      } else {
        if (index == 0) {
          // Bottom tax rate, apply discount if applicable
          scale.multiplier =
            0.09 * (discountOptions.firstScaleDiscount ? 0.5 : 1);
        }
        scale.amount = amount * scale.multiplier;
        scale.from = SCALE_THRESHOLD * index + 1;
        scale.to = taxableIncome;
        amount = 0;
      }
      return scale;
    });

    return addTaxScalesWrapper(scales);
  }, [
    discountOptions.firstScaleDiscount,
    taxableIncome,
    taxScales,
    addTaxScalesWrapper,
  ]);

  useEffect(() => {
    handleTaxScales();
  }, [taxableIncome, discountOptions]);

  return (
    <Box>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th colSpan={2} isNumeric>
                Κλιμακιο εισοδηματος
              </Th>
              <Th isNumeric>Φορος %</Th>
              <Th isNumeric>Ποσο</Th>
            </Tr>
            <Tr>
              <Th isNumeric>Απο</Th>
              <Th isNumeric>Εως</Th>
            </Tr>
          </Thead>
          <Tbody>
            {taxScales.map((scale, i) => {
              if (scale.amount) {
                return <TableCell scale={scale} key={i}></TableCell>;
              } else return false;
            })}

            <Tr>
              <Td pt={1} pb={1}></Td>
              <Td pt={1} pb={1}></Td>
              <Td isNumeric pt={1} pb={1}>
                <strong>Συνολο</strong>
              </Td>
              <Td isNumeric pt={1} pb={1}>
                <strong>
                  {typeof totalTax === "number"
                    ? formatCellValue?.(totalTax)
                    : "--"}
                </strong>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
export { TaxTable };
