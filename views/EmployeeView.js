import { Box, Grid, Flex, GridItem } from "@chakra-ui/react";
import { useStore } from "store";
import { Sidebar } from "components/layout";
import Table from "components/table";
import { useCalculateEmployee } from "hooks";
import EmployeeForm from "components/employee/EmployeeForm";
import { WageComparisonChart } from "features/wageComparisonChart";
import { InflationDesktopWidget } from "features/inflationDesktopWidget";

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
      <GridItem minHeight="calc(100vh - 135px)">
        <Flex direction="column" height="100%">
          <Sidebar
            onClear={removeUserDetails}
            onSubmitAction={
              isGrossAction ? centralCalculation : reverseCentralCalculation
            }
          >
            <Box pb={6}>
              <EmployeeForm />
            </Box>
          </Sidebar>
        </Flex>
      </GridItem>

      <GridItem
        borderLeft="1px solid"
        borderColor="gray.100"
        paddingLeft="40px"
        position="relative"
      >
        <Flex
          position="sticky"
          top={8}
          flexDirection="column"
          height="100%"
          pb={20}
        >
          <Table.Header
            onSubmitAction={
              isGrossAction ? centralCalculation : reverseCentralCalculation
            }
          />
          <Table.Employee />

          <WageComparisonChart />

          <Box pr={4} mt={4}>
            <InflationDesktopWidget />
          </Box>
        </Flex>
      </GridItem>
    </Grid>
  );
};

export default EmployeeView;
