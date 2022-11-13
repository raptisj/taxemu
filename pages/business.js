import { useMediaQuery } from "@chakra-ui/react";
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
      {isMobile ? <MobileBusinessView /> : <BusinessView />}
    </Layout>
  );
};

export default Business;
