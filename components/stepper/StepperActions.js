import { Button } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";

export const NavigationButton = ({ onClick, text, ...rest }) => {
  return (
    <Button
      width={{ base: "full", sm: "auto" }}
      colorScheme="purple"
      mr={{ base: 0, sm: 3 }}
      onClick={onClick}
      {...rest}
    >
      {text}
    </Button>
  );
};

export const RedirectButton = ({ onClick, text, ...rest }) => {
  return (
    <Button
      width={{ base: "full", sm: "auto" }}
      mt={{ base: "initial", sm: "auto" }}
      rightIcon={<ArrowForwardIcon />}
      color="gray.700"
      background={{ base: "transparent", sm: "gray.200" }}
      onClick={onClick}
      {...rest}
    >
      {text}
    </Button>
  );
};
