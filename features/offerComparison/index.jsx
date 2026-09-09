import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Text,
  useToast,
} from "@chakra-ui/react";
import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import {
  calculateOfferComparison,
  createDefaultOfferComparisonInput,
  parseOfferComparisonInput,
  serializeOfferComparisonInput,
} from "../../utils/offerComparison";
import { ComparisonForm } from "./ComparisonForm";
import { ComparisonResults } from "./ComparisonResults";

export const OfferComparison = () => {
  const router = useRouter();
  const toast = useToast();
  const hydrated = useRef(false);
  const [input, setInput] = useState(createDefaultOfferComparisonInput);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!router.isReady || hydrated.current) return;
    hydrated.current = true;
    const value = Array.isArray(router.query.offer)
      ? router.query.offer[0]
      : router.query.offer;
    const shared = parseOfferComparisonInput(value);
    if (shared) setInput(shared);
  }, [router.isReady, router.query.offer]);

  const comparison = useMemo(() => calculateOfferComparison(input), [input]);

  const share = async () => {
    const payload = serializeOfferComparisonInput(input);
    const query = { ...router.query, offer: payload };
    await router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
    const url = `${window.location.origin}${router.pathname}?offer=${encodeURIComponent(payload)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      toast({ title: "Ο σύνδεσμος αντιγράφηκε", status: "success", duration: 1800, position: "top" });
    } catch {
      toast({ title: "Ο σύνδεσμος είναι έτοιμος στη γραμμή διεύθυνσης", status: "info", duration: 2500, position: "top" });
    }
  };

  return (
    <Box pb={16} pt={{ base: 7, md: 12 }}>
      <Flex justify="space-between" align={{ base: "start", sm: "end" }} direction={{ base: "column", sm: "row" }} gap={4} mb={8} position="relative" zIndex={1}>
        <Box maxW="720px">
          <Text color="purple.600" fontSize="xs" fontWeight="800" letterSpacing=".12em">ΣΥΓΚΡΙΣΗ ΠΡΟΣΦΟΡΩΝ</Text>
          <Heading as="h1" fontSize={{ base: "2xl", md: "4xl" }} mt={2}>Μισθωτός ή freelancer;</Heading>
          <Text color="gray.600" mt={3}>Σύγκρινε το πραγματικό καθαρό εισόδημα και το κόστος εταιρείας με τις ίδιες φορολογικές παραδοχές.</Text>
        </Box>
        <Button leftIcon={copied ? <CheckIcon /> : <CopyIcon />} colorScheme="purple" variant="outline" onClick={share} flexShrink={0}>{copied ? "Αντιγράφηκε" : "Κοινοποίηση"}</Button>
      </Flex>

      <Grid templateColumns={{ base: "1fr", xl: "minmax(340px, 430px) minmax(0, 1fr)" }} gap={6} alignItems="start">
        <ComparisonForm input={input} setInput={setInput} />
        <ComparisonResults comparison={comparison} input={input} />
      </Grid>
    </Box>
  );
};
