import {
  Box,
  Button,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { DownloadIcon, RepeatClockIcon } from "@chakra-ui/icons";
import { usePersonalCalculationPdf } from "features/pdf";
import { useYearComparisonActions } from "features/yearComparison";

const useResultsActions = (entity) => {
  const comparison = useYearComparisonActions(entity);
  const pdf = usePersonalCalculationPdf(entity);
  return { ...comparison, ...pdf };
};

const MoreOptionsIcon = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <circle cx="5" cy="12" r="1.8" fill="currentColor" />
    <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    <circle cx="19" cy="12" r="1.8" fill="currentColor" />
  </Icon>
);

export const ResultsActionsMenu = ({ entity }) => {
  const {
    handleDownload,
    isDisabled,
    isGenerating,
    isOpen,
    toggleComparison,
    tooltip,
  } = useResultsActions(entity);

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={IconButton}
        aria-label="Περισσότερες ενέργειες"
        icon={<MoreOptionsIcon boxSize={5} />}
        size="sm"
        variant="outline"
        colorScheme="purple"
      />
      <MenuList minW="230px">
        <MenuItem icon={<RepeatClockIcon />} onClick={toggleComparison}>
          {isOpen ? "Κλείσιμο σύγκρισης" : "Σύγκριση ετών"}
        </MenuItem>
        <MenuItem
          icon={<DownloadIcon />}
          aria-label="Εξαγωγή προσωπικού υπολογισμού σε PDF"
          isDisabled={isDisabled || isGenerating}
          onClick={handleDownload}
          title={tooltip}
        >
          {isGenerating ? "Δημιουργία PDF…" : "Εξαγωγή PDF"}
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export const MobileResultsActionsMenu = ({ entity }) => {
  const { isOpen: isDrawerOpen, onOpen, onClose } = useDisclosure();
  const {
    handleDownload,
    isDisabled,
    isGenerating,
    isOpen: isComparisonOpen,
    toggleComparison,
    tooltip,
  } = useResultsActions(entity);

  const handleComparison = async () => {
    onClose();
    await toggleComparison();
  };

  const handlePdf = async () => {
    await handleDownload();
    onClose();
  };

  return (
    <>
      <IconButton
        aria-label="Περισσότερες ενέργειες"
        icon={<MoreOptionsIcon boxSize={5} />}
        size="sm"
        variant="outline"
        colorScheme="purple"
        onClick={onOpen}
      />

      <Drawer
        placement="bottom"
        onClose={onClose}
        isOpen={isDrawerOpen}
        size="xl"
      >
        <DrawerOverlay />
        <DrawerContent borderTopRadius="xl" padding={4}>
          <Flex width="full" justifyContent="center">
            <Box
              height="4px"
              width="40px"
              background="gray.200"
              borderRadius="full"
              mb={3}
            />
          </Flex>
          <Text color="gray.500" fontSize="xs" pb={2}>
            Ενέργειες
          </Text>
          <Stack spacing={1}>
            <Button
              justifyContent="flex-start"
              variant="ghost"
              leftIcon={<RepeatClockIcon />}
              onClick={handleComparison}
            >
              {isComparisonOpen ? "Κλείσιμο σύγκρισης" : "Σύγκριση ετών"}
            </Button>
            <Button
              aria-label="Εξαγωγή προσωπικού υπολογισμού σε PDF"
              justifyContent="flex-start"
              variant="ghost"
              leftIcon={<DownloadIcon />}
              isDisabled={isDisabled}
              isLoading={isGenerating}
              loadingText="Δημιουργία PDF…"
              onClick={handlePdf}
              title={tooltip}
            >
              Εξαγωγή PDF
            </Button>
          </Stack>
        </DrawerContent>
      </Drawer>
    </>
  );
};
