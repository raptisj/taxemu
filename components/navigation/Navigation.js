import {
  Flex,
  Heading,
  Box,
  Tooltip,
  Button,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useMediaQuery,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import logo from "../../assets/taxemu.svg";
import Image from "next/image";
import githubLogo from "assets/github.svg";
import calculator from "assets/calculator.svg";
import { useRouter } from "next/router";

const tagStyles = {
  fontSize: "14px",
  marginTop: "6px",
  fontWeight: 400,
  color: "#A0AEC0",
};

const CONTENT = {
  employee: {
    title: "Υπολογισμός μισθωτού",
    subtitle: "Πως υπολογίζονται κρατήσεις και εισφορές",
  },
  business: {
    title: "Υπολογισμός ελεύθερου επαγγελματία",
    subtitle: "Πως υπολογίζονται κρατήσεις και εισφορές",
  },
};

export const Navigation = () => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDrawerOpen,
    onOpen: onOpenDrawer,
    onClose: onCloseDrawer,
  } = useDisclosure();
  const [isLargerThan30] = useMediaQuery("(min-width: 30em)");
  const entity = router.pathname.replace("/", "");

  return (
    <Flex justifyContent="space-between" width="100%">
      <Flex flexDirection="column">
        <Image src={logo} alt="Taxemu" />
        <Heading
          as="h2"
          size="3xl"
          position="relative"
          data-testid="heading"
          display="inherit"
        >
          <span style={tagStyles}>Alpha Version</span>
        </Heading>
      </Flex>

      <Flex gap={4} alignItems="center">
        {(router.pathname === "/employee" ||
          router.pathname === "/business") && (
          <>
            {isLargerThan30 ? (
              <Button height="30px" onClick={onOpen} fontSize=".9rem">
                Πως υπολογίζεται
              </Button>
            ) : (
              <Box height="30px" onClick={onOpenDrawer}>
                <Image src={calculator} alt="" width={26} height={26} />
              </Box>
            )}
          </>
        )}

        <Box height="30px">
          <Tooltip
            label="Contribute or file an issue. Do it!"
            aria-label="Contribute or file an issue. Do it!"
          >
            <a
              href="https://github.com/raptisj/taxemu"
              target="_blank"
              rel="noreferrer"
            >
              <Image src={githubLogo} alt="Github" width={26} height={26} />
            </a>
          </Tooltip>
        </Box>
      </Flex>

      {/* TODO: move to separate component */}
      <Modal onClose={onClose} size="xl" isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader borderBottomWidth="1px" borderBottomColor="gray.200">
            {CONTENT[entity]?.title}
            <Text
              fontSize={[".8rem", ".9rem"]}
              fontWeight="normal"
              color="gray.500"
            >
              {CONTENT[entity]?.subtitle}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody minH="400px">{/* <Lorem count={2} /> */}</ModalBody>
        </ModalContent>
      </Modal>

      <Drawer
        placement="right"
        onClose={onCloseDrawer}
        isOpen={isDrawerOpen}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent overflowY="auto" paddingTop="10px" height="100%">
          <DrawerCloseButton top="30px" />
          <DrawerHeader borderBottomWidth="1px" borderBottomColor="gray.200">
            <Box maxW="90%">
              {CONTENT[entity]?.title}
              <Text
                fontSize={[".8rem", ".9rem"]}
                fontWeight="normal"
                color="gray.500"
              >
                {CONTENT[entity]?.subtitle}
              </Text>
            </Box>
          </DrawerHeader>
          <DrawerBody minH="400px" p={0}></DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};
