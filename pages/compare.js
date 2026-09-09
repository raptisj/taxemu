import Head from "next/head";
import { Box } from "@chakra-ui/react";
import { Layout } from "components/layout";
import { Navigation } from "components/navigation";
import { OfferComparison } from "features/offerComparison";

const title = "Σύγκριση μισθωτού και freelancer - Taxemu";
const description = "Σύγκρινε πρόταση μισθωτού με τιμολόγιο freelancer, καθαρό εισόδημα, εταιρικό κόστος, ασφάλιση, έξοδα και φόρους.";

export default function ComparePage() {
  return (
    <Layout>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>
      <Navigation />
      <Box px={{ base: "1rem", md: "5rem" }} maxWidth="1366px" mx="auto" width="100%">
        <OfferComparison />
      </Box>
    </Layout>
  );
}
