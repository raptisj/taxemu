import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Grid, Link, Stack, Text } from "@chakra-ui/react";
import { getTaxRules } from "../../rules";
import { engineerEstimateNote, formatContributionMoney } from "../../utils/employeeContributions";
import { inlineLinkStyles } from "../../styles/inlineLink";

export default function EmployeeContributionBreakdown({ breakdown, taxationYear }) {
  if (!breakdown) return null;
  const sources = getTaxRules(taxationYear).sources.filter((source) => breakdown.rows.some((row) => row.sourceUrls.includes(source.url)));
  return (
    <Accordion allowToggle mt={4} borderWidth="1px" borderColor="purple.200" borderRadius="lg">
      <AccordionItem border="none">
        <AccordionButton>
          <Box flex="1" textAlign="left" fontWeight="600" fontSize="sm">Ανάλυση ασφαλιστικών εισφορών μηχανικού</Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel px={3}>
          <Text fontSize="xs" color="gray.600" mb={3}>Επικουρική: {breakdown.supplementaryCategory}η κατηγορία · Εφάπαξ: {breakdown.lumpSumCategory}η · {breakdown.supplementaryFund === "teka" ? "ΤΕΚΑ" : "e-ΕΦΚΑ"}</Text>
          <Grid templateColumns="1.3fr 1fr 1fr" gap={2} fontSize="xs" fontWeight="600" mb={2}>
            <Text>Κλάδος</Text><Text textAlign="right">Εργαζόμενος</Text><Text textAlign="right">Εργοδότης</Text>
          </Grid>
          <Stack spacing={0}>
            {breakdown.rows.map((row) => (
              <Grid key={row.id} templateColumns="1.3fr 1fr 1fr" gap={2} borderTopWidth="1px" borderColor="gray.100" py={3} fontSize="xs">
                <Box>
                  <Text fontWeight="600">{row.label}</Text>
                  <Text color="gray.500" mt={1}>{row.kind === "fixed" ? `${row.category}η · ${breakdown.insuredMonths} μήνες` : `${(row.employeeRate * 100).toLocaleString("el-GR")}% / ${(row.employerRate * 100).toLocaleString("el-GR")}% · βάση ${formatContributionMoney(row.base)}`}</Text>
                </Box>
                {["employee", "employer"].map((payer) => (
                  <Box key={payer} textAlign="right">
                    <Text fontWeight="600">{formatContributionMoney(row[payer].year)}</Text><Text color="gray.500">/ έτος</Text>
                    <Text mt={1}>{formatContributionMoney(row[payer].ordinaryMonth)}</Text><Text color="gray.500">/ κανονικό μήνα</Text>
                  </Box>
                ))}
              </Grid>
            ))}
            <Grid templateColumns="1.3fr 1fr 1fr" gap={2} bg="purple.50" py={3} fontSize="xs" fontWeight="700">
              <Text>Ετήσιο σύνολο</Text><Text textAlign="right">{formatContributionMoney(breakdown.employee.year)}</Text><Text textAlign="right">{formatContributionMoney(breakdown.employer.year)}</Text>
            </Grid>
          </Stack>
          <Text fontSize="xs" color="gray.500" mt={3}>{engineerEstimateNote}</Text>
          <Text fontSize="xs" color="gray.500" mt={2}>Η ίση κατανομή της επικουρικής μπορεί να δίνει μισό λεπτό ανά πληρωτή· εμφανίζεται η ακριβής τιμή με τρία δεκαδικά. Ο τελικός επιμερισμός ανά μισθοδοσία μπορεί να διαφέρει κατά λίγα λεπτά.</Text>
          <Stack mt={3} spacing={2}>{sources.map((source) => <Link key={source.url} href={source.url} isExternal fontSize="xs" {...inlineLinkStyles}>{source.name}</Link>)}</Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
