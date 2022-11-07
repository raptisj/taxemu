import { Flex, Button, Heading } from "@chakra-ui/react";

const TableHeader = ({ onSubmitAction }) => {
  return (
    <Flex justifyContent="space-between">
      <Heading
        as="h2"
        size="lg"
        noOfLines={1}
        fontWeight="500"
        color="gray.500"
      >
        Αποτέλεσμα*
      </Heading>

      <Button
        height="32px"
        colorScheme="purple"
        onClick={onSubmitAction}
      >
        Υπολόγισε αποτέλεσμα
      </Button>
    </Flex>
  );
};

export default TableHeader;
