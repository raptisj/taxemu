import { useState } from "react";
import { useRouter } from "next/router";
import { useStore } from "store";

const isCalculator = (value) => value === "employee" || value === "business";

export const useCalculatorSwitch = (calculatorEntity) => {
  const router = useRouter();
  const currentCalculator = calculatorEntity ?? router.pathname?.slice(1);
  const switchCalculator = useStore((state) => state.switchCalculator);
  const hasCalculation = useStore((state) => Boolean(
    state.userDetails.employee.tableResults.calculationInput ||
    state.userDetails.business.tableResults.calculationInput,
  ));
  const [pendingCalculator, setPendingCalculator] = useState(null);

  const completeSwitch = (value) => {
    switchCalculator(value);
    setPendingCalculator(null);
    router.push(`/${value}`);
  };

  const requestCalculatorSwitch = (value, event) => {
    if (!isCalculator(currentCalculator) || !isCalculator(value)) return;
    if (value === currentCalculator) return;
    // Preserve normal link behavior for opening a calculator in another tab.
    if (event) {
      if (
        event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      ) return;
      event.preventDefault();
    }
    if (!hasCalculation) {
      completeSwitch(value);
      return;
    }
    setPendingCalculator(value);
  };

  const cancelSwitch = () => setPendingCalculator(null);

  const confirmSwitch = () => {
    if (!pendingCalculator) return;
    completeSwitch(pendingCalculator);
  };

  return {
    requestCalculatorSwitch,
    dialogProps: {
      isOpen: Boolean(pendingCalculator),
      onCancel: cancelSwitch,
      onConfirm: confirmSwitch,
    },
  };
};
