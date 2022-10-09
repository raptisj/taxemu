import { Flex, Button, Heading } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useStore } from "store";

const TableHeader = () => {
  const removeUserDetails = useStore((state) => state.removeUserDetails);

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
        leftIcon={<CloseIcon fontSize={8} />}
        colorScheme="gray"
        variant="outline"
        fontSize="12px"
        height="30px"
        onClick={removeUserDetails}
      >
        Εκκαθάριση όλων των πεδίων
      </Button>
    </Flex>
  );
};

export default TableHeader;
