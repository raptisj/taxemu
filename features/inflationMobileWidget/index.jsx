import { InfoIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Heading,
  Text,
  Link,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { inflationRatesMap, inflationRates } from "../../constants";
import { useStore } from "store";
import { calculateInflationDetails } from "utils";
import { useRouter } from "next/router";
import { InflationWidgetContent } from "features/inflationDesktopWidget/InflationWidgetContent";

export const InflationMobileWidget = () => {
  const router = useRouter();
  const userDetails = useStore((state) => state.userDetails.employee);

  const { finalIncomeMonthly, grossIncomeYearly } = userDetails;

  const totalResultDetails = calculateInflationDetails(
    grossIncomeYearly,
    inflationRates
  );

  if (!finalIncomeMonthly) {
    return null;
  }

  const currentParams = new URLSearchParams(router.query);
  const isDrawerOpen = currentParams.get("drawer-inflation");

  const handleOpen = () => {
    currentParams.set("drawer-inflation", "open");
    router.push({
      pathname: router.pathname,
      query: currentParams.toString(),
    });
  };

  const handleClose = () => {
    currentParams.delete("drawer-inflation");
    router.push({
      pathname: router.pathname,
      query: currentParams.toString(),
    });
  };

  return (
    <Box borderWidth={1} borderColor="gray.300" borderRadius={6} p={3} mt={3}>
      <Flex gap={3} alignItems="center">
        <Heading as="h3" fontSize="1.2rem" fontWeight={600}>
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
        <Box onClick={handleOpen} ml="auto">
          <InfoIcon fontSize={20} />
        </Box>
      </Flex>

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
              {" "}
              <h2>Πως με επηρεάζει;</h2>
            </Box>
          </DrawerHeader>
          <DrawerBody minH="400px" pb={6}>
            <InflationWidgetContent
              grossIncomeYearly={grossIncomeYearly}
              totalResultDetails={totalResultDetails}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
