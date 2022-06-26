import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  PopoverArrow,
  PopoverHeader,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { formatCellValue } from "utils";
import { useStore } from "store";
import { TaxTable } from "../TaxTable/TaxTable";

const TaxAnalysisIcon = () => {
  const details = useStore((state) => state.userDetails);

  const { taxableIncome } = details;

  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <InfoIcon marginLeft={1} color="gray.500" />
      </PopoverTrigger>
      <PopoverContent width={"max"}>
        <PopoverArrow />
        <PopoverHeader>
          <p>
            Φορολογητέο Εισόδημα:{" "}
            {typeof taxableIncome === "number"
              ? formatCellValue?.(taxableIncome)
              : "--"}
          </p>
        </PopoverHeader>
        <PopoverBody>
          <TaxTable />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default TaxAnalysisIcon;
