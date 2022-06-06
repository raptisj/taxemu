import { Box, Stack, Divider } from "@chakra-ui/react";
import { Input, Radio } from "../input";
import { useStore } from "../../store";

const MainForm = () => {
  const details = useStore((state) => state.userDetails);
  const addDetail = useStore((state) => state.addDetail);

  const { isFullYear } = details;

  return (
    <Box>
      <Stack spacing={4} direction="column">
        <Input.NumberField
          text="Ετήσιος Μικτός μισθός"
          onChange={(value) =>
            addDetail({
              value: parseInt(value) || 0,
              field: "grossIncome",
            })
          }
        />
        <Input.NumberField
          text="Αμοιβή Λογιστή ανά μήνα"
          onChange={(value) =>
            addDetail({
              value: parseInt(value) || 0,
              field: "accountantFees",
            })
          }
        />
        <Input.NumberField
          text="Κοινωνική Ασφάλιση(ΕΦΚΑ) ανά μήνα"
          onChange={(value) =>
            addDetail({
              value: parseInt(value) || 0,
              field: "businessObligations",
            })
          }
        />
        <Input.NumberField
          text="Ετήσιο Επιπρόσθετος Ποσό(π.χ. Ειδική Εισφορά Αλληλεγγύης,
            Ετήσιο τέλος επιτηδεύματος, κλτ)"
          onChange={(value) =>
            addDetail({
              value: parseInt(value) || 0,
              field: "additionalBusinessObligations",
            })
          }
        />
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
        <Input.NumberField
          text="Αποταμίευση ανά μήνα"
          onChange={(value) =>
            addDetail({
              value: parseInt(value) || 0,
              field: "savings",
            })
          }
        />
      </Stack>
    </Box>
  );
};

export { MainForm };
