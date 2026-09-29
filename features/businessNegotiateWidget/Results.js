import { Box, Divider, Flex, Text } from "@chakra-ui/react";
import { useStore } from "store";
import { getBusinessRules } from "../../rules";
import { formatRatePercentage } from "../../utils";
import {
  calculateInvoice,
  getEffectiveVatRate,
} from "./calculateInvoice";

const money = new Intl.NumberFormat("el-GR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const ResultRow = ({ label, value, strong = false }) => (
  <Flex justify="space-between" gap={4} py={1}>
    <Text fontWeight={strong ? "700" : "400"}>{label}</Text>
    <Text fontWeight={strong ? "700" : "600"} whiteSpace="nowrap">
      {money.format(value)}
    </Text>
  </Flex>
);

const Results = ({ monthlyValue }) => {
  const calculateRealGross = useStore(
    (state) => state.userDetails.business.calculateRealGrossWidget,
  );
  const taxationYear = useStore(
    (state) => state.userDetails.business.taxationYear,
  );
  const {
    currentWithholdingTax,
    currentAdditionalValueTax,
    applyIslandVatReduction,
  } = calculateRealGross;
  const invoiceRules = getBusinessRules(taxationYear).invoice;
  const effectiveVatRate = getEffectiveVatRate({
    baseVatRate: currentAdditionalValueTax,
    applyIslandVatReduction,
    islandVatRates: invoiceRules.islandVatRates,
  });
  const result = calculateInvoice({
    fee: monthlyValue,
    vatRate: effectiveVatRate,
    withholdingRate: currentWithholdingTax,
  });

  return (
    <Box fontSize={["14px", "16px"]}>
      <ResultRow label="Καθαρή αξία" value={result.fee} />
      <ResultRow
        label={`ΦΠΑ (${formatRatePercentage(effectiveVatRate)})`}
        value={result.vat}
      />
      <Divider my={1} />
      <ResultRow label="Σύνολο τιμολογίου" value={result.invoiceTotal} strong />
      <ResultRow
        label="Παρακράτηση φόρου"
        value={result.withholding ? -result.withholding : 0}
      />

      <Box bg="purple.50" borderRadius="md" mt={3} px={3} py={2}>
        <ResultRow
          label="Κατάθεση από τον πελάτη"
          value={result.clientPayment}
          strong
        />
      </Box>

      <Text color="gray.600" fontSize="sm" mt={3}>
        Από την κατάθεση, {money.format(result.vat)} αντιστοιχούν σε ΦΠΑ και{" "}
        {money.format(result.availableAfterVat)} μένουν προσωρινά διαθέσιμα.
        Η καθαρή αμοιβή παραμένει {money.format(result.fee)}· η παρακράτηση
        λαμβάνεται υπόψη στην εκκαθάριση του φόρου εισοδήματος.
      </Text>
      <Text color="gray.500" fontSize="xs" mt={3}>
        Ο υπολογισμός δεν περιλαμβάνει ΕΦΚΑ, επαγγελματικά έξοδα ή τον τελικό
        φόρο. Ο ΦΠΑ και η παρακράτηση δεν εφαρμόζονται σε όλες τις περιπτώσεις.
      </Text>
    </Box>
  );
};

export { Results };
