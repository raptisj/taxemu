import {
  Box,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";
import { useStore } from "store";
import { QuestionIcon } from "@chakra-ui/icons";
import { useRef } from "react";
import { Results } from "./Results";
import { FormFields } from "./FormFields";

const BusinessNegotiateWidget = () => {
  const inputRef = useRef(null);
  const calculateRealGross = useStore((state) => state.userDetails.business.calculateRealGrossWidget);

  const monthlyValue = calculateRealGross.grossIncomeYearly / 12 || 0;

  return (
    <Popover
      initialFocusRef={inputRef}
      placement="top-start"
      closeOnBlur={true}
    >
      <PopoverTrigger>
        <Text
          color="purple.500"
          cursor="pointer"
          fontWeight={500}
          fontSize=".9rem"
        >
          Δουλεύεις για ελληνική εταιρεία?{` `}
          <QuestionIcon />
        </Text>
      </PopoverTrigger>
      <PopoverContent
        maxW="500px"
        minW={["0", "500px"]}
        boxShadow="0px 0px 24px -18px"
      >
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontWeight={600}>
          Υπολόγισε γρήγορα τι πρέπει να ζητήσεις όταν διαπραγματεύεσαι
        </PopoverHeader>
        <PopoverBody>
          <FormFields />

          <Box mt={3} p={2}>
            <Results monthlyValue={monthlyValue} />
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default BusinessNegotiateWidget;
