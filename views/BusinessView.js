import { Box, Grid, Flex, GridItem } from "@chakra-ui/react";
import { Sidebar } from "../components/layout";
import Table from "../components/table";
import { useCalculateBusiness } from "hooks";
import BusinessForm from "components/business/BusinessForm";
import { useStore } from "store";
import { YearComparison } from "features/yearComparison";

const BusinessView = () => {
  const { centralCalculation } = useCalculateBusiness();
  const removeUserDetails = useStore((state) => state.removeUserDetails);

  return (
    <Grid
      width="100%"
      templateColumns={["1fr", "386px 1fr"]}
      gap={6}
      maxW="1200px"
      mt={[8, 16]}
      px={[0, 4]}
      pt={[0, 4]}
    >
      <GridItem minHeight="calc(100vh - 135px)">
        <Sidebar
          entity="business"
          onSubmitAction={centralCalculation}
          onClear={removeUserDetails}
        >
          <Box pb={6}>
            <BusinessForm />
          </Box>
        </Sidebar>
      </GridItem>

      <GridItem
        borderLeft="1px solid"
        borderColor="gray.100"
        paddingLeft="40px"
        position="relative"
      >
        <Flex position="sticky" top={8} flexDirection="column" height="100%">
          <Table.Header entity="business" onSubmitAction={centralCalculation} />
          <Table.Business />
          <YearComparison entity="business" />
        </Flex>
      </GridItem>
    </Grid>
  );
};

export default BusinessView;
