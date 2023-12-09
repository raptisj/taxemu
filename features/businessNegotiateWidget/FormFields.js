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

const FormFields = ({ ref }) => {
  const userDetails = useStore((state) => state.userDetails.business.quickCalc);
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

  return (
    <Grid gridTemplateColumns={["1fr 1fr", "2fr 1fr 1fr"]} gap="0 16px">
      <GridItem gridColumn={["1 / -1"]} gridRow={1}>
        <Text fontWeight="500" color="gray.700" mt={4}>
          Ετήσιο μικτό εισόδημα
        </Text>
        <FormControl>
          <NumberInput
            autoFocus
            ref={ref}
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
  );
};

export { FormFields };
