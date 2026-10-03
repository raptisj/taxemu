import {
  Flex,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { useStore } from "store";
import logo from "../../assets/taxemu.svg";
import Image from "next/image";
import { useEffect } from "react";
import { DownloadIcon, HamburgerIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { Wiki } from "../../features";
import { useRouter } from "next/router";
import { useCalculatorSwitch } from "../../hooks/useCalculatorSwitch";
import CalculatorSwitchDialog from "./CalculatorSwitchDialog";
import {
  FEEDBACK_FORM_URL,
  SHOW_OFFER_COMPARISON_LINKS,
} from "../../constants";

const calculatorNavigationItems = [
  {
    href: "/employee",
    label: "Μισθωτοί",
    iconPath: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2",
    matches: (pathname) => pathname === "/employee",
  },
  {
    href: "/business",
    label: "Επαγγελματίες",
    iconPath: "M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M5 7h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2ZM3 12a20 20 0 0 0 18 0M12 12v3",
    matches: (pathname) => pathname === "/business",
  },
];

const mobileNavigationItems = [
  {
    href: "/blog",
    label: "Blog",
    iconPath: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6ZM14 3v6h6M8 13h8M8 17h6",
    matches: (pathname) => pathname.includes("/blog"),
  },
  {
    href: "/statistics",
    label: "Στατιστικά",
    iconPath: "M3 3v18h18M7 16v-5M12 16V7M17 16V4",
    matches: (pathname) => pathname === "/statistics",
  },
  {
    href: "/changelog",
    label: "Ενημερώσεις",
    iconPath: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2",
    matches: (pathname) => pathname === "/changelog",
  },
  {
    href: FEEDBACK_FORM_URL,
    label: "Η γνώμη σου",
    iconPath: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10ZM7 8h10M7 12h6",
    matches: () => false,
    external: true,
  },
  ...(SHOW_OFFER_COMPARISON_LINKS
    ? [
        {
          href: "/compare",
          label: "Σύγκριση",
          iconPath: "M3 7h18M17 3l4 4-4 4M21 17H3M7 13l-4 4 4 4",
          matches: (pathname) => pathname === "/compare",
        },
      ]
    : []),
];

export const Navigation = () => {
  const router = useRouter();
  const { requestCalculatorSwitch, dialogProps } = useCalculatorSwitch();

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

  const renderMobileNavigationItem = (item) => {
    const isActive = item.matches(router.pathname);
    return (
      <MenuItem
        as={Link}
        href={item.href}
        onClick={(event) => requestCalculatorSwitch(item.href.slice(1), event)}
        key={item.href}
        icon={
          <Icon
            viewBox="0 0 24 24"
            boxSize={4}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={item.iconPath} />
          </Icon>
        }
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noreferrer" : undefined}
        bg={isActive ? "purple.50" : "white"}
        color={isActive ? "purple.700" : "gray.700"}
        fontWeight={isActive ? "600" : "400"}
      >
        {item.label}
      </MenuItem>
    );
  };

  return (
    <>
      <CalculatorSwitchDialog {...dialogProps} />
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
            {!router.pathname.includes("/welcome") && (
              <Link href="/changelog">
                <Text
                  color={
                    router.pathname === "/changelog"
                      ? "purple.600"
                      : "gray.500"
                  }
                  fontSize={{ base: "sm", sm: "md" }}
                  fontWeight={router.pathname === "/changelog" ? "600" : "400"}
                  whiteSpace="nowrap"
                  _hover={{ color: "gray.700" }}
                >
                  Ενημερώσεις
                </Text>
              </Link>
            )}
            {!router.pathname.includes("/welcome") && (
              <Link
                href={FEEDBACK_FORM_URL}
                target="_blank"
                rel="noreferrer"
              >
                <Text
                  color="gray.500"
                  fontSize={{ base: "sm", sm: "md" }}
                  fontWeight="400"
                  whiteSpace="nowrap"
                  _hover={{ color: "gray.700" }}
                >
                  Η γνώμη σου
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
              {mobileNavigationItems.map(renderMobileNavigationItem)}
              {canInstallPWA && (
                <MenuItem
                  icon={<DownloadIcon boxSize={4} aria-hidden="true" />}
                  onClick={onClickInstallApp}
                >
                  Download
                </MenuItem>
              )}
              <MenuDivider />
              <MenuGroup title="Υπολογιστής">
                {calculatorNavigationItems.map(renderMobileNavigationItem)}
              </MenuGroup>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </>
  );
};
