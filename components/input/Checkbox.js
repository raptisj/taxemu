import { Text, Stack, Checkbox, Box, Divider } from "@chakra-ui/react";
import { useStore } from "../../store";

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
          <Text fontSize="sm" color="gray.500">
            50% έκτπωση στο 9%
          </Text>
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
          <Text fontSize="sm" color="gray.500">
            Έκτπωση 50% στο 55% της προκαταβολής φόρου
          </Text>
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
