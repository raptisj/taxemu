import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  StackDivider,
  Stack,
  Box,
  Text,
} from "@chakra-ui/react";

const ExplainerInfo = () => (
  <Card>
    <CardHeader>
      <Heading size="md">Επεξήγηση υπολογισμού ατομικής επιχείρησης</Heading>
    </CardHeader>

    <CardBody>
      <Stack divider={<StackDivider />} spacing="4">
        <Box>
          <Heading size="xs" textTransform="uppercase">
            Φορολογητεο εισοδημα
          </Heading>
          <Text pt="2" fontSize="sm" mb={3}>
            Το ποσό που φορολογείτε είναι ότι προκύπτει από το μικτό πλην την
            ασφάλιση και τα έξοδα.
          </Text>
          <Text as="i" fontSize="sm" color="purple">
            Παράδειγμα
          </Text>
          <Text pt="2" fontSize="sm">
            φορολογητέο εισόδημα = μικτό - ασφάλιση - εταιρικά έξοδα
          </Text>
        </Box>
        <Box>
          <Heading size="xs" textTransform="uppercase">
            Εξοδα επιχειρησης
          </Heading>
          <Text pt="2" fontSize="sm" mb={3}>
            Σαν εξοδο θεωρείται το ποσό πλην τον ΦΠΑ. Τυχόν λογιστική αμοιβη
            όπως και ο ΕΦΚΑ καταβάλονται και αυτά ως έξοδο.
          </Text>
        </Box>
        <Box>
          <Heading size="xs" textTransform="uppercase">
            προκαταβολη φορου
          </Heading>
          <Text pt="2" fontSize="sm" mb={3}>
            Προκαταβολή φόρου είναι το 55% το φόρου που θα πληρωσει κάποιος.
          </Text>
          <Text as="i" fontSize="sm" color="purple">
            Παράδειγμα
          </Text>
          <Text pt="2" fontSize="sm">
            σύυνολο φορου = φόρος + (φόρος * 0.55)
            <br />
            155 = 100 + (55)
          </Text>
        </Box>
        <Box>
          <Heading size="xs" textTransform="uppercase">
            εκπτωση στην προκαταβολη φορου
          </Heading>
          <Text pt="2" fontSize="sm" mb={3}>
            Για τα πρώτα 3 χρονια λειτουργείας τις επιχείρησης σας δικαιούστε
            έκπτωση 50% στην προκαταβολή φόρου.
          </Text>
          <Text as="i" fontSize="sm" color="purple">
            Παράδειγμα
          </Text>
          <Text pt="2" fontSize="sm">
            σύυνολο φορου = φόρος + ((φόρος * 0.55) * 0.5)
            <br />
            127.5 = 100 + (27.5)
          </Text>
        </Box>
      </Stack>
    </CardBody>
  </Card>
);

export default ExplainerInfo;
