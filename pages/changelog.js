import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Badge,
  Box,
  Heading,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import { Layout } from "components/layout";
import { Navigation } from "components/navigation";
import { changelogEntries, isNewChangelogEntry } from "constants/changelog";

const title = "Ενημερώσεις - Taxemu";
const description = "Οι σημαντικότερες αλλαγές και βελτιώσεις του Taxemu.";

const formatMonth = (date) =>
  new Intl.DateTimeFormat("el-GR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}-01T00:00:00Z`));

export default function ChangelogPage() {
  const [today, setToday] = useState(null);

  useEffect(() => {
    let timer;

    const updateToday = () => {
      const now = new Date();
      setToday(now);
      const nextDay = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1
      );
      timer = setTimeout(updateToday, nextDay - now.getTime());
    };

    updateToday();
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <link rel="icon" href="/favicon.ico?v=3" />
      </Head>

      <Navigation />
      <Box
        px={{ base: "1rem", md: "5rem" }}
        py={{ base: 10, md: 16 }}
        maxWidth="820px"
        mx="auto"
        width="100%"
        position="relative"
        zIndex={1}
      >
        <Heading as="h1" fontSize={{ base: "3xl", md: "4xl" }}>
          Ενημερώσεις
        </Heading>
        <Text color="gray.600" mt={3} mb={{ base: 10, md: 12 }}>
          Οι σημαντικότερες νέες δυνατότητες και διορθώσεις του Taxemu.
        </Text>

        <VStack align="stretch" spacing={10}>
          {changelogEntries.map((entry) => (
            <Box as="section" key={entry.date}>
              <Heading as="h2" fontSize="lg" mb={3}>
                <time dateTime={entry.date}>{formatMonth(entry.date)}</time>
              </Heading>
              <UnorderedList spacing={2} ml={5} color="gray.700">
                {entry.items.map((item) => (
                  <ListItem key={`${item.date}-${item.text}`}>
                    {item.text}
                    {today && isNewChangelogEntry(item, today) && (
                      <Badge colorScheme="green" ml={2} verticalAlign="middle">
                        Νέο
                      </Badge>
                    )}
                  </ListItem>
                ))}
              </UnorderedList>
            </Box>
          ))}
        </VStack>
      </Box>
    </Layout>
  );
}
