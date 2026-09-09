import {
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useMediaQuery,
} from "@chakra-ui/react";
import { useStore } from "store";
import logo from "../../assets/taxemu.svg";
import Image from "next/image";
import { useEffect } from "react";
import { DownloadIcon, HamburgerIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { Wiki } from "../../features";
import { useRouter } from "next/router";
import { SHOW_OFFER_COMPARISON_LINKS } from "../../constants";

const mobileNavigationItems = [
  {
    href: "/blog",
    label: "Blog",
    matches: (pathname) => pathname.includes("/blog"),
  },
  {
    href: "/statistics",
    label: "Στατιστικά",
    matches: (pathname) => pathname === "/statistics",
  },
  ...(SHOW_OFFER_COMPARISON_LINKS
    ? [
        {
          href: "/compare",
          label: "Σύγκριση",
          matches: (pathname) => pathname === "/compare",
        },
      ]
    : []),
];

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
          <Flex
            display={{ base: "none", md: "flex" }}
            gap={5}
            alignItems="center"
          >
            {!router.pathname.includes("/welcome") && (
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
            )}
            {!router.pathname.includes("/welcome") && (
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
            )}
            {SHOW_OFFER_COMPARISON_LINKS && (
              <Link href="/compare">
                <Text
                  color={
                    router.pathname === "/compare"
                      ? "purple.600"
                      : "gray.500"
                  }
                  fontSize={{ base: "sm", sm: "md" }}
                  fontWeight={
                    router.pathname === "/compare" ? "600" : "400"
                  }
                  whiteSpace="nowrap"
                  _hover={{ color: "gray.700" }}
                >
                  Σύγκριση
                </Text>
              </Link>
            )}
          </Flex>
        </Flex>

        <Flex gap={4} alignItems="center">
          {canInstallPWA && (
            <Box onClick={onClickInstallApp}>
              {!isLargerThan30 && <DownloadIcon />}
            </Box>
          )}

          <Wiki />

          <Menu placement="bottom-end">
            <MenuButton
              as={IconButton}
              display={{ base: "inline-flex", md: "none" }}
              aria-label="Άνοιγμα μενού πλοήγησης"
              icon={<HamburgerIcon boxSize={5} />}
              size="sm"
              variant="ghost"
            />
            <MenuList minW="180px" zIndex={10}>
              {mobileNavigationItems.map((item) => {
                const isActive = item.matches(router.pathname);
                return (
                  <MenuItem
                    as={Link}
                    href={item.href}
                    key={item.href}
                    bg={isActive ? "purple.50" : "white"}
                    color={isActive ? "purple.700" : "gray.700"}
                    fontWeight={isActive ? "600" : "400"}
                  >
                    {item.label}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </>
  );
};
