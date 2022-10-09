import { NumberInput, NumberInputField } from "@chakra-ui/react";

export const StepperNumberInput = ({ onChange, value }) => {
  return (
    <NumberInput
      borderBottomColor="gray.400"
      variant="flushed"
      mb={4}
      mr={2}
      onChange={onChange}
      value={value || ""}
    >
      <NumberInputField
        fontWeight="600"
        fontSize={["16px", "20px", "30px"]}
        maxW={["100px", "100px", "160px"]}
        padding={0}
      />
    </NumberInput>
  );
};
