import {
  Radio,
  RadioGroup as ChakraRadioGroup,
  Stack,
  Text,
  Box,
} from "@chakra-ui/react";

const RadioGroup = ({ onChange, value, options = [], label = "", ...rest }) => {
  return (
    <Box>
      {label && (
        <Text fontWeight="500" color="gray.700">
          {label}
        </Text>
      )}
      <ChakraRadioGroup onChange={onChange} value={value} mt={2} {...rest}>
        <Stack direction="row">
          {options.map((option) => {
            return (
              <Radio key={option.key} value={option.key}>
                <Text fontSize="14px">{option.title}</Text>
              </Radio>
            );
          })}
        </Stack>
      </ChakraRadioGroup>
    </Box>
  );
};

export default RadioGroup;
