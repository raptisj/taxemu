import { Box, Grid, GridItem } from "@chakra-ui/react";
import { useStore } from "store";
import { Sidebar } from "components/layout";
import Table from "components/table";
import { useCalculateEmployee } from "hooks";
import EmployeeForm from "components/employee/EmployeeForm";

const EmployeeView = () => {
  const { centralCalculation, reverseCentralCalculation } =
    useCalculateEmployee();
  const removeUserDetails = useStore((state) => state.removeUserDetails);

  const userDetails = useStore((state) => state.userDetails.employee);

  const { activeInput } = userDetails;
  const isGrossAction = activeInput === "gross";

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
          onSubmitAction={isGrossAction ? centralCalculation : reverseCentralCalculation}
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
          <Table.Header onSubmitAction={isGrossAction ? centralCalculation : reverseCentralCalculation} />
          <Table.Employee />
        </Box>
      </GridItem>
    </Grid>
  );
};

export default EmployeeView;
