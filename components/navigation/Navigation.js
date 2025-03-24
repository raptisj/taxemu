import { Box, Flex, useMediaQuery } from "@chakra-ui/react";
import { useStore } from "store";
import logo from "../../assets/taxemu.svg";
import ebookDesktop from "../../assets/ebook-nav-desktop.png";
import ebookMobile from "../../assets/ebook-nav-mobile.png";
import Image from "next/image";
import { useEffect } from "react";
import { DownloadIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { Wiki } from "../../features";
import { useRouter } from "next/router";

export const Navigation = () => {
  const [isLargerThan30] = useMediaQuery("(min-width: 30em)");
  const update = useStore((state) => state.update);
  const canInstallPWA = useStore((state) => state.userDetails.canInstallPWA);
  const deferredPrompt = useStore((state) => state.userDetails.deferredPrompt);

  const router = useRouter();
  const currentParams = new URLSearchParams(router.query);
  const ENABLE_EBOOK = currentParams.get("enable_ebook");

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

  const trackEbookButtonClick = (deviceType = "desktop") => {
    if (typeof window !== "undefined") {
      window.gtag("event", "click_ebook", {
        event_category: "Ebook",
        event_label: "Clicked to buy ebook",
        device_type: deviceType,
      });
    }
  };

  const onClickLink = (deviceType = "desktop") => {
    // trackEbookButtonClick(deviceType);
    window.open("https://taxemu.gumroad.com/l/uiyfzl", "_blank");
  };

  return (
    <>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        zIndex={1}
        px={{ base: "1rem", md: "5rem" }}
        maxWidth="1366px"
        mx="auto"
      >
        <Flex gap={6} alignItems="flex-end">
          <Link href="/welcome">
            <Flex flexDirection="column">
              <Image src={logo} alt="Taxemu" />
            </Flex>
          </Link>
          {/* <Link href={""}>Blog</Link> */}
        </Flex>

        <Flex gap={4} alignItems="center">
          {canInstallPWA && (
            <Box onClick={onClickInstallApp}>
              {!isLargerThan30 && <DownloadIcon />}
            </Box>
          )}

          <Wiki />

          {isLargerThan30 && ENABLE_EBOOK && (
            <Box cursor="pointer" onClick={() => onClickLink("desktop")}>
              <Image src={ebookDesktop} alt="" style={{ width: "240px" }} />
            </Box>
          )}
        </Flex>
      </Flex>
      {!isLargerThan30 && ENABLE_EBOOK && (
        <Box cursor="pointer" mt={4} onClick={() => onClickLink("mobile")}>
          <Image src={ebookMobile} alt="" />
        </Box>
      )}
    </>
  );
};
