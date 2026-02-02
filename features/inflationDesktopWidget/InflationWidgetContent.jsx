import {
  Box,
  Flex,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { formatEuroCurrency } from "utils";

export const InflationWidgetContent = ({
  grossIncomeYearly,
  totalResultDetails,
}) => {
  return (
    <>
      <Text>
        Για να διατηρήσετε την αγοραστική σας δύναμη, είναι σημαντικό ο μισθός
        σας να αυξάνεται σύμφωνα με το συσσωρευμένο ποσοστό πληθωρισμού από το{" "}
        <strong>2022</strong> έως το <strong>2026</strong>.
      </Text>
      <br />

      <Text>
        Αν το μικτό ετήσιο εισόδημά σας ήταν{" "}
        <strong>{formatEuroCurrency(grossIncomeYearly)}</strong> το 2022(μεχρι
        και σημερα), λόγω του συσσωρευμένου πληθωρισμού μέχρι το 2026, θα πρέπει
        να αυξηθεί περίπου κατά{" "}
        <strong>{totalResultDetails.increasePercentage}%</strong>(ή{" "}
        <strong>{formatEuroCurrency(totalResultDetails.increaseAmount)}</strong>
        ) για να διατηρήσετε την ίδια αγοραστική δύναμη.
      </Text>
      <br />

      <Accordion allowToggle defaultIndex={[]}>
        <AccordionItem border="none">
          <h3>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left" color="#8884d8">
                Πως υπολογίζεται;
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel pb={4}>
            <Heading as="h4" size="md" mt={6}>
              Υποθέσεις:
            </Heading>
            <UnorderedList mt={4}>
              <ListItem>
                Ξεκινάμε με μικτό ετήσιο εισόδημα{" "}
                {formatEuroCurrency(grossIncomeYearly)} το 2022(μέχρι και
                σήμερα)
              </ListItem>
              <ListItem>
                Ο πληθωρισμός εφαρμόζεται διαδοχικά κάθε χρόνο, με τους εξής
                συντελεστές:
                <UnorderedList>
                  <ListItem>2022: 9,3%</ListItem>
                  <ListItem>2023: 4,2%</ListItem>
                  <ListItem>2024: 2,9%</ListItem>
                  <ListItem>2025: 2,4%</ListItem>
                </UnorderedList>
              </ListItem>
            </UnorderedList>
            <Heading as="h4" size="md" mt={6}>
              Υπολογισμός
            </Heading>
            <Flex flexDirection="column" gap={4} mt={4}>
              <Box>
                <Text>Εφαρμόζουμε τον πληθωρισμό του 2022(9,3%):</Text>
                <Text>
                  {formatEuroCurrency(totalResultDetails.amounts[0])} × 1,093 ={" "}
                  {formatEuroCurrency(totalResultDetails.amounts[1])}
                </Text>
              </Box>

              <Box>
                <Text>Εφαρμόζουμε τον πληθωρισμό του 2023(4,2%):</Text>
                <Text>
                  {formatEuroCurrency(totalResultDetails.amounts[1])} × 1,042 ={" "}
                  {formatEuroCurrency(totalResultDetails.amounts[2])}
                </Text>
              </Box>

              <Box>
                <Text>Εφαρμόζουμε τον πληθωρισμό του 2024(2,9%):</Text>
                <Text>
                  {formatEuroCurrency(totalResultDetails.amounts[2])} × 1,029 ={" "}
                  {formatEuroCurrency(totalResultDetails.amounts[3])}
                </Text>
              </Box>

              <Box>
                <Text>Εφαρμόζουμε τον πληθωρισμό του 2025(2,8%):</Text>
                <Text>
                  {formatEuroCurrency(totalResultDetails.amounts[3])} × 1,028 ={" "}
                  {formatEuroCurrency(totalResultDetails.amounts[4])}{" "}
                </Text>
              </Box>

              <Box>
                <Text>Εφαρμόζουμε τον πληθωρισμό του 2026(2,3%):</Text>
                <Text>
                  {formatEuroCurrency(totalResultDetails.amounts[4])} × 1,023 ={" "}
                  {formatEuroCurrency(totalResultDetails.amounts[5])}{" "}
                </Text>
              </Box>
            </Flex>
            <Heading as="h4" size="md" mt={6}>
              Τελικό Αποτέλεσμα
            </Heading>

            <Flex flexDirection="column" gap={4} mt={4}>
              <Box>
                <Text>
                  Το απαιτούμενο ποσό για να διατηρηθεί η αγοραστική σας δύναμη
                  είναι{" "}
                  <strong>
                    {formatEuroCurrency(totalResultDetails.amounts[4])}
                  </strong>
                  .
                </Text>
              </Box>

              <Box>
                <Text>
                  Δηλαδή, σε σύγκριση με τα{" "}
                  {formatEuroCurrency(grossIncomeYearly)} του 2022, χρειάζεται
                  αύξηση:
                </Text>
                <Text>
                  {formatEuroCurrency(totalResultDetails.amounts[4])} –{" "}
                  {formatEuroCurrency(grossIncomeYearly)} ={" "}
                  <strong>
                    {formatEuroCurrency(totalResultDetails.increaseAmount)}
                  </strong>
                </Text>
              </Box>

              <Box>
                <Text>Σε ποσοστιαία μονάδα, αυτό αντιστοιχεί σε:</Text>
                <Text>
                  ({formatEuroCurrency(totalResultDetails.amounts[4])} /{" "}
                  {formatEuroCurrency(grossIncomeYearly)} – 1) × 100% ≈{" "}
                  <strong>{totalResultDetails.increasePercentage}%</strong>
                </Text>
              </Box>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  );
};
