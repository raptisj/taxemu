import { Box, Stack, Divider } from "@chakra-ui/react";
import { Input, Radio } from "../input";
import { useStore } from "../../store";

const MainForm = () => {
  const details = useStore((state) => state.userDetails);
  const addDetail = useStore((state) => state.addDetail);

  const { isFullYear } = details;

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
      text: "Ετήσιο Επιπρόσθετος Ποσό(π.χ. Ειδική Εισφορά Αλληλεγγύης,\
        Ετήσιο τέλος επιτηδεύματος, κλτ)",
      field: "additionalBusinessObligations",
    },
  ];

  const secondaryInputList = [
    {
      text: "Αποταμίευση ανά μήνα",
      field: "savings",
    },
  ];

  return (
    <Box>
      <Stack spacing={4} direction="column">
        {primaryInputList.map(({ text, field }) => (
          <Input.NumberField
            key={field}
            text={text}
            onChange={(value) =>
              addDetail({
                value: parseInt(value) || 0,
                field,
              })
            }
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
            onChange={(value) =>
              addDetail({
                value: parseInt(value) || 0,
                field: "taxYearDuration",
              })
            }
          />
        )}
      </Stack>

      <Stack spacing={4} direction="column" pt={6}>
        {secondaryInputList.map(({ text, field }) => (
          <Input.NumberField
            key={field}
            text={text}
            onChange={(value) =>
              addDetail({
                value: parseInt(value) || 0,
                field,
              })
            }
          />
        ))}
      </Stack>
    </Box>
  );
};

export { MainForm };
