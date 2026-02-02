import { Flex, Button, Heading } from "@chakra-ui/react";
import { SubmitButtonContent } from "../form";

const TableHeader = ({ onSubmitAction }) => {
  return (
    <Flex justifyContent="space-between">
      <Heading
        as="h2"
        size="lg"
        noOfLines={1}
        fontWeight="500"
        color="gray.700"
      >
        Αποτέλεσμα*
      </Heading>

      <Button
        minW="196px"
        height="32px"
        colorScheme="purple"
        onClick={() => {
          onSubmitAction();
        }}
      >
        <SubmitButtonContent />
      </Button>
    </Flex>
  );
};

export default TableHeader;
