import {
  Box,
  Flex,
  Text,
  Button,
  Heading,
  Tooltip,
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
import { useStore } from "store";
import logo from "../../assets/taxemu.svg";
import Image from "next/image";
import githubLogo from "assets/github.svg";
import bookIcon from "assets/book.svg";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DownloadIcon } from "@chakra-ui/icons";
import { WIKI } from "../../constants/content";
import { WikiContent } from "components/wiki";
import { BookIcon } from "components/icons";
import Link from "next/link";

const GO_BETA = false;
const VERSION = GO_BETA ? "Beta" : "Alpha";

const tagStyles = {
  fontSize: "14px",
  marginTop: "6px",
  fontWeight: 400,
  color: "#A0AEC0",
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
  const update = useStore((state) => state.update);
  const canInstallPWA = useStore((state) => state.userDetails.canInstallPWA);
  const deferredPrompt = useStore((state) => state.userDetails.deferredPrompt);

  // PWA installtion link and to determine if it should be visible
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();

      update({
        canInstallPWA: true,
        deferredPrompt: e,
      });
    });

    window.addEventListener("appinstalled", () => {
      update({
        canInstallPWA: false,
        deferredPrompt: null,
      });
    });
  }, []);

  const onClickInstallApp = async () => {
    deferredPrompt.prompt();

    update({
      canInstallPWA: false,
      deferredPrompt: null,
    });
  };

  return (
    <Flex justifyContent="space-between" width="100%" zIndex={1}>
      <Link href="/welcome">
        <Flex flexDirection="column">
          <Image src={logo} alt="Taxemu" />
          <Heading
            as="h2"
            size="3xl"
            position="relative"
            data-testid="heading"
            display="inherit"
          >
            <span style={tagStyles}>{VERSION} Version</span>
          </Heading>
        </Flex>
      </Link>

      <Flex gap={4} alignItems="center">
        {canInstallPWA && (
          <Box onClick={onClickInstallApp}>
            {!isLargerThan30 && <DownloadIcon />}
          </Box>
        )}
        {(router.pathname === "/employee" ||
          router.pathname === "/business") && (
          <>
            {isLargerThan30 ? (
              <Button
                height="30px"
                onClick={onOpen}
                fontSize=".9rem"
                leftIcon={<BookIcon width={26} height={26} />}
              >
                Πως υπολογίζεται
              </Button>
            ) : (
              <Box height="30px" onClick={onOpenDrawer}>
                <Image src={bookIcon} alt="" width={26} height={26} />
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
      {isLargerThan30 && (
        <Modal onClose={onClose} size="xl" isOpen={isOpen}>
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
          onClose={onCloseDrawer}
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
    </Flex>
  );
};
