import {
  Button,
  Flex,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useMediaQuery,
  Hide,
  Heading,
  Box,
  Tooltip,
} from "@chakra-ui/react";
import Head from "next/head";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import logo from "../../assets/taxemu.svg";
import Image from "next/image";
import { useRouter } from "next/router";
import { useStore } from "store";
import {
  IntroCore,
  BusinessSecondStep,
  MobileIntroCore,
  MobileBusinessSecondStep,
} from "../../components/welcome";
import githubLogo from "assets/github.svg";

const desktopTabs = {
  intro: <IntroCore />,
  later: <BusinessSecondStep />,
};

const mobileTabs = {
  intro: <MobileIntroCore />,
  later: <MobileBusinessSecondStep />,
};

const tagStyles = {
  fontSize: "14px",
  marginTop: "6px",
  fontWeight: 400,
  color: "#A0AEC0",
};

const Welcome = () => {
  const details = useStore((state) => state.welcomeDetails);
  const router = useRouter();
  const currentTab = router.query.tab;
  const [isLargerThan30] = useMediaQuery("(min-width: 30em)");
  const tabs = isLargerThan30 ? desktopTabs : mobileTabs;

  const isBusiness = details.entity === "business";
  const finalTabs = isBusiness
    ? Object.keys(tabs)
    : Object.keys(tabs).slice(0, -1);
  const makeTabs = Object.fromEntries(
    Object.entries(tabs).filter(([key]) => finalTabs.includes(key))
  );

  const tabNames = Object.keys(makeTabs);
  const tabComponents = Object.values(makeTabs);
  const tabIndex = Math.max(tabNames.indexOf(currentTab), 0);

  return (
    <>
      <Head>
        <title>
          Taxemu - Υπολογισμός καθαρού ή μικτού μισθού μισθωτού ή ατομικής
          επιχείρησης
        </title>
        <meta
          name="description"
          content="Το Taxemu είναι ενα open-source εργαλείο για να μπορείς να έχεις μια εικόνα των εξόδων και κρατήσεων της ατομικής σου επιχείρησης"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex
        minH="100vh"
        px={{ base: "1rem", md: "5rem" }}
        py={{ base: "2.5rem", md: "1.5rem" }}
        background="#E5E5E5"
        direction="column"
        alignItems="start"
      >
        <Flex justifyContent="space-between" width="100%">
          <Flex flexDirection="column">
            <Image src={logo} alt="Taxemu" />
            <Heading
              as="h2"
              size="3xl"
              position="relative"
              data-testid="heading"
              display="inherit"
            >
              <span style={tagStyles}>Alpha Version</span>
            </Heading>
          </Flex>

          <Box>
            <Tooltip
              label="Contribute or file an issue. Do it!"
              aria-label="Contribute or file an issue. Do it!"
            >
              <a
                href="https://github.com/raptisj/taxemu"
                target="_blank"
                rel="noreferrer"
              >
                <Image src={githubLogo} alt="Github" width={26} height={26} />
              </a>
            </Tooltip>
          </Box>
        </Flex>

        <Tabs index={tabIndex}>
          <TabPanels>
            {tabComponents.map((comp) => (
              <TabPanel key={comp.type} p={0}>
                {comp}
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
                  ? "/"
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
            onClick={() => router.push("/")}
          >
            Απ’ευθείας στον υπολογιστή φόρου
          </Button>
        )}
      </Flex>
    </>
  );
};

export default Welcome;
