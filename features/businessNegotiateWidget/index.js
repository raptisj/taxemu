import {
  Box,
  Button,
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
  const calculateRealGross = useStore(
    (state) => state.userDetails.business.calculateRealGrossWidget,
  );

  const monthlyValue = calculateRealGross.grossIncomeMonthly || 0;

  return (
    <Popover
      initialFocusRef={inputRef}
      placement="top-start"
      closeOnBlur={true}
    >
      <PopoverTrigger>
        <Button
          variant="link"
          color="purple.500"
          fontWeight={500}
          fontSize=".9rem"
          rightIcon={<QuestionIcon />}
        >
          Τι ποσό θα γράψω στο τιμολόγιο;
        </Button>
      </PopoverTrigger>
      <PopoverContent
        width="calc(100vw - 32px)"
        maxW="500px"
        maxH="calc(100vh - 32px)"
        overflowY="auto"
        boxShadow="0px 0px 24px -18px"
      >
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontWeight={600}>
          Προεπισκόπηση μηνιαίου τιμολογίου
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
