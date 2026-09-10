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
import { formatRatePercentage } from "../../utils";

const includeZeroRate = (rates) => [...new Set([...rates, 0])];

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
      grossIncomeMonthly: Number(value) || 0,
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
    <Grid gridTemplateColumns="1fr 1fr" gap="0 16px">
      <GridItem gridColumn="1 / -1">
        <Text fontWeight="500" color="gray.700" mt={4}>
          Μηνιαία αμοιβή (χωρίς ΦΠΑ)
        </Text>
        <FormControl>
          <NumberInput
            autoFocus
            min={0}
            precision={2}
            mt={2}
            onChange={(value) => onChangeGrossIncome(value)}
            value={calculateRealGross.grossIncomeMonthly || ""}
          >
            <NumberInputField placeholder="π.χ. 1000" />
          </NumberInput>
        </FormControl>
      </GridItem>
      <GridItem mt={4}>
        <FormElements.Select
          label="ΦΠΑ"
          value={calculateRealGross.currentAdditionalValueTax}
          onChange={onSelectAdditionalValueTax}
          options={includeZeroRate(invoiceRules.vatRates).map((rate) => ({
            value: rate,
            text:
              rate === 0
                ? "0% / απαλλαγή"
                : formatRatePercentage(rate),
          }))}
        />
      </GridItem>
      <GridItem mt={4}>
        <FormElements.Select
          label="Παρακράτηση"
          value={calculateRealGross.currentWithholdingTax}
          onChange={onSelectWithholdingTax}
          options={includeZeroRate(invoiceRules.withholdingRates).map((rate) => ({
            value: rate,
            text:
              rate === 0
                ? "Δεν εφαρμόζεται"
                : formatRatePercentage(rate),
          }))}
        />
      </GridItem>
    </Grid>
  );
};

export { FormFields };
