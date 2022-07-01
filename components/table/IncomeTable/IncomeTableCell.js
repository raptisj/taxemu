import { Text, Tr, Td } from "@chakra-ui/react";
import { formatCellValue } from "utils";

const TableCell = ({
  text,
  perMonth,
  perYear,
  isNumeric = true,
  color = "",
}) => {
  return (
    <Tr>
      <Td>{text}</Td>
      <Td isNumeric={isNumeric}>
        <Text color={color}>
          {typeof perMonth === "number" && perYear > 0 ? formatCellValue?.(perMonth) : "------"}
        </Text>
      </Td>
      <Td isNumeric={isNumeric}>
        <Text color={color}>{formatCellValue(perYear)}</Text>
      </Td>
    </Tr>
  );
};

export { TableCell };
