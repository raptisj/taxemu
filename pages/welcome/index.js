import {
  Button,
  Flex,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useMediaQuery,
  Hide,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useStore } from "store";
import {
  IntroCore,
  BusinessSecondStep,
  MobileIntroCore,
  MobileBusinessSecondStep,
} from "../../components/welcome";
import { Navigation } from "../../components/navigation";
import { Layout } from "../../components/layout";
import { useEffect } from "react";

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
          <Button
            width={{ base: "full", sm: "auto" }}
            colorScheme="purple"
            variant="outline"
            mr={{ base: 0, sm: 3 }}
            onClick={() =>
              router.push({
                query: { ...router.query, tab: tabNames[tabIndex - 1] },
              })
            }
          >
            Προηγούμενο
          </Button>
        )}
        <Button
          width={{ base: "full", sm: "auto" }}
          colorScheme="purple"
          background="purple.600"
          mb={{ base: 3, sm: 0 }}
          onClick={() =>
            router.push(
              tabIndex === tabNames.length - 1
                ? `/${calculatorType}`
                : { query: { ...router.query, tab: tabNames[tabIndex + 1] } }
            )
          }
        >
          Επόμενο
        </Button>
        <Hide below="sm">
          <Text color="gray.400" ml={4}>
            ή πάτα Enter
          </Text>
        </Hide>
      </Flex>

      {tabIndex === 0 && (
        <Button
          width={{ base: "full", sm: "auto" }}
          mt={{ base: "initial", sm: "auto" }}
          rightIcon={<ArrowForwardIcon />}
          color="gray.700"
          background={{ base: "transparent", sm: "gray.200" }}
          onClick={() => router.push(`/${calculatorType}`)}
        >
          Απ’ευθείας στον υπολογιστή φόρου
        </Button>
      )}
    </Layout>
  );
};

export default Welcome;
