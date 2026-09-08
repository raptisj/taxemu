import { Box, Flex, useMediaQuery, Text } from "@chakra-ui/react";
import { useStore } from "store";
import logo from "../../assets/taxemu.svg";
import Image from "next/image";
import { useEffect } from "react";
import { DownloadIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { Wiki } from "../../features";
import { useRouter } from "next/router";

export const Navigation = () => {
  const router = useRouter();

  const [isLargerThan30] = useMediaQuery("(min-width: 30em)");
  const update = useStore((state) => state.update);
  const canInstallPWA = useStore((state) => state.userDetails.canInstallPWA);
  const deferredPrompt = useStore((state) => state.userDetails.deferredPrompt);

  // PWA installtion link and to determine if it should be visible
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();

      update({
        canInstallPWA: true,
        deferredPrompt: e,
      });
    });

    window.addEventListener("appinstalled", () => {
      update({
        canInstallPWA: false,
        deferredPrompt: null,
      });
    });
  }, []);

  const onClickInstallApp = async () => {
    deferredPrompt.prompt();

    update({
      canInstallPWA: false,
      deferredPrompt: null,
    });
  };

  return (
    <>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        zIndex={2}
        px={{ base: "1rem", md: "5rem" }}
        maxWidth="1366px"
        mx="auto"
      >
        <Flex gap={{ base: 3, sm: 5, md: 6 }} alignItems="center" minW={0}>
          <Link href="/welcome">
            <Flex flexDirection="column">
              <Image src={logo} alt="Taxemu" />
            </Flex>
          </Link>
          {!router.pathname.includes("/welcome") && (
            <Flex gap={{ base: 3, sm: 5 }} alignItems="center">
              <Link href="/blog">
                <Text
                  color={
                    router.pathname.includes("/blog")
                      ? "purple.600"
                      : "gray.500"
                  }
                  fontSize={{ base: "sm", sm: "md" }}
                  fontWeight={router.pathname.includes("/blog") ? "600" : "400"}
                  whiteSpace="nowrap"
                  _hover={{ color: "gray.700" }}
                >
                  Blog
                </Text>
              </Link>
              <Link href="/statistics">
                <Text
                  color={
                    router.pathname === "/statistics"
                      ? "purple.600"
                      : "gray.500"
                  }
                  fontSize={{ base: "sm", sm: "md" }}
                  fontWeight={router.pathname === "/statistics" ? "600" : "400"}
                  whiteSpace="nowrap"
                  _hover={{ color: "gray.700" }}
                >
                  Στατιστικά
                </Text>
              </Link>
            </Flex>
          )}
        </Flex>

        <Flex gap={4} alignItems="center">
          {canInstallPWA && (
            <Box onClick={onClickInstallApp}>
              {!isLargerThan30 && <DownloadIcon />}
            </Box>
          )}

          <Wiki />
        </Flex>
      </Flex>
    </>
  );
};
