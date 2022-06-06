import { Text, Stack, Checkbox } from "@chakra-ui/react";
import { useStore } from "../../store";

const CheckboxGroup = () => {
  const details = useStore((state) => state.userDetails);
  const addDetail = useStore((state) => state.addDetail);

  const { grossIncome, discountOptions } = details;

  return (
    <Stack spacing={4} direction="column">
      <Checkbox
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
        isChecked={discountOptions.prePaidTax}
        onChange={() =>
          addDetail({
            value: {
              ...discountOptions,
              prePaidTax: !discountOptions.prePaidTax,
            },
            field: "discountOptions",
          })
        }
      >
        <Text fontSize="sm" color="gray.500">
          Προκαταβολή φόρου(55% του συνολικού φόρου)(<strong>SOON</strong>)
        </Text>
      </Checkbox>
      <Checkbox
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
          Έκτπωση 50% στο 55% της προκαταβολής φόρου(<strong>SOON</strong>)
        </Text>
      </Checkbox>
    </Stack>
  );
};

export { CheckboxGroup };
