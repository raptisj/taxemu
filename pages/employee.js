import { useMediaQuery } from "@chakra-ui/react";
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
      {isMobile ? <MobileEmployeeView /> : <EmployeeView />}
    </Layout>
  );
};

export default Employee;
