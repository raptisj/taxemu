import {
  Text,
  Grid,
  GridItem,
  FormControl,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { useStore } from "store";
import FormElements from "components/input";
import { getBusinessRules } from "../../rules";

const FormFields = () => {
  const calculateRealGross = useStore((state) => state.userDetails.business.calculateRealGrossWidget);
  const updateBusinessQuickCalc = useStore(
    (state) => state.updateBusinessQuickCalc
  );
  const taxationYear = useStore(
    (state) => state.userDetails.business.taxationYear,
  );
  const invoiceRules = getBusinessRules(taxationYear).invoice;

  const onChangeGrossIncome = (value) => {
    updateBusinessQuickCalc({
      grossIncomeYearly: parseInt(value),
    });
  };

  const onSelectAdditionalValueTax = (event) => {
    updateBusinessQuickCalc({
      currentAdditionalValueTax: Number(event.target.value),
    });
  };

  const onSelectWithholdingTax = (event) => {
    updateBusinessQuickCalc({
      currentWithholdingTax: Number(event.target.value),
    });
  };

  return (
    <Grid gridTemplateColumns={["1fr 1fr", "2fr 1fr 1fr"]} gap="0 16px">
      <GridItem gridColumn={["1 / -1"]} gridRow={1}>
        <Text fontWeight="500" color="gray.700" mt={4}>
          Ετήσιο μικτό εισόδημα
        </Text>
        <FormControl>
          <NumberInput
            autoFocus
            mt={2}
            onChange={(value) => onChangeGrossIncome(value)}
            value={calculateRealGross.grossIncomeYearly || 0}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>
      </GridItem>
      <GridItem mt={4} gridRow={[2, 1]}>
        <FormElements.Select
          label="ΦΠΑ"
          onChange={onSelectAdditionalValueTax}
          options={invoiceRules.vatRates.map((rate) => ({
            value: rate,
            text: `${rate * 100}%`,
          }))}
        />
      </GridItem>
      <GridItem mt={4} gridRow={[2, 1]}>
        <FormElements.Select
          label="Παρακρατηση"
          onChange={onSelectWithholdingTax}
          options={invoiceRules.withholdingRates.map((rate) => ({
            value: rate,
            text: `${rate * 100}%`,
          }))}
        />
      </GridItem>
    </Grid>
  );
};

export { FormFields };
