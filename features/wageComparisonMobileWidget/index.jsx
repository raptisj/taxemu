import { Box, Text } from "@chakra-ui/react";
import { wageData2024 } from "constants";
import Image from "next/image";
import { useStore } from "store";
import { calculateComparisonPercentile } from "utils";
import chartImg from "assets/chart_1.png";

export const WageComparisonWidget = () => {
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
    <Box borderWidth={2} borderColor="#805ad5" borderRadius={6} p={3} mt={3}>
      <Box display="grid" gridTemplateColumns="2fr 1fr">
        <Text fontSize=".9rem">
          <strong>Μεγαλύτερος από το {myPercentile}%</strong> των μισθών στην
          Ελλάδα
        </Text>
        <Image src={chartImg} alt="Taxemu" />
      </Box>
    </Box>
  );
};
