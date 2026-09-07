import { Flex, Button, Heading } from "@chakra-ui/react";
import { SubmitButtonContent } from "../form";
import KeyboardShortcutsButton from "../keyboard/KeyboardShortcutsButton";

const TableHeader = ({ entity, onSubmitAction }) => {
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Flex alignItems="center" gap={1}>
        <Heading
          as="h2"
          size="lg"
          noOfLines={1}
          fontWeight="500"
          color="gray.700"
        >
          Αποτέλεσμα*
        </Heading>
        <KeyboardShortcutsButton onCalculate={onSubmitAction} />
      </Flex>

      <Button
        minW="196px"
        height="32px"
        colorScheme="purple"
        onClick={() => {
          onSubmitAction();
        }}
      >
        <SubmitButtonContent entity={entity} />
      </Button>
    </Flex>
  );
};

export default TableHeader;
