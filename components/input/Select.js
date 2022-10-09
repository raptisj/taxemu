import { Text, Select as ChakraSelect } from "@chakra-ui/react";

const Select = ({ onChange, options = [], label, ...rest }) => {
  return (
    <>
      <Text fontWeight="500" color="gray.700">
        {label}
      </Text>
      <ChakraSelect
        onChange={onChange}
        mt={2}
        {...rest}
      >
        {options.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.text}
            </option>
          );
        })}
      </ChakraSelect>
    </>
  );
};

export default Select;
