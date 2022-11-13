import { Box, Button, useDisclosure } from "@chakra-ui/react";
import Table from "components/table";
import MobileDrawerForm from "components/layout/MobileDrawerForm";
import EmployeeForm from "components/employee/EmployeeForm";
import { useCalculateEmployee } from "hooks";

const MobileEmployeeView = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { centralCalculation } = useCalculateEmployee();

  return (
    <>
      <Box position="relative" height="calc(100vh - 150px)" mt={[10, 16]}>
        <Table.MobileEmployeeTable />

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
          <EmployeeForm showCalculatorType={false} />
        </Box>
      </MobileDrawerForm>
    </>
  );
};

export default MobileEmployeeView;
