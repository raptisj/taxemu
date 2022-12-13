import {
  Box,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";

const MobileDrawerForm = ({ children, isOpen, onClose, onCalculate }) => {
  const onClick = () => {
    onCalculate();
    onClose();
    return;
  };

  return (
    <Drawer placement="bottom" onClose={onClose} isOpen={isOpen} size="full">
      <DrawerOverlay />
      <DrawerContent overflowY="auto" paddingTop="100px">
        <DrawerCloseButton top="60px" />

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
          mt="auto"
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
