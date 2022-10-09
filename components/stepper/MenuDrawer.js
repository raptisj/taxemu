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
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

export const MenuDrawer = ({ name, options = [], onChange, ...rest }) => {
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
        {...rest}
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
