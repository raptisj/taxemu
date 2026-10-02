import { Box, FormControl, FormLabel, Select, Stack, Text } from "@chakra-ui/react";
import { getEmployeeRules } from "../../rules";
import { engineerUnsupportedMessage, isEngineer } from "../../utils/employeeContributions";

const Field = ({ id, label, value, onChange, children }) => (
  <FormControl>
    <FormLabel htmlFor={id} fontSize="sm" fontWeight="500" color="gray.700">{label}</FormLabel>
    <Select id={id} value={value} onChange={(event) => onChange(event.target.value)}>{children}</Select>
  </FormControl>
);

export default function EmployeeInsuranceFields({ details, onChange, idPrefix = "employee" }) {
  const engineer = getEmployeeRules(details.taxationYear).insurance.engineer;
  const selected = isEngineer(details);
  return (
    <Stack spacing={4} mt={4}>
      <Field id={`${idPrefix}-insurance-profile`} label="Ασφαλιστικό προφίλ" value={details.insuranceProfile ?? "general"} onChange={(value) => onChange({ insuranceProfile: value })}>
        <option value="general">Γενικός μισθωτός</option>
        <option value="engineer" disabled={!engineer && !selected}>Μισθωτός μηχανικός (2026)</option>
      </Field>
      {selected && !engineer && <Text role="alert" fontSize="sm" color="orange.800">{engineerUnsupportedMessage(details.taxationYear)}</Text>}
      {selected && engineer && (
        <>
          <Box bg="purple.50" p={3} borderRadius="md">
            <Text fontSize="xs" color="gray.600">Πλήρες έτος (12 ασφαλισμένοι μήνες), ιδιωτικός τομέας, ασφάλιση πρώην ΤΣΜΕΔΕ και ΕΟΠΥΥ, χωρίς επαγγελματικό κίνδυνο ή επιδότηση. Το πτυχίο μηχανικού δεν αρκεί για την υπαγωγή.</Text>
          </Box>
          <Field id={`${idPrefix}-supplementary-category`} label="Κατηγορία επικουρικής ασφάλισης" value={details.supplementaryCategory ?? engineer.defaultCategory} onChange={(value) => onChange({ supplementaryCategory: Number(value) })}>
            {engineer.supplementaryMonthlyAmounts.map((amount, index) => <option key={index} value={index + 1}>{index + 1}η · {amount.toLocaleString("el-GR", { minimumFractionDigits: 2 })} € / μήνα συνολικά</option>)}
          </Field>
          <Field id={`${idPrefix}-lump-sum-category`} label="Κατηγορία εφάπαξ παροχής" value={details.lumpSumCategory ?? engineer.defaultCategory} onChange={(value) => onChange({ lumpSumCategory: Number(value) })}>
            {engineer.lumpSumMonthlyAmounts.map((amount, index) => <option key={index} value={index + 1}>{index + 1}η · {amount.toLocaleString("el-GR", { minimumFractionDigits: 2 })} € / μήνα</option>)}
          </Field>
          <Field id={`${idPrefix}-supplementary-fund`} label="Φορέας επικουρικής ασφάλισης" value={details.supplementaryFund ?? "efka"} onChange={(value) => onChange({ supplementaryFund: value })}>
            <option value="efka">e-ΕΦΚΑ</option>
            <option value="teka">ΤΕΚΑ</option>
          </Field>
          <Text fontSize="xs" color="gray.500">Επίλεξε τον φορέα στον οποίο είσαι ήδη ασφαλισμένος. Το ΤΕΚΑ αλλάζει τον φορέα, όχι το ποσό. Οι κατηγορίες επιλέγονται ανεξάρτητα και εφαρμόζονται για όλο το έτος. Χωρίς επιλογή ισχύει η 1η.</Text>
        </>
      )}
    </Stack>
  );
}
