import { Box, Grid, GridItem } from "@chakra-ui/react";
import { Sidebar } from "../components/layout";
import Table from "../components/table";
import { useCalculateBusiness } from "hooks";
import BusinessForm from "components/business/BusinessForm";
import { useStore } from "store";

const BusinessView = () => {
  const { centralCalculation } = useCalculateBusiness();
  const removeUserDetails = useStore((state) => state.removeUserDetails);

  return (
    <Grid
      width="100%"
      templateColumns={["1fr", "386px 1fr"]}
      gap={6}
      maxW="1200px"
      mt={[10, 16]}
      px={[0, 4]}
      pt={[0, 4]}
    >
      <GridItem>
        <Sidebar>
          <BusinessForm
            onSubmitAction={centralCalculation}
            onClear={removeUserDetails}
          />
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
          <Table.Business />
        </Box>
      </GridItem>
    </Grid>
  );
};

export default BusinessView;
