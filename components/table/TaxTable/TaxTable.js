// import { useEffect, useCallback } from "react";
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

  const { totalTax, taxScales } = details;

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
