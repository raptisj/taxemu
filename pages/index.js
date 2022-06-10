import React, { useEffect, useCallback } from "react";
import Head from "next/head";
import { useStore } from "store";
import { Box, Grid, GridItem, Text, Tooltip } from "@chakra-ui/react";
import Table from "components/table";
import Header from "components/header";
import Form from "components/form";
import Image from "next/image";
import githubLogo from "assets/github-logo.png";

export default function Home() {
  const details = useStore((state) => state.userDetails);
  const addDetail = useStore((state) => state.addDetail);

  const {
    grossIncome,
    taxYearDuration,
    discountOptions,
    grossIncomeAfterBusinessExpenses,
  } = details;

  const SCALE_THRESHOLD = 10000;

  const addDetailWrapper = useCallback(
    (value) => {
      return addDetail({
        value,
        field: "grossIncomeAfterTax",
      });
    },
    [addDetail]
  );

  const handleGross = useCallback(
    (customGrossIncome) => {
      let amount = customGrossIncome;
      let scaleResult = 0;

      if (amount > SCALE_THRESHOLD) {
        amount -= SCALE_THRESHOLD;
        scaleResult = scaleResult + 900;
      } else {
        return addDetailWrapper(
          (amount * 0.09 + scaleResult) *
            (discountOptions.firstScaleDiscount ? 0.5 : 1)
        );
      }

      if (amount > SCALE_THRESHOLD) {
        amount -= SCALE_THRESHOLD;
        scaleResult = scaleResult + 2200;
      } else {
        return addDetailWrapper(amount * 0.22 + scaleResult);
      }

      if (amount > SCALE_THRESHOLD) {
        amount -= SCALE_THRESHOLD;
        scaleResult = scaleResult + 2800;
      } else {
        return addDetailWrapper(amount * 0.28 + scaleResult);
      }

      if (amount > SCALE_THRESHOLD) {
        amount -= SCALE_THRESHOLD;
        scaleResult = scaleResult + 3600;
      } else {
        return addDetailWrapper(amount * 0.36 + scaleResult);
      }

      return addDetailWrapper(amount * 0.44 + scaleResult);
    },
    [discountOptions.firstScaleDiscount, addDetailWrapper]
  );

  const calcTaxFrom = grossIncomeAfterBusinessExpenses
    ? grossIncome - grossIncomeAfterBusinessExpenses
    : grossIncome;

  useEffect(() => {
    handleGross((calcTaxFrom / 12) * taxYearDuration);
  }, [handleGross, taxYearDuration, grossIncome, calcTaxFrom]);

  return (
    <Box minH="100vh" pt={0} pb={12} px="2rem" className="container">
      <Head>
        <title>Taxemu</title>
        <meta
          name="description"
          content="Το Taxemu είναι ενα open-source εργαλείο για να μπορείς να έχεις μια εικόνα των εξόδων και κρατήσεων της ατομικής σου επιχείρησης"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header.Hero />

        <Grid
          templateColumns=".7fr 1.3fr"
          gap={6}
          maxW="1000px"
          m="auto"
          mt={12}
          backgroundColor="#f3f3f3"
          p={4}
          pb={14}
          borderRadius="4px"
        >
          <GridItem>
            <Form.MainForm />
          </GridItem>

          <GridItem position="relative">
            <Tooltip
              label="Contribute or file an issue. Do it!"
              aria-label="Contribute or file an issue. Do it!"
            >
              <Box position="absolute" top="-50px" right="0">
                <a
                  href="https://github.com/raptisj/taxemu"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    src={githubLogo}
                    alt="Picture of the author"
                    width={26}
                    height={26}
                  />
                </a>
              </Box>
            </Tooltip>
              <Table.IncomeTable />
          </GridItem>
        </Grid>
      </main>

      <Box textAlign="center" p={4}>
        <Text fontSize="sm" color="gray.500">
          Made by{" "}
          <a
            href="https://twitter.com/JohnRaptisM"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#805ad5" }}
          >
            John Raptis
          </a>
        </Text>
      </Box>
    </Box>
  );
}
