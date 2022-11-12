import {
  Box,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { useCalculateBusiness } from "hooks";

const MobileDrawerForm = ({ children, isOpen, onClose }) => {
  const { centralCalculation } = useCalculateBusiness();

  const onClick = () => {
    centralCalculation();
    onClose();
    return;
  };

  return (
    <Drawer placement="bottom" onClose={onClose} isOpen={isOpen} size="full">
      <DrawerOverlay />
      <DrawerContent overflowY="auto" paddingTop={8}>
        <DrawerCloseButton />

        {children}

        <Box
          borderTop="1px solid"
          borderColor="gray.300"
          position="sticky"
          bottom={0}
          left={0}
          width="100%"
          p={4}
          backgroundColor="white"
        >
          <Button colorScheme="purple" width="full" onClick={onClick}>
            Υπολόγισε
          </Button>
        </Box>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawerForm;
