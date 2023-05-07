import { Box, Button, useDisclosure } from "@chakra-ui/react";
import Table from "components/table";
import BusinessForm from "components/business/BusinessForm";
import MobileDrawerForm from "components/layout/MobileDrawerForm";
import { useCalculateBusiness } from "hooks";

const MobileBusinessView = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { centralCalculation, hasError } = useCalculateBusiness();

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
          <Button variant="outline" onClick={onOpen} width="full">
            Αλλαγή παραμέτρων
          </Button>
        </Box>
      </Box>

      <MobileDrawerForm
        isOpen={isOpen}
        onClose={onClose}
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
