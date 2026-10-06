import { Text, Heading, Flex } from "@chakra-ui/react";
import { useCalculatorSwitch } from "../../hooks/useCalculatorSwitch";
import CalculatorSwitchDialog from "../navigation/CalculatorSwitchDialog";
import Stepper from "components/stepper";
import KeyboardShortcutsButton from "../keyboard/KeyboardShortcutsButton";
import { MobileResultsActionsMenu } from "./ResultsActions";
import { CALCULATOR_LABELS, CALCULATOR_GENITIVE_LABELS } from "../../constants/calculators";

const MobileTableHeader = ({ calculatorEntity, onSubmitAction, onClear }) => {
  const { requestCalculatorSwitch, dialogProps } =
    useCalculatorSwitch(calculatorEntity);

  return (
    <>
      <CalculatorSwitchDialog {...dialogProps} />
      <Flex justify="space-between" align="flex-start" gap={2}>
        <Flex
          align="baseline"
          columnGap={2}
          flex="1"
          flexWrap="wrap"
          minW={0}
        >
          <Heading as="h2" size="lg" fontWeight="500" color="gray.600">
            Υπολογισμός εισοδήματος
          </Heading>
          <Stepper.MenuDrawer
            name={calculatorEntity}
            label={CALCULATOR_GENITIVE_LABELS[calculatorEntity]}
            onChange={requestCalculatorSwitch}
            options={[
              { value: "employee", text: CALCULATOR_LABELS.employee },
              { value: "business", text: CALCULATOR_LABELS.business },
            ]}
            aria-label="Επιλογή κατηγορίας υπολογισμού"
            ml={0}
            p={0}
            headingProps={{
              as: "span",
              color: "gray.600",
              fontWeight: "500",
              lineHeight: "shorter",
              minW: 0,
              size: "lg",
            }}
          />
        </Flex>
        <Flex align="center" flexShrink={0} gap={1}>
          <KeyboardShortcutsButton
            onCalculate={onSubmitAction}
            onClear={onClear}
            hideTrigger
          />
          <MobileResultsActionsMenu entity={calculatorEntity} />
        </Flex>
      </Flex>
      <Text color="gray.500" fontSize="14px" mt={1}>
        Οι υπολογισμοί είναι κατά προσέγγιση και δεν αποτελούν λογιστική
        συμβουλή*
      </Text>
    </>
  );
};

export default MobileTableHeader;
