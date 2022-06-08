import {
  Text,
  Stack,
  Checkbox,
  Box,
  Divider,
  Tooltip,
  Flex,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { useStore } from "store";

const CheckboxGroup = () => {
  const details = useStore((state) => state.userDetails);
  const addDetail = useStore((state) => state.addDetail);

  const { grossIncome, discountOptions, prePaidTax } = details;

  return (
    <>
      <Stack spacing={4} direction="column">
        <Text fontWeight={600} color="gray.600">
          Εκπτώσεις Κρατήσεων
        </Text>

        <Checkbox
          colorScheme="purple"
          isDisabled={grossIncome > 10000}
          isChecked={discountOptions.firstScaleDiscount && grossIncome <= 10000}
          onChange={() =>
            addDetail({
              value: {
                ...discountOptions,
                firstScaleDiscount: !discountOptions.firstScaleDiscount,
              },
              field: "discountOptions",
            })
          }
        >
          <Flex alignItems="start">
            <Tooltip
              placement="top"
              label={
                <Text color="gray.100" p={2} textAlign="center">
                  Για τα τρία πρώτα έτη άσκησης της δραστηριότητας, εφόσον το
                  ετήσιο ακαθάριστο εισόδημα σας από επιχειρηματική
                  δραστηριότητα δεν υπερβαίνει τις 10.000 €, ο φορολογικός
                  συντελεστής (9%) μειώνεται κατά 50%, δηλαδή η φορολογία είναι
                  με 4,5%
                </Text>
              }
            >
              <Text fontSize="sm" color="gray.500">
                50% έκτπωση στο 9%
                <InfoIcon marginLeft={2} color="gray.500" />
              </Text>
            </Tooltip>
          </Flex>
        </Checkbox>
        <Checkbox
          colorScheme="purple"
          isChecked={discountOptions.prePaidTaxDiscount}
          onChange={() =>
            addDetail({
              value: {
                ...discountOptions,
                prePaidTaxDiscount: !discountOptions.prePaidTaxDiscount,
              },
              field: "discountOptions",
            })
          }
        >
          <Flex alignItems="center">
            <Tooltip
              placement="top"
              label={
                <Text color="gray.100" p={2} textAlign="center">
                  Ο συντελεστής προκαταβολής φόρου είναι 55%. Για τα πρώτα τρία
                  (3) έτη λειτουργίας υπάρχει έκπτωση 50%.
                </Text>
              }
            >
              <Text fontSize="sm" color="gray.500">
                Έκτπωση 50% στο 55% της προκαταβολής φόρου
                <InfoIcon marginLeft={2} color="gray.500" />
              </Text>
            </Tooltip>
          </Flex>
        </Checkbox>
      </Stack>

      <Box py={6}>
        <Divider orientation="horizontal" style={{ borderColor: "#c7c7c7" }} />
      </Box>
      <Stack spacing={4} direction="column">
        <Text fontWeight={600} color="gray.600">
          Κρατήσεις
        </Text>

        <Checkbox
          colorScheme="purple"
          isChecked={discountOptions.prePaidNextYearTax}
          onChange={() =>
            addDetail({
              value: {
                ...discountOptions,
                prePaidNextYearTax: !discountOptions.prePaidNextYearTax,
              },
              field: "discountOptions",
            })
          }
        >
          <Text fontSize="sm" color="gray.500">
            Προκαταβολή φόρου(55% του συνολικού φόρου)
          </Text>
        </Checkbox>
        <Checkbox
          colorScheme="purple"
          isChecked={prePaidTax}
          onChange={() =>
            addDetail({
              value: !prePaidTax,
              field: "prePaidTax",
            })
          }
        >
          <Text fontSize="sm" color="gray.500">
            Παρακράτηση φόρου(-20%)
          </Text>
        </Checkbox>
      </Stack>
    </>
  );
};

export { CheckboxGroup };
