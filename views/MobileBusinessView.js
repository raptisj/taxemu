import { Box, Button } from "@chakra-ui/react";
import Table from "components/table";
import BusinessForm from "components/business/BusinessForm";
import MobileDrawerForm from "components/layout/MobileDrawerForm";
import { useCalculateBusiness } from "hooks";
import { useRouter } from "next/router";

const MobileBusinessView = () => {
  const router = useRouter();
  const { centralCalculation } = useCalculateBusiness();

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
      <Box position="relative" height="calc(100vh - 150px)" mt={[10, 16]}>
        <Table.MobileBusinessTable />

        <Box
          borderTop="1px solid"
          borderColor="gray.100"
          position="fixed"
          bottom={0}
          left={0}
          width="100%"
          p={3}
        >
          <Button variant="outline" onClick={handleOpen} width="full">
            Αλλαγή παραμέτρων
          </Button>
        </Box>
      </Box>

      <MobileDrawerForm
        isOpen={isDrawerOpen}
        onClose={handleClose}
        onCalculate={centralCalculation}
      >
        <Box padding={4}>
          <BusinessForm showCalculatorType={false} />
        </Box>
      </MobileDrawerForm>
    </>
  );
};

export default MobileBusinessView;
