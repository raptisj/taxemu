import { Text } from "@chakra-ui/react";

export const CreditsFooter = () => {
  return (
    <Text fontSize="sm" color="gray.500">
      Coding by{" "}
      <a
        href="https://twitter.com/JohnRaptisM"
        target="_blank"
        rel="noreferrer"
        style={{ color: "#805ad5" }}
      >
        John Raptis
      </a>{" "}
      & Design/UX by{" "}
      <a
        href="https://www.linkedin.com/in/thanos-dimitriou/"
        target="_blank"
        rel="noreferrer"
        style={{ color: "#805ad5" }}
      >
        Thanos Dimitriou
      </a>
    </Text>
  );
};
