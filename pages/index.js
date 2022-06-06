import React, { useEffect, useCallback } from "react";
import Head from "next/head";
import { useStore } from "../store";
import { Box, Grid, GridItem } from "@chakra-ui/react";
import IncomeTable from "../components/table";
import { OpeningHeader } from "../components/header";
import Form from "../components/form";

export default function Home() {
  const details = useStore((state) => state.userDetails);
  const addDetail = useStore((state) => state.addDetail);

  const { grossIncome, taxYearDuration } = details;

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
            (details.discountOptions.firstScaleDiscount ? 0.5 : 1)
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
    [details.discountOptions.firstScaleDiscount, addDetailWrapper]
  );

  useEffect(() => {
    handleGross((grossIncome / 12) * taxYearDuration);
  }, [handleGross, taxYearDuration, grossIncome]);

  return (
    <Box minH="100vh" py={0} px="2rem">
      <Head>
        <title>Taxemu</title>
        <meta
          name="description"
          content="Το Taxemu είναι ενα open-source εργαλείο για να μπορείς να έχεις μια εικόνα των εξόδων και κρατήσεων της ατομικής σου επιχείρησης"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <OpeningHeader />

        <Grid
          templateColumns=".7fr 1.3fr"
          gap={6}
          maxW="1000px"
          m="auto"
          mt={12}
          pb={24}
        >
          <GridItem>
            <Form.MainForm />
          </GridItem>

          <GridItem>
            <IncomeTable />
          </GridItem>
        </Grid>
      </main>
    </Box>
  );
}
