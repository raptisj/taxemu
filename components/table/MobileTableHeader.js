import { Text, Heading, Flex } from "@chakra-ui/react";
import KeyboardShortcutsButton from "../keyboard/KeyboardShortcutsButton";

const MobileTableHeader = ({ entity = "", onSubmitAction }) => {
  return (
    <>
      <Flex justify="space-between" align="flex-start" gap={2}>
        <Heading as="h2" size="lg" fontWeight="500" color="gray.600">
          Υπολογισμός εισοδήματος {entity}
        </Heading>
        <KeyboardShortcutsButton
          onCalculate={onSubmitAction}
          hideTrigger
        />
      </Flex>
      <Text color="gray.500" fontSize="14px" mt={1}>
        Οι υπολογισμοί είναι κατά προσέγγιση και δεν αποτελούν λογιστική
        συμβουλή*
      </Text>
    </>
  );
};

export default MobileTableHeader;
