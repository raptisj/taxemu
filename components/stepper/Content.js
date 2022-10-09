import { Heading } from "@chakra-ui/react";

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
