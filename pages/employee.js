import { Box, useMediaQuery } from "@chakra-ui/react";
import { Navigation } from "components/navigation";
import { Layout } from "components/layout";
import MobileEmployeeView from "views/MobileEmployeeView";
import EmployeeView from "views/EmployeeView";

const Employee = () => {
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
        {isMobile ? <MobileEmployeeView /> : <EmployeeView />}
      </Box>
    </Layout>
  );
};

export default Employee;
