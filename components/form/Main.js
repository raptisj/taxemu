import { Box, Stack, Divider, Button } from "@chakra-ui/react";
import { Input, Radio } from "../input";
import { useStore } from "store";

const MainForm = () => {
  const details = useStore((state) => state.userDetails);
  const addDetail = useStore((state) => state.addDetail);
  const removeUserDetails = useStore((state) => state.removeUserDetails);

  const { isFullYear, grossIncome } = details;

  const primaryInputList = [
    {
      text: "Ετήσιος Μικτός μισθός",
      field: "grossIncome",
    },
    {
      text: "Αμοιβή Λογιστή ανά μήνα",
      field: "accountantFees",
    },
    {
      text: "Κοινωνική Ασφάλιση(ΕΦΚΑ) ανά μήνα",
      field: "businessObligations",
    },
    {
      text: "Έξοδα Επιχείρησης ανά έτος",
      field: "grossIncomeAfterBusinessExpenses",
    },
  ];

  const secondaryInputList = [
    {
      text: "Αποταμίευση ανά μήνα",
      field: "savings",
    },
    {
      text: "Ετήσιο Επιπρόσθετος Ποσό(π.χ. Ειδική Εισφορά Αλληλεγγύης,\
        Ετήσιο τέλος επιτηδεύματος, κλτ)",
      field: "additionalBusinessObligations",
    },
  ];

  const onChangeDetail = (value, field) => {
    addDetail({
      value: parseInt(value) || 0,
      field,
    });
  };

  return (
    <Box>
      <Button
        colorScheme="purple"
        variant="outline"
        onClick={removeUserDetails}
        mt={2}
        isDisabled={!grossIncome}
        position="sticky"
        top="0"
        borderRadius={0}
        zIndex={1}
        background="#f3f3f3"
      >
        Clear fields
      </Button>

      <Stack spacing={4} direction="column" mt={6}>
        {primaryInputList.map(({ text, field }) => (
          <Input.NumberField
            value={details[field]}
            key={field}
            text={text}
            onChange={(value) => onChangeDetail(value, field)}
          />
        ))}
      </Stack>

      <Box py={6}>
        <Divider orientation="horizontal" style={{ borderColor: "#c7c7c7" }} />
      </Box>

      <Input.CheckboxGroup />

      <Box py={6}>
        <Divider orientation="horizontal" style={{ borderColor: "#c7c7c7" }} />
      </Box>

      <Stack spacing={4} direction="column">
        <Radio.Vertical />

        {!isFullYear && (
          <Input.NumberCounterField
            text="Ενεργοί μήνες φορολογικού έτους"
            isFullYear={isFullYear}
            onChange={(value) => onChangeDetail(value, "taxYearDuration")}
          />
        )}
      </Stack>

      <Stack spacing={4} direction="column" pt={6}>
        {secondaryInputList.map(({ text, field }) => (
          <Input.NumberField
            value={details[field]}
            key={field}
            text={text}
            onChange={(value) => onChangeDetail(value, field)}
          />
        ))}
      </Stack>
    </Box>
  );
};

export { MainForm };
