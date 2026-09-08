import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";
import { forwardRef } from "react";

const TaxWedgeInfoButton = forwardRef(({ onClick }, ref) => (
  <IconButton
    ref={ref}
    aria-label="Τι είναι η φορολογική επιβάρυνση;"
    icon={<QuestionIcon />}
    size="xs"
    minW="24px"
    height="24px"
    variant="ghost"
    colorScheme="purple"
    onClick={onClick}
  />
));

TaxWedgeInfoButton.displayName = "TaxWedgeInfoButton";

const TaxWedgeExplanation = () => (
  <>
    <Text fontSize="sm">
      Είναι η διαφορά μεταξύ του συνολικού εργοδοτικού κόστους και του καθαρού
      μισθού.
    </Text>
    <Box mt={3} p={3} borderRadius="md" bg="purple.50">
      <Text fontSize="sm" fontWeight="600">
        Φόρος εισοδήματος + εισφορές εργαζομένου + εργοδοτικές εισφορές
      </Text>
    </Box>
    <Text mt={3} fontSize="sm">
      Το ποσοστό δείχνει ποιο μέρος του συνολικού εργοδοτικού κόστους
      αντιστοιχεί σε αυτούς τους φόρους και τις εισφορές.
    </Text>
    <Text mt={2} color="gray.600" fontSize="xs">
      Ποσοστό = φορολογική επιβάρυνση ÷ συνολικό εργοδοτικό κόστος
    </Text>
  </>
);

const TaxWedgeInfoPopover = ({ isMobile = false }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (isMobile) {
    return (
      <>
        <TaxWedgeInfoButton onClick={onOpen} />
        <Drawer placement="bottom" isOpen={isOpen} onClose={onClose} size="xl">
          <DrawerOverlay />
          <DrawerContent borderTopRadius="xl">
            <Flex width="full" justifyContent="center" pt={3}>
              <Box
                height="4px"
                width="40px"
                background="gray.200"
                borderRadius="full"
              />
            </Flex>
            <DrawerCloseButton top={3} />
            <DrawerHeader pt={3} pr={12} fontSize="md">
              Τι είναι η φορολογική επιβάρυνση;
            </DrawerHeader>
            <DrawerBody pb={6}>
              <TaxWedgeExplanation />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover placement="top-start">
      <PopoverTrigger>
        <TaxWedgeInfoButton />
      </PopoverTrigger>
      <Portal>
        <PopoverContent width="calc(100vw - 32px)" maxW="360px">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader pr={8} fontWeight="700">
            Τι είναι η φορολογική επιβάρυνση;
          </PopoverHeader>
          <PopoverBody>
            <TaxWedgeExplanation />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default TaxWedgeInfoPopover;
