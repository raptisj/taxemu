import { Box, Heading } from "@chakra-ui/react";

const tagStyles = {
  fontSize: "13px",
  position: "absolute",
  bottom: 0,
  fontWeight: 400,
  color: "#979797",
};

const HeroHeader = () => (
  <Box maxW="700px" m="auto" p={4} color="white" textAlign="center" py={14}>
    <Heading as="h2" size="3xl" position="relative">
      Taxemu <span style={tagStyles}>Alpha Version</span>
    </Heading>

    <p>
      Το <strong>Taxemu</strong> είναι ενα open-source εργαλείο για να μπορείς
      να έχεις μια εικόνα των εξόδων και κρατήσεων της ατομικής σου επιχείρησης.
      Ένας εύκολος τρόπος να υπολογίζεις και να διαχειρίζεσαι το εισόδημα σου.
    </p>
  </Box>
);

export default HeroHeader;
