import { Text, ListItem, UnorderedList } from "@chakra-ui/react";
import { useStore } from "store";

const Results = ({ monthlyValue }) => {
  const userDetails = useStore((state) => state.userDetails.business.quickCalc);
  const { currentWithholdingTax, currentAdditionalValueTax } = userDetails;

  const monthly = monthlyValue.toFixed(2);
  const monthlyTax = (monthlyValue * currentAdditionalValueTax).toFixed(2);
  const monthlyWithholding = (monthlyValue * currentWithholdingTax).toFixed(2);

  const askFor = (Number(monthly) + Number(monthlyTax)).toFixed(2);
  const grossAsReadIncome = (
    Number(monthly) - Number(monthlyWithholding)
  ).toFixed(2);

  return (
    <>
      <UnorderedList fontSize={["14px", "16px"]}>
        <ListItem>
          Μικτό μηνιαίο: <strong>{monthly}</strong>
        </ListItem>
        <ListItem>
          ΦΠΑ: <strong>{monthlyTax}</strong>
        </ListItem>
        <ListItem>
          Παρακράτηση: <strong>{monthlyWithholding}</strong>
        </ListItem>
      </UnorderedList>
      <Text mt={2} fontSize={["14px", "16px"]}>
        Ζητάς <strong>{askFor}</strong> και παίρνεις μικτό{" "}
        <strong>{grossAsReadIncome}</strong> το μηνα
      </Text>
    </>
  );
};

export { Results };
