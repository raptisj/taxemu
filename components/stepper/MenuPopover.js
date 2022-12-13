import {
  Heading,
  Text,
  Menu,
  MenuButton,
  Button,
  MenuOptionGroup,
  MenuItemOption,
  MenuList,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

export const MenuPopover = ({
  name,
  label = '',
  options = [],
  onChange,
  menuTitle,
  ...rest
}) => {
  return (
    <Menu>
      <MenuButton
        {...rest}
        as={Button}
        rightIcon={<ChevronDownIcon fontSize="24px" />}
        background="transparent"
        mr={2}
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
          {label.toLowerCase()}
        </Heading>
      </MenuButton>
      <MenuList>
        <MenuOptionGroup onChange={onChange} defaultValue={name}>
          <MenuItemOption value="" isDisabled>
            <Text>{menuTitle}</Text>
          </MenuItemOption>
          {options.map((option) => (
            <MenuItemOption value={option.value} key={option.value}>
              {option.text}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};
