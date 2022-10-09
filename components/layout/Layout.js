import { Flex } from "@chakra-ui/react";
import { Meta } from "../meta";

export const Layout = ({ children }) => {
  return (
    <>
      <Meta />

      <Flex
        minH="100vh"
        px={{ base: "1rem", md: "5rem" }}
        py={{ base: "2.5rem", md: "1.5rem" }}
        direction="column"
        alignItems="start"
      >
        {children}
      </Flex>
    </>
  );
};
