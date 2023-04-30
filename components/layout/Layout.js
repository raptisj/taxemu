import { Flex, Box, useMediaQuery } from "@chakra-ui/react";
import { Meta } from "../meta";
import bg from "../../assets/bg.png";
import bgMobile from "../../assets/bg-mobile.png";
import Image from "next/image";

export const Layout = ({ children, ...rest }) => {
  const [isLargerThan30] = useMediaQuery("(min-width: 30em)");
  const isMobile = !isLargerThan30;

  return (
    <>
      <Meta />

      <Flex
        minH="100vh"
        px={{ base: "1rem", md: "5rem" }}
        pt={{ base: "2.5rem", md: "1.5rem" }}
        direction="column"
        alignItems="start"
        maxWidth="1366px"
        mx="auto"
        {...rest}
      >
        <Box position="fixed" right="0" top="0">
          <Image
            src={isMobile ? bgMobile : bg}
            alt=""
            width={isMobile ? "300px" : "600px"}
            height={isMobile ? "300px" : "600px"}
          />
        </Box>

        {children}
      </Flex>
    </>
  );
};
