import { Flex, Heading, Box, Tooltip } from "@chakra-ui/react";
import logo from "../../assets/taxemu.svg";
import Image from "next/image";
import githubLogo from "assets/github.svg";

const tagStyles = {
    fontSize: "14px",
    marginTop: "6px",
    fontWeight: 400,
    color: "#A0AEC0",
  };

export const Navigation = () => {
  return (
    <Flex justifyContent="space-between" width="100%">
      <Flex flexDirection="column">
        <Image src={logo} alt="Taxemu" />
        <Heading
          as="h2"
          size="3xl"
          position="relative"
          data-testid="heading"
          display="inherit"
        >
          <span style={tagStyles}>Alpha Version</span>
        </Heading>
      </Flex>

      <Box>
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
  );
};
