import { Box, Grid, Flex, GridItem } from "@chakra-ui/react";
import { CreditsFooter, Sidebar } from "../components/layout";
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
        <Sidebar
          onSubmitAction={centralCalculation}
          onClear={removeUserDetails}
        >
          <BusinessForm />
        </Sidebar>
      </GridItem>

      <GridItem
        borderLeft="1px solid"
        borderColor="gray.100"
        paddingLeft="40px"
        position="relative"
      >
        <Flex position="sticky" top={8} flexDirection="column" height="100%">
          <Table.Header onSubmitAction={centralCalculation} />
          <Table.Business />

          <Box
            textAlign="end"
            p={4}
            position="sticky"
            bottom={2}
            marginTop="auto"
          >
            <CreditsFooter />
          </Box>
        </Flex>
      </GridItem>
    </Grid>
  );
};

export default BusinessView;
