import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useStore } from "store";
import { WageComparisonChart } from "features/wageComparisonChart";
import { InflationDesktopWidget } from "features/inflationDesktopWidget";
import { EmployerCostBreakdown } from "features/employerCostBreakdown";

export const EmployeeInsights = () => {
  const calculatedGrossIncome = useStore(
    (state) => state.userDetails.employee.tableResults.grossIncome.month,
  );

  if (!calculatedGrossIncome) {
    return (
      <Box borderRadius="lg" bg="orange.50" color="orange.800" p={4} fontSize="sm">
        Συμπλήρωσε τον μισθό σου και υπολόγισε για να δεις τις αναλύσεις.
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      <WageComparisonChart />
      <InflationDesktopWidget />
      <EmployerCostBreakdown />
    </Stack>
  );
};

export const MobileEmployeeInsights = () => {
  const router = useRouter();
  const calculatedGrossIncome = useStore(
    (state) => state.userDetails.employee.tableResults.grossIncome.month,
  );
  const currentParams = new URLSearchParams(router.query);
  const isOpen = currentParams.get("drawer-insights") === "open";

  const handleOpen = () => {
    currentParams.delete("drawer-form");
    currentParams.set("drawer-insights", "open");
    router.push({
      pathname: router.pathname,
      query: currentParams.toString(),
    });
  };

  const handleClose = () => {
    currentParams.delete("drawer-insights");
    router.push({
      pathname: router.pathname,
      query: currentParams.toString(),
    });
  };

  return (
    <>
      {calculatedGrossIncome ? (
        <Box borderWidth="1px" borderColor="purple.200" borderRadius="xl" p={4} mt={4} bg="purple.50">
          <Flex align="center" justify="space-between" gap={4}>
            <Box>
              <Flex align="center" gap={2} mb={1}>
                <Heading as="h2" fontSize="md">Αναλύσεις</Heading>
                <Badge colorScheme="purple">3</Badge>
              </Flex>
              <Text fontSize="sm" color="gray.600">
                Θέση μισθού, αγοραστική δύναμη και διάσπαση κόστους
              </Text>
            </Box>
            <Button size="sm" colorScheme="purple" onClick={handleOpen} flexShrink={0}>
              Προβολή
            </Button>
          </Flex>
        </Box>
      ) : null}

      <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton top={4} />
          <DrawerHeader borderBottomWidth="1px">
            <Heading as="h2" fontSize="xl">Αναλύσεις</Heading>
            <Text fontSize="sm" color="gray.500" fontWeight="normal" mt={1}>
              Τι σημαίνει το αποτέλεσμα για εσένα
            </Text>
          </DrawerHeader>
          <DrawerBody py={5}>
            <EmployeeInsights />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
