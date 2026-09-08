import Head from "next/head";
import { Box } from "@chakra-ui/react";
import { Layout } from "components/layout";
import { Navigation } from "components/navigation";
import { OecdTaxWedge } from "features/statistics/OecdTaxWedge";

const title = "Στατιστικά φορολογίας εργασίας - Taxemu";
const description =
  "Σύγκριση της φορολογικής επιβάρυνσης της εργασίας στην Ελλάδα και τον ΟΟΣΑ, με επίσημα στοιχεία του ΟΟΣΑ.";

export default function StatisticsPage() {
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
        maxWidth="1100px"
        mx="auto"
        width="100%"
      >
        <OecdTaxWedge />
      </Box>
    </Layout>
  );
}
