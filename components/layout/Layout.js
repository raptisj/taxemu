import { Flex, Box, useMediaQuery } from "@chakra-ui/react";
import { Meta } from "../meta";
import bg from "../../assets/bg.png";
import bgMobile from "../../assets/bg-mobile.png";
import Image from "next/image";
import { useRouter } from "next/router";

export const Layout = ({ children, ...rest }) => {
  const [isLargerThan30] = useMediaQuery("(min-width: 30em)");
  const isMobile = !isLargerThan30;
  const router = useRouter();

  return (
    <>
      {!router.pathname.includes("/blog") && <Meta />}

      <Flex
        minH="100vh"
        pt={{ base: "2rem", md: "1.5rem" }}
        direction="column"
        alignItems="start"
        {...rest}
      >
        <Box position="fixed" right="0" top="-10px">
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
