import {
  Flex,
  Text,
  Hide,
  Tabs,
  TabPanel,
  TabPanels,
  useMediaQuery,
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
      isGrossAction ? calculateEmployee() : reverseCentralCalculation();
    } else {
      calculateBusiness();
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

      <Tabs index={tabIndex}>
        <TabPanels>
          {tabComponents.map((component) => (
            <TabPanel key={component.type} p={0}>
              {component}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      <Flex
        mt="64px"
        alignItems="center"
        width={{ base: "full", sm: "auto" }}
        flexDirection={{ base: "column-reverse", sm: "row" }}
      >
        {tabIndex > 0 && (
          <Stepper.NavigationButton
            mt={[2, 0]}
            text="Προηγούμενο"
            variant="outline"
            onClick={() =>
              router.push({
                query: { ...router.query, tab: tabNames[tabIndex - 1] },
              })
            }
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
        <Stepper.RedirectButton
          onClick={() => router.push(`/${calculatorType}`)}
          text="Απ’ευθείας στον υπολογιστή φόρου"
        />
      )}
    </Layout>
  );
};

export default Welcome;
