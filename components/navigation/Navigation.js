import { Box, Flex, Heading, Tooltip, useMediaQuery } from "@chakra-ui/react";
import { useStore } from "store";
import logo from "../../assets/taxemu.svg";
import Image from "next/image";
import githubLogo from "assets/github.svg";
import { useEffect } from "react";
import { DownloadIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { Wiki } from "../../features";

const GO_BETA = false;
const VERSION = GO_BETA ? "Beta" : "Alpha";

const tagStyles = {
  fontSize: "14px",
  marginTop: "6px",
  fontWeight: 400,
  color: "#A0AEC0",
};

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
      <Link href="/welcome">
        <Flex flexDirection="column">
          <Image src={logo} alt="Taxemu" />
          <Heading
            as="h2"
            size="3xl"
            position="relative"
            data-testid="heading"
            display="inherit"
          >
            <span style={tagStyles}>{VERSION} Version</span>
          </Heading>
        </Flex>
      </Link>

      <Flex gap={4} alignItems="center">
        {canInstallPWA && (
          <Box onClick={onClickInstallApp}>
            {!isLargerThan30 && <DownloadIcon />}
          </Box>
        )}

        <Wiki />

        <Box height="30px">
          <Tooltip
            label="Contribute or file an issue. Do it!"
            aria-label="Contribute or file an issue. Do it!"
          >
            <a
              href="https://github.com/raptisj/taxemu"
              target="_blank"
              rel="noreferrer"
            >
              <Image src={githubLogo} alt="Github" width={26} height={26} />
            </a>
          </Tooltip>
        </Box>
      </Flex>
    </Flex>
  );
};
