import { Text, Heading } from "@chakra-ui/react";

const MobileTableHeader = () => {
  return (
    <>
      <Heading
        as="h2"
        size="lg"
        noOfLines={1}
        fontWeight="500"
        color="gray.500"
      >
        Υπολογισμός εισοδήματος
      </Heading>
      <Text color="gray.500" fontSize='14px' mt={1}>
        Οι υπολογισμοί είναι κατά προσέγγιση και δεν αποτελούν λογιστική
        συμβουλή*
      </Text>
    </>
  );
};

export default MobileTableHeader;
