import {
    Box,
    Text,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
  } from "@chakra-ui/react";
  
  const NumberField = ({ text, onChange }) => (
    <Box>
      <Text fontSize="sm">{text}</Text>
      <NumberInput borderColor="gray.400" onChange={onChange}>
        <NumberInputField />
      </NumberInput>
    </Box>
  );
  
  const NumberCounterField = ({ text, onChange, isFullYear }) => (
    <Box>
      <Text fontSize="sm">{text}</Text>
      <NumberInput
        borderColor="gray.400"
        maxW="80px"
        defaultValue={11}
        min={1}
        max={11}
        mt={1}
        isDisabled={isFullYear}
        onChange={onChange}
      >
        <NumberInputField readOnly />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </Box>
  );

  export { NumberField, NumberCounterField };