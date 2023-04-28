import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  StackDivider,
  Stack,
  Box,
  Text,
} from "@chakra-ui/react";
import { Navigation } from "components/navigation";
import { Layout } from "components/layout";
import ExplainerInfo from "components/table/ExplainerInfo";

const explainerData = {
  title: "Επεξήγηση υπολογισμού ατομικής επιχείρησης",
  items: [
    {
      title: "",
      description: "",
      example: "",
    },
    {
      title: "",
      description: "",
      example: "",
    },
    {
      title: "",
      description: "",
      example: "",
    },
  ],
};

const ExplainBusiness = () => {
  return (
    <Layout>
      <Navigation />

      <Box width="full" mt={6}>
        <ExplainerInfo />
        {/* <Card>
          <CardHeader>
            <Heading size="md">
              Επεξήγηση υπολογισμού ατομικής επιχείρησης
            </Heading>
          </CardHeader>

          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  Summary
                </Heading>
                <Text pt="2" fontSize="sm">
                  View a summary of all your clients over the last month.
                </Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  Overview
                </Heading>
                <Text pt="2" fontSize="sm">
                  Check out the overview of your clients.
                </Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  Analysis
                </Heading>
                <Text pt="2" fontSize="sm">
                  See a detailed analysis of all your business clients.
                </Text>
              </Box>
            </Stack>
          </CardBody>
        </Card> */}
      </Box>

      {/* <Box mt={6} px={4}>
        <Heading size="md">Πηγές</Heading>
      </Box> */}
    </Layout>
  );
};

export default ExplainBusiness;
