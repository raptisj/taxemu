import {
  Box,
  Text,
  Button,
  useMediaQuery,
  useDisclosure,
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import Image from "next/image";
import { BookIcon } from "components/icons";
import { WikiContent } from "./WikiContent";
import { useRouter } from "next/router";
import { WIKI } from "../../constants/content";
import bookIcon from "assets/book.svg";

const Wiki = () => {
  const router = useRouter();
  const [isLargerThan30] = useMediaQuery("(min-width: 30em)");
  const entity = router.pathname.replace("/", "");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const currentParams = new URLSearchParams(router.query);
  const isDrawerOpen = currentParams.get("drawer-wiki");

  const handleOpen = () => {
    if (isLargerThan30) {
      onOpen();
    } else {
      currentParams.set("drawer-wiki", "open");
      router.push({
        pathname: router.pathname,
        query: currentParams.toString(),
      });
    }
  };

  const handleClose = () => {
    if (isLargerThan30) {
      onClose();
    } else {
      currentParams.delete("drawer-wiki");
      router.push({
        pathname: router.pathname,
        query: currentParams.toString(),
      });
    }
  };

  return (
    <>
      {(router.pathname === "/employee" || router.pathname === "/business") && (
        <>
          {isLargerThan30 ? (
            <Button
              height="30px"
              onClick={handleOpen}
              fontSize=".9rem"
              leftIcon={<BookIcon width={26} height={26} />}
            >
              Πως υπολογίζεται
            </Button>
          ) : (
            <Box onClick={handleOpen}>
              <Image src={bookIcon} alt="" width={26} height={26} />
            </Box>
          )}
        </>
      )}
      {isLargerThan30 && (
        <Modal onClose={handleClose} size="xl" isOpen={isOpen}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader borderBottomWidth="1px" borderBottomColor="gray.200">
              <h2>{WIKI[entity]?.header?.title}</h2>
              <Text
                fontSize={[".8rem", ".9rem"]}
                fontWeight="normal"
                color="gray.500"
              >
                {WIKI[entity]?.header?.subtitle}
              </Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody
              minH="400px"
              maxH={{ md: "70vh", xl: "50vh" }}
              overflow="auto"
              pb={6}
            >
              <WikiContent />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {!isLargerThan30 && (
        <Drawer
          placement="right"
          onClose={handleClose}
          isOpen={isDrawerOpen}
          size="full"
        >
          <DrawerOverlay />
          <DrawerContent overflowY="auto" paddingTop="10px" height="100%">
            <DrawerCloseButton top="30px" />
            <DrawerHeader borderBottomWidth="1px" borderBottomColor="gray.200">
              <Box maxW="90%">
                {WIKI[entity]?.header?.title}
                <Text
                  fontSize={[".8rem", ".9rem"]}
                  fontWeight="normal"
                  color="gray.500"
                >
                  {WIKI[entity]?.header?.subtitle}
                </Text>
              </Box>
            </DrawerHeader>
            <DrawerBody minH="400px" pb={6}>
              <WikiContent />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default Wiki;
