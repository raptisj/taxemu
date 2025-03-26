import {
  Button,
  Box,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Grid,
  GridItem,
  List,
  ListItem,
  Heading,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { SubmitButtonContent } from "../form";
import Image from "next/image";
import upsaleEbook from "../../assets/upsale-ebook.png";

export const Sidebar = ({ children, onSubmitAction, onClear }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const hasSeenUpsaleModal =
    window !== "undefined" ? localStorage.getItem("hasSeenUpsaleModal") : null;

  const trackEbookButtonClick = (deviceType = "desktop", eventLabel) => {
    if (typeof window !== "undefined") {
      window.gtag("event", "click_ebook", {
        event_category: "Ebook",
        event_label: eventLabel,
        device_type: deviceType,
      });
    }
  };

  const onClickLink = (deviceType = "desktop") => {
    trackEbookButtonClick(deviceType, "Clicked to learn more about the ebook");
    window.open("https://taxemu.gumroad.com/l/uiyfzl", "_blank");
  };

  const onClickBuyLink = (deviceType = "desktop") => {
    trackEbookButtonClick(deviceType, "Clicked to buy ebook from upsell modal");
    window.open("https://taxemu.gumroad.com/l/uiyfzl?wanted=true", "_blank");
  };

  const handleClose = () => {
    onClose();
    localStorage.setItem("hasSeenUpsaleModal", true);
  };

  return (
    <>
      <Box minHeight="calc(100vh - 258px)">{children}</Box>
      <Flex
        position="sticky"
        bottom={0}
        mt="auto"
        py={4}
        pr={4}
        borderTop=" 1px solid #E2E8F0"
        width="106%"
        background="#fff"
      >
        <Button
          width={{ base: "full" }}
          colorScheme="purple"
          mr={{ base: 0, sm: 3 }}
          onClick={() => {
            setTimeout(() => {
              if (!hasSeenUpsaleModal) {
                onOpen();
              }
            }, 4000);
            onSubmitAction();
          }}
        >
          <SubmitButtonContent />
        </Button>

        <Button
          leftIcon={<CloseIcon fontSize={8} />}
          colorScheme="gray"
          variant="outline"
          fontSize="12px"
          p={4}
          width="140px"
          onClick={onClear}
        >
          Εκκαθάριση
        </Button>
      </Flex>

      {/* Upsale ebook modal */}
      <Modal
        onClose={handleClose}
        size="3xl"
        isOpen={!hasSeenUpsaleModal && isOpen}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader width="90%">
            <Heading as="h2" fontSize="1.6rem" fontWeight={400}>
              Τώρα που γνωρίζετε τους αριθμούς σας,{" "}
              <strong>
                είστε έτοιμοι να διαπραγματευτείτε για περισσότερα;
              </strong>
            </Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody minH="400px" overflow="auto" pb={6}>
            <Grid gridTemplateColumns="1fr 1fr">
              <GridItem>
                <Image src={upsaleEbook} alt="" />
              </GridItem>
              <GridItem>
                <Heading as="h3" size="sm" mt={6}>
                  Ο οδηγός μας σάς δείχνει ακριβώς πώς:
                </Heading>
                <List spacing={1} fontSize=".9rem" mt={6}>
                  <ListItem>
                    ✅ Πώς να <strong>προετοιμαστείτε αποτελεσματικά</strong> -
                    Έρευνα αγοράς, τεκμηρίωση αξίας
                  </ListItem>
                  <ListItem>
                    ✅ <strong>Ψυχολογία διαπραγμάτευσης</strong> - Ξεπεράστε
                    τους φόβους, αναπτύξτε αυτοπεποίθηση
                  </ListItem>
                  <ListItem>
                    ✅ <strong>Βασικές τεχνικές</strong> - Η δύναμη της σιωπής,
                    στρατηγικές ερωτήσεις
                  </ListItem>
                  <ListItem>
                    ✅ <strong>Αντιμετώπιση δύσκολων καταστάσεων</strong> -
                    Έτοιμες απαντήσεις για κάθε σενάριο
                  </ListItem>
                  <ListItem>
                    ✅ <strong>Διαπραγμάτευση πέρα από το μισθό</strong> -
                    Παροχές που αυξάνουν την αξία του πακέτου αποδοχών
                  </ListItem>
                </List>

                <Button
                  size="sm"
                  variant="outline"
                  mt={4}
                  onClick={onClickLink}
                >
                  Μάθε περισσότερα
                </Button>
              </GridItem>
            </Grid>

            <Box background="purple.50" p={6} mt={8} borderRadius={16}>
              <Heading
                as="h3"
                fontWeight={400}
                fontSize="1.1rem"
                lineHeight={1.5}
              >
                Μια επένδυση που αποπληρώνεται{" "}
                <strong>x10+ με την πρώτη επιτυχημένη διαπραγμάτευση.</strong>
              </Heading>
            </Box>

            <ModalFooter display="flex" gap={4} px={0} mt={4}>
              <Button variant="link" onClick={handleClose}>
                Όχι τώρα
              </Button>
              <Button
                colorScheme="purple"
                background="purple.700"
                onClick={onClickBuyLink}
              >
                Αποκτήστε τον οδηγό - Μόνο €17,90{" "}
              </Button>
            </ModalFooter>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
