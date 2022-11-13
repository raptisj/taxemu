import { useEffect } from "react";
import {
  Flex,
  Text,
  Hide,
  Tabs,
  TabPanel,
  TabPanels,
  useMediaQuery,
} from "@chakra-ui/react";
import { useStore } from "store";
import { useRouter } from "next/router";
import {
  IntroCore,
  BusinessSecondStep,
  MobileIntroCore,
  MobileBusinessSecondStep,
} from "../components/welcome";
import { Navigation } from "../components/navigation";
import { Layout } from "../components/layout";
import Stepper from "components/stepper";

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
    window.addEventListener("keyup", (e) => {
      if (e.which === 13) {
        router.push(
          tabIndex === tabNames.length - 1
            ? `/${calculatorType}`
            : { query: { ...router.query, tab: tabNames[tabIndex + 1] } }
        );
      }
    });
  }, [tabNames, tabIndex, router, calculatorType]);

  return (
    <Layout>
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
          onClick={() =>
            router.push(
              tabIndex === tabNames.length - 1
                ? `/${calculatorType}`
                : { query: { ...router.query, tab: tabNames[tabIndex + 1] } }
            )
          }
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
