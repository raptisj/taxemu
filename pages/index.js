import React from "react";
import { Box } from "@chakra-ui/react";
import { Meta } from "../components/meta";

export default function Home() {
  return (
    <>
      <Meta />

      <Box minH="100vh" pt={0} pb={12} px="2rem" className="container">
        <h1>Taxemu</h1>
      </Box>
    </>
  );
}
