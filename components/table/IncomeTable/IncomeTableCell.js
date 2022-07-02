import { Text, Tr, Td } from "@chakra-ui/react";
import { formatCellValue } from "utils";

const TableCell = ({
  text,
  perMonth,
  perYear,
  isNumeric = true,
  color = "",
  dataTestId = "",
}) => {
  return (
    <Tr>
      <Td>{text}</Td>
      <Td isNumeric={isNumeric}>
        <Text color={color} data-testid={`${dataTestId}_tableCell_month`}>
          {typeof perMonth === "number" && perYear > 0
            ? formatCellValue?.(perMonth)
            : "------"}
        </Text>
      </Td>
      <Td isNumeric={isNumeric}>
        <Text color={color} data-testid={`${dataTestId}_tableCell_year`}>{formatCellValue(perYear)}</Text>
      </Td>
    </Tr>
  );
};

export { TableCell };
