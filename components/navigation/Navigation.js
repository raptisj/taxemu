import { Box, Flex, useMediaQuery } from "@chakra-ui/react";
import { useStore } from "store";
import logo from "../../assets/taxemu.svg";
import Image from "next/image";
import { useEffect } from "react";
import { DownloadIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { Wiki } from "../../features";

export const Navigation = () => {
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
    <Flex justifyContent="space-between" width="100%" zIndex={1}>
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
      </Flex>
    </Flex>
  );
};
