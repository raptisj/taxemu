import { Text, Heading } from "@chakra-ui/react";

const MobileTableHeader = ({ entity = "" }) => {
  return (
    <>
      <Heading as="h2" size="lg" fontWeight="500" color="gray.600">
        Υπολογισμός εισοδήματος {entity}
      </Heading>
      <Text color="gray.500" fontSize="14px" mt={1}>
        Οι υπολογισμοί είναι κατά προσέγγιση και δεν αποτελούν λογιστική
        συμβουλή*
      </Text>
    </>
  );
};

export default MobileTableHeader;
