import {
  Box,
  Heading,
  Text,
  Menu,
  MenuButton,
  Button,
  Flex,
  MenuOptionGroup,
  MenuItemOption,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  MenuList,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

export const Content = ({ text, ...rest }) => {
  return (
    <Heading
      as="h3"
      size={["sm", "md", "lg"]}
      position="relative"
      fontWeight="400"
      color="gray.400"
      {...rest}
    >
      {text}
    </Heading>
  );
};

export const ContentWithDrawer = ({ name, options = [], onChange }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOnChange = (value) => {
    onChange(value);
    onClose();
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        onClick={onOpen}
        rightIcon={<ChevronDownIcon />}
        background="transparent"
        ml={2}
        borderBottom="1px"
        borderRadius={0}
        height={["auto", "2.5rem"]}
        p={["6px 0", "1rem"]}
        _hover={{
          background: "transparent",
        }}
        _active={{
          background: "transparent",
        }}
        _focus={{
          background: "transparent",
          outline: 0,
        }}
      >
        <Heading
          as="h3"
          size={["sm", "md", "lg"]}
          position="relative"
          fontWeight="600"
          color="gray.700"
          minW="100px"
        >
          {name.toLowerCase()}
        </Heading>
      </MenuButton>

      <Drawer placement="bottom" onClose={onClose} isOpen={isOpen} size="xl">
        <DrawerOverlay />
        <DrawerContent borderRadius={8} padding={4}>
          <Flex width="full" justifyContent="center">
            <Box
              height="4px"
              width="40px"
              background="#E1E6EB"
              borderRadius="20px"
              mb={3}
            />
          </Flex>

          <Text color="gray.400" fontSize="xs" py={1}>
            Επίλεξε...
          </Text>

          <MenuOptionGroup onChange={handleOnChange} defaultValue={name}>
            {options.map((option) => (
              <MenuItemOption py={3} value={option} key={option}>
                {option}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </DrawerContent>
      </Drawer>
    </Menu>
  );
};

export const ContentWithMenu = ({ name, options = [], onChange, menuTitle }) => {
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon fontSize="24px" />}
        background="transparent"
        ml={2}
        borderBottom="1px"
        borderRadius={0}
        height={["auto", "2.5rem"]}
        p={["6px 0", "1rem"]}
      >
        <Heading
          as="h3"
          size={["sm", "md", "lg"]}
          position="relative"
          fontWeight="600"
          color="gray.700"
          minW="100px"
        >
          {name.toLowerCase()}
        </Heading>
      </MenuButton>
      <MenuList>
        <MenuOptionGroup onChange={onChange} defaultValue={name}>
          <MenuItemOption value="" isDisabled>
            <Text>{menuTitle}</Text>
          </MenuItemOption>
          {options.map((option) => (
            <MenuItemOption value={option} key={option}>
              {option}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};
