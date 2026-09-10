import { useState } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

export const SidebarSubSection = ({ children, title, ...rest }) => {
  return (
    <Box mt={6} {...rest}>
      <Text fontWeight="500" color="gray.500" fontSize="18px">
        {title}
      </Text>
      {children}
    </Box>
  );
};

export const SidebarSubSectionAccordion = ({
  children,
  title,
  isOpen,
  onToggle,
  ...rest
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof isOpen === "boolean";
  const showSection = isControlled ? isOpen : internalIsOpen;
  const toggleSection = () => {
    const nextIsOpen = !showSection;
    if (!isControlled) setInternalIsOpen(nextIsOpen);
    onToggle?.(nextIsOpen);
  };

  return (
    <Box mt={6} {...rest}>
      <Flex
        onClick={toggleSection}
        justifyContent="space-between"
        alignItems="center"
        cursor="pointer"
      >
        <Text fontWeight="500" color="gray.500" fontSize="18px">
          {title}
        </Text>
        <ChevronDownIcon
          fontSize={22}
          style={{
            transform: `rotate(${showSection ? "180deg" : "0"})`,
          }}
        />
      </Flex>
      {showSection && children}
    </Box>
  );
};
