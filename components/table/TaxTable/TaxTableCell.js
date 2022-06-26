import { Tr, Td } from "@chakra-ui/react";
import { formatCellValue } from "utils";

const TableCell = ({ scale }) => {
  return (
    <Tr>
      <Td isNumeric pt={1} pb={1}>
        {typeof scale.from === "number" ? formatCellValue?.(scale.from) : "--"}
      </Td>
      <Td isNumeric pt={1} pb={1}>
        {typeof scale.to === "number" ? formatCellValue?.(scale.to) : "--"}
      </Td>
      {/* Ugly hack to avoid rendering 22.000008%, but also render 4.5% in case of 1st scale discount */}
      <Td isNumeric pt={1} pb={1}>{scale.multiplier < 0.05 ? scale.multiplier * 100 : (scale.multiplier * 100).toFixed(0)} %</Td>
      <Td isNumeric pt={1} pb={1}>
        {typeof scale.amount === "number"
          ? formatCellValue?.(scale.amount)
          : "--"}
      </Td>
    </Tr>
  );
};

export { TableCell };
