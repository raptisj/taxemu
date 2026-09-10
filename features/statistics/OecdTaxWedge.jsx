import {
  Box,
  Flex,
  Grid,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { oecdTaxWedge2025 } from "../../constants/statistics";
import { inlineLinkStyles } from "../../styles/inlineLink";

const palette = {
  greece: "#6C63D5",
  oecd: "#B8B5D9",
  incomeTax: "#6C63D5",
  employeeContributions: "#9690DF",
  employerContributions: "#C7C4EE",
};

const formatNumber = (value) =>
  new Intl.NumberFormat("el-GR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);

const formatPercentage = (value) => `${formatNumber(value)}%`;

const formatMoney = (value) =>
  new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

const Eyebrow = ({ children }) => (
  <Text
    color="purple.500"
    fontSize="xs"
    fontWeight="700"
    letterSpacing="0.12em"
  >
    {children}
  </Text>
);

const Card = ({ children, ...rest }) => (
  <Box
    bg="whiteAlpha.900"
    border="1px solid"
    borderColor="purple.100"
    borderRadius="xl"
    boxShadow="0 12px 35px rgba(68, 62, 130, 0.08)"
    p={{ base: 5, md: 7 }}
    position="relative"
    zIndex={1}
    {...rest}
  >
    {children}
  </Box>
);

const CountryBar = ({ label, value, color }) => (
  <Box>
    <Flex justify="space-between" align="baseline" mb={2} gap={4}>
      <Text fontWeight="600">{label}</Text>
      <Text fontSize="xl" fontWeight="700">
        {formatPercentage(value)}
      </Text>
    </Flex>
    <Box h="12px" bg="gray.100" borderRadius="full" overflow="hidden">
      <Box
        h="100%"
        width={`${value}%`}
        bg={color}
        borderRadius="full"
        role="img"
        aria-label={`${label}: ${formatPercentage(value)}`}
      />
    </Box>
  </Box>
);

const CompositionBar = ({ country, values }) => {
  const parts = [
    {
      label: "Φόρος εισοδήματος",
      value: values.incomeTax,
      color: palette.incomeTax,
    },
    {
      label: "Εισφορές εργαζομένου",
      value: values.employeeContributions,
      color: palette.employeeContributions,
    },
    {
      label: "Εισφορές εργοδότη",
      value: values.employerContributions,
      color: palette.employerContributions,
    },
  ];
  return (
    <Box>
      <Flex justify="space-between" mb={3}>
        <Text fontWeight="700">{country}</Text>
        <Text color="gray.600">{formatPercentage(values.total)}</Text>
      </Flex>
      <Flex
        h="16px"
        overflow="hidden"
        borderRadius="full"
        bg="gray.100"
        role="img"
        aria-label={`Σύνθεση επιβάρυνσης: ${country}`}
      >
        {parts.map((part) => (
          <Box
            key={part.label}
            width={`${part.value}%`}
            bg={part.color}
            title={`${part.label}: ${formatPercentage(part.value)}`}
          />
        ))}
      </Flex>
      <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={3} mt={4}>
        {parts.map((part) => (
          <Flex key={part.label} gap={2} align="flex-start">
            <Box
              bg={part.color}
              borderRadius="sm"
              flex="0 0 auto"
              h="10px"
              mt="5px"
              w="10px"
            />
            <Box>
              <Text color="gray.600" fontSize="xs" lineHeight="short">
                {part.label}
              </Text>
              <Text fontSize="sm" fontWeight="700">
                {formatPercentage(part.value)}
              </Text>
            </Box>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
};

export const OecdTaxWedge = () => {
  const data = oecdTaxWedge2025;
  const difference = data.greece.total - data.oecd.total;

  return (
    <Stack spacing={{ base: 5, md: 7 }} pb={12}>
      <Box pt={{ base: 5, md: 10 }} position="relative" zIndex={1}>
        <Eyebrow>ΣΤΑΤΙΣΤΙΚΑ</Eyebrow>
        <Heading as="h1" fontSize={{ base: "2xl", md: "4xl" }} mt={2}>
          Ελλάδα και ΟΟΣΑ
        </Heading>
        <Text color="gray.600" maxW="700px" mt={3}>
          Πώς συγκρίνεται η φορολογική επιβάρυνση της εργασίας στην Ελλάδα
          με τον μέσο όρο του ΟΟΣΑ, με κοινές παραδοχές για όλες τις χώρες.
        </Text>
      </Box>

      <Card>
        <Eyebrow>ΦΟΡΟΛΟΓΙΑ ΕΡΓΑΣΙΑΣ</Eyebrow>
        <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} mt={2}>
          {data.referenceProfile}
        </Heading>
        <Text color="gray.500" fontSize="sm" mt={2}>
          Στοιχεία {data.year} · Δημοσίευση {data.publicationYear}
        </Text>

        <Stack spacing={5} mt={7}>
          <CountryBar
            label="Ελλάδα"
            value={data.greece.total}
            color={palette.greece}
          />
          <CountryBar
            label="Μέσος όρος ΟΟΣΑ"
            value={data.oecd.total}
            color={palette.oecd}
          />
        </Stack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mt={8}>
          <Box bg="purple.50" borderRadius="lg" p={4}>
            <Text color="gray.600" fontSize="sm">
              Διαφορά από τον μέσο όρο του ΟΟΣΑ
            </Text>
            <Text color="purple.700" fontSize="2xl" fontWeight="700">
              +{formatNumber(difference)} ποσοστιαίες μονάδες
            </Text>
          </Box>
          <Box bg="gray.50" borderRadius="lg" p={4}>
            <Text color="gray.600" fontSize="sm">
              Θέση της Ελλάδας
            </Text>
            <Text fontSize="2xl" fontWeight="700">
              {data.greece.rank}η / 38
            </Text>
          </Box>
          <Box bg="gray.50" borderRadius="lg" p={4}>
            <Text color="gray.600" fontSize="sm">
              Μέσος μικτός μισθός Ελλάδας
            </Text>
            <Text fontSize="2xl" fontWeight="700">
              {formatMoney(data.averageGrossWageGreece)}
            </Text>
            <Text color="gray.500" fontSize="xs">
              εκτίμηση ΟΟΣΑ για το {data.year}
            </Text>
          </Box>
        </Grid>
      </Card>

      <Card>
        <Eyebrow>ΣΥΝΘΕΣΗ ΕΠΙΒΑΡΥΝΣΗΣ</Eyebrow>
        <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} mt={2}>
          Από τι αποτελείται
        </Heading>
        <Text color="gray.600" fontSize="sm" mt={2}>
          Ποσοστό του συνολικού κόστους εργασίας για το ίδιο τυποποιημένο
          προφίλ.
        </Text>
        <Stack spacing={8} mt={7}>
          <CompositionBar country="Ελλάδα" values={data.greece} />
          <CompositionBar country="Μέσος όρος ΟΟΣΑ" values={data.oecd} />
        </Stack>
      </Card>

      <Box position="relative" zIndex={1}>
        <Eyebrow>ΤΥΠΙΚΑ ΝΟΙΚΟΚΥΡΙΑ</Eyebrow>
        <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} mt={2}>
          Η σύγκριση αλλάζει ανά οικογενειακό προφίλ
        </Heading>
        <Text color="gray.600" fontSize="sm" maxW="720px" mt={2}>
          Τα παραδείγματα του ΟΟΣΑ χρησιμοποιούν σταθερούς τύπους νοικοκυριών.
          Όπου υπάρχουν παιδιά, θεωρούνται δύο παιδιά ηλικίας 6–11 ετών.
        </Text>
        <Text color="gray.600" fontSize="sm" maxW="720px" mt={2}>
          Η αναφορά στον μέσο μισθό περιγράφει τις μικτές αποδοχές του
          παραδείγματος σε κάθε χώρα· δεν είναι φορολογικός συντελεστής ούτε
          κατάταξη μισθού.
        </Text>
        <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={4} mt={5}>
          {data.householdProfiles.map((profile) => (
            <Card key={profile.key} p={5}>
              <Heading as="h3" fontSize="md">
                {profile.title}
              </Heading>
              <Text color="gray.500" fontSize="sm" minH={{ lg: "42px" }} mt={1}>
                {profile.description}
              </Text>
              <Stack spacing={3} mt={5}>
                <Text
                  color="gray.500"
                  fontSize="xs"
                  fontWeight="700"
                  letterSpacing="0.04em"
                >
                  ΦΟΡΟΛΟΓΙΚΗ ΕΠΙΒΑΡΥΝΣΗ ΤΗΣ ΕΡΓΑΣΙΑΣ
                </Text>
                <Flex justify="space-between">
                  <Text color="gray.600">Ελλάδα</Text>
                  <Text fontWeight="700">{formatPercentage(profile.greece)}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.600">Μέσος όρος ΟΟΣΑ</Text>
                  <Text fontWeight="700">{formatPercentage(profile.oecd)}</Text>
                </Flex>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Box>

      <Card bg="gray.50">
        <Eyebrow>ΜΕΘΟΔΟΛΟΓΙΑ</Eyebrow>
        <Heading as="h2" fontSize={{ base: "lg", md: "xl" }} mt={2}>
          Τι μετρά η φορολογική επιβάρυνση
        </Heading>
        <Text color="gray.600" fontSize="sm" mt={3} maxW="780px">
          Είναι η διαφορά ανάμεσα στο συνολικό κόστος εργασίας για τον εργοδότη
          και στις καθαρές αποδοχές του εργαζομένου, ως ποσοστό του κόστους
          εργασίας. Περιλαμβάνει φόρο εισοδήματος και εισφορές εργοδότη και
          εργαζομένου, αφαιρώντας τις σχετικές παροχές σε χρήμα.
        </Text>
        <Text color="gray.600" fontSize="sm" mt={3} maxW="780px">
          Τα παραπάνω είναι συγκρίσιμα στατιστικά παραδείγματα και δεν
          χρησιμοποιούν τα στοιχεία που συμπληρώνεις στον υπολογιστή του Taxemu.
        </Text>
        <Flex gap={5} mt={5} wrap="wrap">
          <Link
            href={data.sources.greece}
            isExternal
            {...inlineLinkStyles}
            fontWeight="600"
          >
            Στοιχεία για την Ελλάδα <ExternalLinkIcon mx="2px" />
          </Link>
          <Link
            href={data.sources.report}
            isExternal
            {...inlineLinkStyles}
            fontWeight="600"
          >
            Ετήσια έκθεση ΟΟΣΑ <ExternalLinkIcon mx="2px" />
          </Link>
          <Link
            href={data.sources.methodology}
            isExternal
            {...inlineLinkStyles}
            fontWeight="600"
          >
            Μεθοδολογία ΟΟΣΑ <ExternalLinkIcon mx="2px" />
          </Link>
          <Link
            href={data.sources.dataExplorer}
            isExternal
            {...inlineLinkStyles}
            fontWeight="600"
          >
            Βάση δεδομένων ΟΟΣΑ <ExternalLinkIcon mx="2px" />
          </Link>
        </Flex>
      </Card>
    </Stack>
  );
};
