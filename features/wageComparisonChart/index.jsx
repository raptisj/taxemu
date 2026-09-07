import { Badge, Box, Text, Heading, Link } from "@chakra-ui/react";
import { wageDistributions } from "constants";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "store";
import {
  calculateBinnedPercentile,
  getWageDistributionForYear,
} from "utils";

export const WageComparisonChart = () => {
  const userDetails = useStore((state) => state.userDetails.employee);

  const { grossIncomeMonthly, taxationYear } = userDetails;

  if (!grossIncomeMonthly) {
    return null;
  }

  const distribution = getWageDistributionForYear(
    taxationYear,
    wageDistributions,
  );
  const comparison = calculateBinnedPercentile(
    grossIncomeMonthly,
    distribution.bins,
  );
  const total = distribution.bins.reduce((sum, bin) => sum + bin.count, 0);
  const chartData = distribution.bins.map((bin) => ({
    ...bin,
    percentage: (bin.count / total) * 100,
  }));

  return (
    <Box borderWidth="1px" borderRadius="xl" bg="white" p={{ base: 4, md: 5 }}>
      <Badge colorScheme="purple" mb={2}>ΘΕΣΗ ΜΙΣΘΟΥ</Badge>
      <Heading as="h3" fontSize={{ base: "lg", md: "xl" }} color="gray.700">
        Υψηλότερος από {comparison.isLowerBound ? "τουλάχιστον " : "περίπου "}
        το {comparison.percentile}% των μικτών μισθών
      </Heading>
      <Text color="gray.500" fontSize="sm" mt={1}>
        Σύγκριση μικτού μηνιαίου μισθού {grossIncomeMonthly.toLocaleString("el-GR")}€
        με μισθωτούς ιδιωτικού δικαίου.
      </Text>
      {comparison.selectedBin && (
        <Text color="purple.700" fontSize="sm" fontWeight="600" mt={2}>
          Μισθολογικό εύρος: {comparison.selectedBin.label}
        </Text>
      )}

      <Box height={{ base: "210px", md: "240px" }} mt={4}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 4, left: -24, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={false} axisLine={false} />
            <YAxis tickFormatter={(value) => `${value}%`} fontSize={11} />
            <Tooltip
              formatter={(value) => [`${value.toFixed(2)}%`, "Εργαζόμενοι"]}
              labelFormatter={(label) => `Μικτές αποδοχές ${label}`}
            />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
              {chartData.map((bin) => (
                <Cell
                  key={bin.label}
                  fill={comparison.selectedBin?.label === bin.label ? "#805AD5" : "#D6BCFA"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Text fontSize="xs" color="gray.500">
        {distribution.isFallback
          ? `Δεν υπάρχουν ακόμη οριστικά στοιχεία για το ${distribution.requestedYear}. Χρησιμοποιούνται τα πιο πρόσφατα διαθέσιμα στοιχεία (${distribution.year}).`
          : `Στοιχεία ${distribution.year}. Η θέση είναι εκτίμηση μέσα στο αντίστοιχο μισθολογικό εύρος.`}
      </Text>
      <Link
        display="inline-block"
        mt={1}
        fontSize="xs"
        textDecoration="underline"
        color="gray.400"
        target="_blank"
        rel="noreferrer"
        href={distribution.sourceUrl}
      >
        Πηγή: {distribution.sourceName}
      </Link>
    </Box>
  );
};
