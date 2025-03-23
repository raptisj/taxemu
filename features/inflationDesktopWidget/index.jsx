import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Text,
  useDisclosure,
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
} from "@chakra-ui/react";
import { inflationRatesMap, inflationRates } from "../../constants";
import { useStore } from "store";
import { calculateInflationDetails } from "utils";
import { InflationWidgetContent } from "./InflationWidgetContent";

export const InflationDesktopWidget = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const userDetails = useStore((state) => state.userDetails.employee);

  const { finalIncomeMonthly, grossIncomeYearly } = userDetails;

  const totalResultDetails = calculateInflationDetails(
    grossIncomeYearly,
    inflationRates
  );

  if (!finalIncomeMonthly) {
    return null;
  }

  return (
    <Box borderWidth={1} borderColor="gray.300" borderRadius={6} p={3} mt={3}>
      <Flex justifyContent="space-between" alignItems="center">
        <Flex gap={3} alignItems="center">
          <Heading as="h3" fontSize="1.25rem" fontWeight={700}>
            {(inflationRatesMap[2025] * 100).toFixed(1)}%
          </Heading>
          <Box>
            <Text fontSize=".8rem" fontWeight={600}>
              Ετήσιος πληθωρισμός για το 2025
            </Text>
            <Link
              textDecoration="underline"
              color="gray.600"
              target="_blank"
              href="https://economy-finance.ec.europa.eu/economic-surveillance-eu-economies/greece/economic-forecast-greece_en"
              fontSize=".8rem"
            >
              Πηγή: European Commision
            </Link>
          </Box>
        </Flex>

        <Button size="sm" onClick={onOpen}>
          Πως με επηρεάζει;
        </Button>
      </Flex>

      <Modal onClose={onClose} size="xl" isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader borderBottomWidth="1px" borderBottomColor="gray.200">
            <h2>Πως με επηρεάζει;</h2>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            minH="400px"
            maxH={{ md: "70vh", xl: "50vh" }}
            overflow="auto"
            pb={6}
          >
            <InflationWidgetContent
              grossIncomeYearly={grossIncomeYearly}
              totalResultDetails={totalResultDetails}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
