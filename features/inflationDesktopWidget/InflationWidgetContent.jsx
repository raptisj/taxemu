import {
  Box,
  Flex,
  Heading,
  Text,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { formatEuroCurrency } from "utils";

export const InflationWidgetContent = ({
  grossIncomeYearly,
  totalResultDetails,
  fromYear,
  toYear,
  rates,
}) => {
  return (
    <>
      <Text>
        Η εκτίμηση χρησιμοποιεί τον εναρμονισμένο δείκτη τιμών καταναλωτή
        (HICP) και μόνο οριστικά ετήσια στοιχεία από το <strong>{fromYear}</strong>{" "}
        έως το <strong>{toYear}</strong>.
      </Text>
      <br />

      <Text>
        Αν το μικτό ετήσιο εισόδημά σας ήταν{" "}
        <strong>{formatEuroCurrency(grossIncomeYearly)}</strong> το {fromYear},
        θα χρειαζόταν να αυξηθεί περίπου κατά{" "}
        <strong>{totalResultDetails.increasePercentage}%</strong> (ή{" "}
        <strong>{formatEuroCurrency(totalResultDetails.increaseAmount)}</strong>
        ) έως το {toYear}, ώστε να ακολουθήσει τη μεταβολή του γενικού επιπέδου
        τιμών.
      </Text>
      <br />

      <Heading as="h4" size="sm" mt={2}>
        Υποθέσεις
      </Heading>
      <UnorderedList mt={3}>
        <ListItem>
          Ξεκινάμε με μικτό ετήσιο εισόδημα{" "}
          {formatEuroCurrency(grossIncomeYearly)} το {fromYear}.
        </ListItem>
        <ListItem>
          Εφαρμόζουμε τις ετήσιες μεταβολές μετά το έτος βάσης:
          <UnorderedList>
            {rates.map(({ year, rate }) => (
              <ListItem key={year}>
                {year}: {(rate * 100).toLocaleString("el-GR", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}%
              </ListItem>
            ))}
          </UnorderedList>
        </ListItem>
      </UnorderedList>

      <Heading as="h4" size="sm" mt={6}>
        Υπολογισμός
      </Heading>
      <Flex flexDirection="column" gap={4} mt={3}>
        {rates.map(({ year, rate }, index) => (
          <Box key={year}>
            <Text>Εφαρμόζουμε τον πληθωρισμό του {year}:</Text>
            <Text>
              {formatEuroCurrency(totalResultDetails.amounts[index])} ×{" "}
              {(1 + rate).toLocaleString("el-GR", {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })} = {formatEuroCurrency(totalResultDetails.amounts[index + 1])}
            </Text>
          </Box>
        ))}
      </Flex>

      <Heading as="h4" size="sm" mt={6}>
        Τελικό αποτέλεσμα
      </Heading>
      <Text mt={3}>
        Σε σύγκριση με τα {formatEuroCurrency(grossIncomeYearly)} του {fromYear},
        χρειάζεται αύξηση {formatEuroCurrency(totalResultDetails.increaseAmount)}:
      </Text>
      <Text>
        ({formatEuroCurrency(totalResultDetails.finalAmount)} /{" "}
        {formatEuroCurrency(grossIncomeYearly)} – 1) × 100% ≈{" "}
        <strong>{totalResultDetails.increasePercentage}%</strong>
      </Text>
    </>
  );
};
