import {
  Box,
  Text,
  Grid,
  GridItem,
  FormControl,
  NumberInput,
  NumberInputField,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { useStore } from "store";
import { QuestionIcon } from "@chakra-ui/icons";
import FormElements from "../../components/input";
import { useRef } from "react";

const BussinessNegotiateWidget = () => {
  const inputRef = useRef(null);
  const userDetails = useStore((state) => state.userDetails.business.quickCalc);
  const { currentWithholdingTax, currentAdditionalValueTax } = userDetails;

  const updateBusinessQuickCalc = useStore(
    (state) => state.updateBusinessQuickCalc
  );

  const onChangeGrossIncome = (value) => {
    updateBusinessQuickCalc({
      grossIncomeYearly: parseInt(value),
    });
  };

  const onSelectAdditionalValueTax = (value) => {
    updateBusinessQuickCalc({
      currentAdditionalValueTax: parseInt(value),
    });
  };

  const onSelectWithholdingTax = (value) => {
    updateBusinessQuickCalc({
      currentWithholdingTax: parseInt(value),
    });
  };

  const monthlyValue = userDetails.grossIncomeYearly / 12 || 0;
  const monthly = monthlyValue.toFixed(2);
  const monthlyTax = (monthlyValue * currentAdditionalValueTax).toFixed(2);
  const monthlyWithholding = (monthlyValue * currentWithholdingTax).toFixed(2);

  const askFor = (Number(monthly) + Number(monthlyTax)).toFixed(2);
  const grossAsReadIncome = (
    Number(monthly) - Number(monthlyWithholding)
  ).toFixed(2);

  return (
    <Popover initialFocusRef={inputRef} placement="top-start" closeOnBlur>
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
        <PopoverHeader>
          Υπολόγισε γρήγορα τι πρέπει να ζητήσεις όταν διαπραγματεύεσαι
        </PopoverHeader>
        <PopoverBody>
          <Grid gridTemplateColumns={["1fr 1fr", "2fr 1fr 1fr"]} gap="0 16px">
            <GridItem gridColumn={["1 / -1"]} gridRow={1}>
              <Text fontWeight="500" color="gray.700" mt={4}>
                Ετήσιο μικτό εισόδημα
              </Text>
              <FormControl>
                <NumberInput
                  autoFocus
                  ref={inputRef}
                  mt={2}
                  onChange={(value) => onChangeGrossIncome(value)}
                  value={userDetails.grossIncomeYearly || 0}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </GridItem>
            <GridItem mt={4} gridRow={[2, 1]}>
              <FormElements.Select
                label="ΦΠΑ"
                onChange={onSelectAdditionalValueTax}
                options={[{ value: 0.24, text: "24%" }]}
              />
            </GridItem>
            <GridItem mt={4} gridRow={[2, 1]}>
              <FormElements.Select
                label="Παρακρατηση"
                onChange={onSelectWithholdingTax}
                options={[{ value: 0.2, text: "20%" }]}
              />
            </GridItem>
          </Grid>

          <Box mt={3} p={2} fontSize={["14px", "16px"]}>
            <UnorderedList>
              <ListItem>
                Μικτό μηνιαίο: <strong>{monthly}</strong>
              </ListItem>
              <ListItem>
                ΦΠΑ: <strong>{monthlyTax}</strong>
              </ListItem>
              <ListItem>
                Παρακράτηση: <strong>{monthlyWithholding}</strong>
              </ListItem>
            </UnorderedList>
            <Text mt={2}>
              Ζητάς <strong>{askFor}</strong> και παίρνεις μικτό{" "}
              <strong>{grossAsReadIncome}</strong> το μηνα
            </Text>
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default BussinessNegotiateWidget;
