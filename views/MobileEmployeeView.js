import { Box, Button } from "@chakra-ui/react";
import Table from "components/table";
import MobileDrawerForm from "components/layout/MobileDrawerForm";
import EmployeeForm from "components/employee/EmployeeForm";
import { useCalculateEmployee } from "hooks";
import { useStore } from "store";
import { WageComparisonWidget } from "features/wageComparisonMobileWidget";
import { useRouter } from "next/router";
import { InflationMobileWidget } from "features/inflationMobileWidget";

const MobileEmployeeView = () => {
  const router = useRouter();

  const { centralCalculation, reverseCentralCalculation } =
    useCalculateEmployee();

  const userDetails = useStore((state) => state.userDetails.employee);

  const { activeInput } = userDetails;
  const isGrossAction = activeInput === "gross";

  const currentParams = new URLSearchParams(router.query);
  const isDrawerOpen = currentParams.get("drawer-form");

  const handleOpen = () => {
    currentParams.set("drawer-form", "open");
    router.push({
      pathname: router.pathname,
      query: currentParams.toString(),
    });
  };

  const handleClose = () => {
    currentParams.delete("drawer-form");
    router.push({
      pathname: router.pathname,
      query: currentParams.toString(),
    });
  };

  return (
    <>
      <Box position="relative" height="calc(100vh - 150px)" mt={[6, 16]}>
        <Box pb={20}>
          <Table.MobileEmployeeTable />

          <WageComparisonWidget />
          <InflationMobileWidget />
        </Box>

        <Box
          borderTop="1px solid"
          borderColor="gray.100"
          bg="white"
          position="fixed"
          bottom={0}
          left={0}
          width="100%"
          p={3}
          zIndex={2}
        >
          <Button variant="outline" onClick={handleOpen} width="full">
            Αλλαγή παραμέτρων
          </Button>
        </Box>
      </Box>

      <MobileDrawerForm
        isOpen={isDrawerOpen}
        onClose={handleClose}
        onCalculate={
          isGrossAction ? centralCalculation : reverseCentralCalculation
        }
      >
        <Box padding={4}>
          <EmployeeForm showCalculatorType={false} />
        </Box>
      </MobileDrawerForm>
    </>
  );
};

export default MobileEmployeeView;
