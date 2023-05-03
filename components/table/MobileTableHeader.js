import { Text, Heading, Tag } from "@chakra-ui/react";

const MobileTableHeader = ({ entity = "" }) => {
  return (
    <>
      {entity && (
        <Tag fontSize=".7rem" fontWeight="normal" colorScheme="purple">
          {entity}
        </Tag>
      )}
      <Heading
        as="h2"
        size="lg"
        noOfLines={1}
        fontWeight="500"
        color="gray.600"
      >
        Υπολογισμός εισοδήματος
      </Heading>
      <Text color="gray.500" fontSize="14px" mt={1}>
        Οι υπολογισμοί είναι κατά προσέγγιση και δεν αποτελούν λογιστική
        συμβουλή*
      </Text>
    </>
  );
};

export default MobileTableHeader;
