import { Box, Text, Heading, Link } from "@chakra-ui/react";
import { wageData2024 } from "constants";
import {
  ReferenceLine,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";
import { useStore } from "store";
import { calculateComparisonPercentile } from "utils";

export const WageComparisonChart = () => {
  const userDetails = useStore((state) => state.userDetails.employee);

  const { finalIncomeMonthly } = userDetails;

  if (!finalIncomeMonthly) {
    return null;
  }
  const myPercentile = calculateComparisonPercentile(
    finalIncomeMonthly,
    wageData2024
  );

  return (
    <Box mt={8}>
      <Heading as="h2" fontSize="1rem" color="gray.700" ml={4}>
        Μεγαλύτερος από το {myPercentile}% των μισθών στην Ελλάδα
      </Heading>
      <Text color="gray.500" fontSize=".88rem" ml={4}>
        Καμπύλη πυκνότητας καθαρού μισθού ανά μήνα
      </Text>
      <AreaChart
        width={730}
        height={250}
        data={wageData2024}
        margin={{ top: 30, right: 20, left: -30, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          type="number"
          domain={["dataMin", "dataMax"]}
          interval={0}
          ticks={[0, 500, 750, 1000, 1500, 2000, 2500, 3000]}
        />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip
          formatter={(value) => `${value.toFixed(2)}%`}
          labelFormatter={(value) => `${value}€`}
        />
        <Area
          type="monotone"
          dataKey="percentage"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorUv)"
        />

        <ReferenceLine
          x={finalIncomeMonthly}
          stroke="#805ad5"
          strokeWidth={2}
          label={{
            value: `€${finalIncomeMonthly}`,
            position: "top",
            offset: 10,
          }}
        />
      </AreaChart>
      <Link
        fontSize=".7rem"
        textDecoration="underline"
        color="gray.400"
        target="_blank"
        href="https://www.ot.gr/wp-content/uploads/2025/02/%CE%94%CE%B5%CE%AF%CF%84%CE%B5-%CE%95%CE%94%CE%A9-%CF%84%CE%B7%CE%BD-%CE%AD%CE%BA%CE%B8%CE%B5%CF%83%CE%B7.pdf"
      >
        Υπουργείο Εργασίας & Κοινωνικής Ασφάλισης. Σελ 13, ΠΙΝΑΚΑΣ IΒ3
      </Link>
    </Box>
  );
};
