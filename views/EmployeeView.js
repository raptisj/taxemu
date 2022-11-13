import { Box, Grid, GridItem } from "@chakra-ui/react";
import { useStore } from "store";
import { Sidebar } from "components/layout";
import Table from "components/table";
import { useCalculateEmployee } from "hooks";
import EmployeeForm from "components/employee/EmployeeForm";

const EmployeeView = () => {
  const { centralCalculation } = useCalculateEmployee();
  const removeUserDetails = useStore((state) => state.removeUserDetails);

  return (
    <Grid
      width="100%"
      templateColumns="386px 1fr"
      gap={6}
      maxW="1200px"
      mt={[10, 16]}
      px={[0, 4]}
      pt={[0, 4]}
    >
      <GridItem>
        <Sidebar
          onSubmitAction={centralCalculation}
          onClear={removeUserDetails}
        >
          <EmployeeForm />
        </Sidebar>
      </GridItem>

      <GridItem
        borderLeft="1px solid"
        borderColor="gray.100"
        paddingLeft="40px"
        position="relative"
      >
        <Box position="sticky" top={8}>
          <Table.Header onSubmitAction={centralCalculation} />
          <Table.Employee />
        </Box>
      </GridItem>
    </Grid>
  );
};

export default EmployeeView;
