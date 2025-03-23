import { useMediaQuery, Box } from "@chakra-ui/react";
import { Navigation } from "components/navigation";
import { Layout } from "components/layout";
import MobileBusinessView from "views/MobileBusinessView";
import BusinessView from "views/BusinessView";

const Business = () => {
  const [isLargerThan30] = useMediaQuery("(min-width: 30em)");
  const isMobile = !isLargerThan30;

  return (
    <Layout>
      <Navigation />
      <Box
        px={{ base: "1rem", md: "5rem" }}
        maxWidth="1366px"
        mx="auto"
        width="100%"
      >
        {isMobile ? <MobileBusinessView /> : <BusinessView />}
      </Box>
    </Layout>
  );
};

export default Business;
