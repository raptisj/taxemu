import { useEffect } from "react";
import {
  Box,
  Flex,
  Icon,
  IconButton,
  Kbd,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import {
  isCalculateShortcut,
  isShortcutHelpKey,
} from "../../utils/keyboardShortcuts";

const KeyboardIcon = (props) => (
  <Icon viewBox="0 0 24 24" fill="none" {...props}>
    <rect
      x="2.5"
      y="5"
      width="19"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M6 9h.01M9 9h.01M12 9h.01M15 9h.01M18 9h.01M6 12h.01M9 12h.01M12 12h.01M15 12h.01M18 12h.01M7 15h10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Icon>
);

const ShortcutRow = ({ keys, label }) => (
  <Flex justify="space-between" align="center" gap={5} py={3}>
    <Text fontSize="sm">{label}</Text>
    <Box whiteSpace="nowrap">
      {keys.map((key, index) => (
        <span key={key}>
          {index > 0 && " + "}
          <Kbd>{key}</Kbd>
        </span>
      ))}
    </Box>
  </Flex>
);

const KeyboardShortcutsButton = ({ onCalculate, hideTrigger = false }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) return;
      if (isCalculateShortcut(event)) {
        event.preventDefault();
        onCalculate();
      } else if (isShortcutHelpKey(event)) {
        event.preventDefault();
        onOpen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCalculate, onOpen]);

  return (
    <>
      {!hideTrigger && (
        <Tooltip label="Συντομεύσεις πληκτρολογίου">
          <IconButton
            aria-label="Συντομεύσεις πληκτρολογίου"
            icon={<KeyboardIcon boxSize={5} aria-hidden="true" />}
            size="sm"
            variant="ghost"
            onClick={onOpen}
          />
        </Tooltip>
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Συντομεύσεις πληκτρολογίου</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={5}>
            <Stack
              divider={<Box borderTopWidth="1px" borderColor="gray.100" />}
              spacing={0}
            >
              <ShortcutRow keys={["Ctrl/⌘", "Enter"]} label="Υπολόγισε" />
              <ShortcutRow
                keys={["?"]}
                label="Άνοιγμα συντομεύσεων"
              />
              <ShortcutRow keys={["Esc"]} label="Κλείσιμο παραθύρου" />
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default KeyboardShortcutsButton;
