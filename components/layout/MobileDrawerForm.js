import {
  Box,
  Flex,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerFooter,
  DrawerBody,
} from "@chakra-ui/react";
import { SubmitButtonContent } from "components/form";

const MobileDrawerForm = ({ children, isOpen, onClose, onCalculate }) => {
  const onClick = () => {
    onCalculate();
    onClose();
    return;
  };

  return (
    <Drawer placement="right" onClose={onClose} isOpen={isOpen} size="full">
      <DrawerOverlay />
      <DrawerContent overflowY="auto" paddingTop="40px" height="100%">
        <DrawerCloseButton top="20px" />
        <DrawerBody p={0}>{children}</DrawerBody>

        <DrawerFooter padding={0}>
          <Box
            borderTop="1px solid"
            borderColor="gray.300"
            width="100%"
            height="100%"
            p={4}
            backgroundColor="white"
          >
            <Button colorScheme="purple" width="full" onClick={onClick}>
              <SubmitButtonContent />
            </Button>
          </Box>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawerForm;
