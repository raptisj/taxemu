import {
  Flex,
  Text,
  Box,
  Hide,
  Tabs,
  TabPanel,
  TabPanels,
  useMediaQuery,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Button,
} from "@chakra-ui/react";
import {
  IntroCore,
  BusinessSecondStep,
  MobileIntroCore,
  MobileBusinessSecondStep,
} from "../components/welcome";
import welcomeEbook from "../assets/welcome-ebook.png";
import { useStore } from "store";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Stepper from "components/stepper";
import { Layout } from "../components/layout";
import { Navigation } from "../components/navigation";
import { useCalculateBusiness, useCalculateEmployee } from "hooks";
import Image from "next/image";

const desktopTabs = {
  intro: <IntroCore />,
  later: <BusinessSecondStep />,
};

const mobileTabs = {
  intro: <MobileIntroCore />,
  later: <MobileBusinessSecondStep />,
};

const ActionButtons = ({ tabIndex, onClick, onNext, onClickRedirection }) => {
  return (
    <>
      <Flex
        mt="64px"
        alignItems="center"
        flexDirection={{ base: "column-reverse", sm: "row" }}
        width="100%"
        mx="auto"
      >
        {tabIndex > 0 && (
          <Stepper.NavigationButton
            mt={[2, 0]}
            text="Προηγούμενο"
            variant="outline"
            onClick={onClick}
          />
        )}
        <Stepper.NavigationButton
          text="Επόμενο"
          background="purple.600"
          onClick={onNext}
        />
        <Hide below="sm">
          <Text color="gray.400" ml={4}>
            ή πάτα Enter
          </Text>
        </Hide>
      </Flex>

      {tabIndex === 0 && (
        <Box width="100%" mt="auto" mx="auto">
          <Stepper.RedirectButton
            onClick={onClickRedirection}
            text="Απ’ευθείας στον υπολογιστή φόρου"
          />
        </Box>
      )}
    </>
  );
};

const boxStyles = {
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  p: 3,
};

const WrapperBox = ({ children, condition }) => {
  return condition ? <Box {...boxStyles}>{children}</Box> : children;
};

const Welcome = () => {
  const calculatorType = useStore((state) => state.userDetails.calculatorType);
  const router = useRouter();
  const currentTab = router.query.tab;
  const [isLargerThan30] = useMediaQuery("(min-width: 30em)");
  const { centralCalculation: calculateBusiness } = useCalculateBusiness();
  const { centralCalculation: calculateEmployee, reverseCentralCalculation } =
    useCalculateEmployee();
  const employeeDetails = useStore((state) => state.userDetails.employee);

  const { activeInput } = employeeDetails;
  const isGrossAction = activeInput === "gross";

  const tabs = isLargerThan30 ? desktopTabs : mobileTabs;

  const isBusiness = calculatorType === "business";
  const finalTabs = isBusiness
    ? Object.keys(tabs)
    : Object.keys(tabs).slice(0, -1);
  const makeTabs = Object.fromEntries(
    Object.entries(tabs).filter(([key]) => finalTabs.includes(key))
  );

  const tabNames = Object.keys(makeTabs);
  const tabComponents = Object.values(makeTabs);
  const tabIndex = Math.max(tabNames.indexOf(currentTab), 0);

  useEffect(() => {
    function handleRoute(e) {
      if (e.which === 13) {
        // trigger calculation action
        if (tabIndex === tabNames.length - 1) {
          isGrossAction ? calculateEmployee() : reverseCentralCalculation();
        }

        // redirect in page of entity
        router.push(
          tabIndex === tabNames.length - 1
            ? `/${calculatorType}`
            : { query: { ...router.query, tab: tabNames[tabIndex + 1] } }
        );
      }
    }

    window.addEventListener("keyup", handleRoute);

    return () => {
      window.removeEventListener("keyup", handleRoute);
    };
  }, [tabNames, tabIndex, router, calculatorType]);

  const onNext = () => {
    // check if it has one screen which means its employee screen
    if (tabIndex === tabNames.length - 1) {
      if (isBusiness) {
        calculateBusiness();
      } else {
        isGrossAction ? calculateEmployee() : reverseCentralCalculation();
      }
    }

    router.push(
      tabIndex === tabNames.length - 1
        ? `/${calculatorType}`
        : { query: { ...router.query, tab: tabNames[tabIndex + 1] } }
    );
  };

  const trackEbookButtonClick = (deviceType = "desktop") => {
    if (typeof window !== "undefined") {
      window.gtag("event", "click_ebook", {
        event_category: "Ebook",
        event_label:
          "Clicked to learn more about the ebook - from welcome card",
        device_type: deviceType,
      });
    }
  };

  const onClickLink = (deviceType = "desktop") => {
    trackEbookButtonClick(deviceType);
    window.open("https://taxemu.gumroad.com/l/odigos2025", "_blank");
  };

  return (
    <Layout pb={8}>
      <Navigation />
      <Grid
        gap={2}
        px={{ base: "1rem", md: "5rem" }}
        gridTemplateColumns={["1fr", "minmax(500px, 710px) 1fr"]}
        width="100%"
        maxWidth="1366px"
        margin="0 auto"
        height="calc(100vh - 88px)"
      >
        <GridItem display="flex" flexDirection="column">
          <Box maxWidth="1366px" mx="auto" width="100%" mt={[0, 20]}>
            <Tabs index={tabIndex}>
              <TabPanels>
                {tabComponents.map((component) => (
                  <TabPanel key={component.type} p={0}>
                    {component}
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </Box>
          <WrapperBox condition={!isLargerThan30}>
            <ActionButtons
              tabIndex={tabIndex}
              onNext={onNext}
              onClickRedirection={() => router.push(`/${calculatorType}`)}
              onClick={() =>
                router.push({
                  query: { ...router.query, tab: tabNames[tabIndex - 1] },
                })
              }
            />
          </WrapperBox>
        </GridItem>

        <GridItem
          display={["none", "flex"]}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Card maxW="370px" minW="350px">
            <CardHeader>
              <Image src={welcomeEbook} alt="" style={{ margin: "0 auto" }} />
              <Heading fontSize="1.1rem" textAlign="center" fontWeight={600}>
                {" "}
                Πρώτη φορά διαπραγματεύεστε το μισθό σας;
              </Heading>
            </CardHeader>
            <CardBody py={0}>
              <Text textAlign="center" color="gray.700" fontSize=".9rem">
                Ο εξειδικευμένος οδηγός μας μπορεί να σας βοηθήσει να
                μεγιστοποιήσετε την προσφορά σας.
              </Text>
            </CardBody>
            <CardFooter>
              <Button width="full" variant="outline" onClick={onClickLink}>
                Δείτε πως
              </Button>
            </CardFooter>
          </Card>
        </GridItem>
      </Grid>
    </Layout>
  );
};

export default Welcome;
