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
        fontSize={["20px", "20px", "30px"]}
        maxW="200px"
        padding={0}
      />
    </NumberInput>
  );
};
