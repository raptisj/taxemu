import { Flex, Button, Heading } from "@chakra-ui/react";
import { SubmitButtonContent } from "../form";
import KeyboardShortcutsButton from "../keyboard/KeyboardShortcutsButton";
import { ResultsActionsMenu } from "./ResultsActions";

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

      <Flex gap={2} alignItems="center">
        <ResultsActionsMenu entity={entity} />
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
    </Flex>
  );
};

export default TableHeader;
