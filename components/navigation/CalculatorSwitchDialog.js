import { useRef } from "react";
import NextLink from "next/link";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Link,
  Text,
} from "@chakra-ui/react";
import { inlineLinkStyles } from "../../styles/inlineLink";

const CalculatorSwitchDialog = ({ isOpen, onCancel, onConfirm }) => {
  const cancelRef = useRef(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onCancel}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent mx={4}>
          <AlertDialogHeader>Αλλαγή κατηγορίας υπολογισμού</AlertDialogHeader>
          <AlertDialogBody>
            <Text>
              Είσαι σίγουρος ότι θέλεις να αλλάξεις κατηγορία; Τα στοιχεία και τα
              αποτελέσματα των προηγούμενων υπολογισμών θα διαγραφούν.
            </Text>
            <Text mt={3}>
              Αν θέλεις να συγκρίνεις μισθωτή εργασία και ατομική επιχείρηση,
              επισκέψου τη{" "}
              <Link as={NextLink} href="/compare" onClick={onCancel} {...inlineLinkStyles}>
                σελίδα σύγκρισης
              </Link>.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onCancel}>Ακύρωση</Button>
            <Button colorScheme="purple" onClick={onConfirm} ml={3}>
              Αλλαγή κατηγορίας
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default CalculatorSwitchDialog;
