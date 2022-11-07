import {
  Box,
  Flex,
  Tooltip,
  Stack,
  Text,
  Checkbox as ChakraCheckbox,
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";

export const Checkbox = ({ label, isChecked, onChange, ...rest }) => {
  return (
    <ChakraCheckbox
      mt={2}
      colorScheme="purple"
      isChecked={isChecked}
      onChange={onChange}
      {...rest}
    >
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
    </ChakraCheckbox>
  );
};

export const CheckboxWithTooltip = ({
  label,
  isChecked,
  onChange,
  tootipText,
  ...rest
}) => {
  return (
    <ChakraCheckbox
      mt={2}
      colorScheme="purple"
      isChecked={isChecked}
      onChange={onChange}
      {...rest}
    >
      <Flex alignItems="center">
        <Tooltip
          placement="top"
          label={
            <Text color="gray.100" p={2} textAlign="center">
              {tootipText}
            </Text>
          }
        >
          <Text fontSize="sm" color="gray.500">
            {label}
            <QuestionIcon marginLeft={2} color="purple.500" />
          </Text>
        </Tooltip>
      </Flex>
    </ChakraCheckbox>
  );
};

export const CheckboxNested = ({
  label,
  isChecked,
  onChange,
  show,
  children,
  ...rest
}) => {
  return (
    <Box>
      <ChakraCheckbox
        mt={2}
        colorScheme="purple"
        isChecked={isChecked}
        onChange={onChange}
        {...rest}
      >
        <Text fontSize="sm" color="gray.500">
          {label}
        </Text>
      </ChakraCheckbox>
      {show && (
        <Stack pl={6} mt={1} spacing={1}>
          {children}
        </Stack>
      )}
    </Box>
  );
};
