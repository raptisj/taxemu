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
} from "@chakra-ui/react";
import {
  IntroCore,
  BusinessSecondStep,
  MobileIntroCore,
  MobileBusinessSecondStep,
} from "../components/welcome";
import { useStore } from "store";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Stepper from "components/stepper";
import { Layout } from "../components/layout";
import { Navigation } from "../components/navigation";
import { useCalculateBusiness, useCalculateEmployee } from "hooks";

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
        height={["calc(100vh - 190px)", "calc(100vh - 122px)"]}
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
      </Grid>
    </Layout>
  );
};

export default Welcome;
