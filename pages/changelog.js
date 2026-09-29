import Head from "next/head";
import {
  Box,
  Heading,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import { Layout } from "components/layout";
import { Navigation } from "components/navigation";
import { changelogEntries } from "constants/changelog";

const title = "Ενημερώσεις - Taxemu";
const description = "Οι σημαντικότερες αλλαγές και βελτιώσεις του Taxemu.";

const formatDate = (date) =>
  new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

export default function ChangelogPage() {
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
                <time dateTime={entry.date}>{formatDate(entry.date)}</time>
              </Heading>
              <UnorderedList spacing={2} ml={5} color="gray.700">
                {entry.items.map((item) => (
                  <ListItem key={item}>{item}</ListItem>
                ))}
              </UnorderedList>
            </Box>
          ))}
        </VStack>
      </Box>
    </Layout>
  );
}
