import { useState } from "react";
import { DownloadIcon } from "@chakra-ui/icons";
import { Button, Tooltip, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useStore } from "store";
import { getCalculationDirtyFields } from "utils";
import { buildPersonalCalculationPdfData } from "./buildPersonalCalculationPdfData";

export const usePersonalCalculationPdf = (entity) => {
  const router = useRouter();
  const toast = useToast();
  const details = useStore((state) => state.userDetails[entity]);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasCalculation = Boolean(details.tableResults?.calculationInput);
  const hasPendingChanges = getCalculationDirtyFields(entity, details).length > 0;
  const compare = router.query.compare;
  const isDisabled = !hasCalculation || hasPendingChanges;
  const tooltip = !hasCalculation
    ? "Υπολόγισε πρώτα το αποτέλεσμά σου"
    : hasPendingChanges
      ? "Υπολόγισε ξανά τις αλλαγές πριν την εξαγωγή"
      : compare
        ? "Λήψη αποτελέσματος και σύγκρισης ετών"
        : "Λήψη προσωπικού υπολογισμού";

  const handleDownload = async () => {
    if (isDisabled) return;
    setIsGenerating(true);
    try {
      const data = buildPersonalCalculationPdfData({
        entity,
        details,
        compare,
      });
      if (!data) return;
      const { downloadPersonalCalculationPdf } = await import(
        "./downloadPersonalCalculationPdf"
      );
      await downloadPersonalCalculationPdf(data);
    } catch (error) {
      console.error("Failed to generate personal calculation PDF", error);
      toast({
        title: "Δεν δημιουργήθηκε το PDF",
        description: "Δοκίμασε ξανά σε λίγο.",
        position: "top",
        isClosable: true,
        status: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    handleDownload,
    isDisabled,
    isGenerating,
    tooltip,
  };
};

export const PersonalCalculationPdfButton = ({ entity, isMobile = false }) => {
  const { handleDownload, isDisabled, isGenerating, tooltip } =
    usePersonalCalculationPdf(entity);

  return (
    <Tooltip label={tooltip} hasArrow>
      <Button
        aria-label="Εξαγωγή προσωπικού υπολογισμού σε PDF"
        leftIcon={<DownloadIcon />}
        size="sm"
        variant="outline"
        colorScheme="purple"
        isDisabled={isDisabled}
        isLoading={isGenerating}
        loadingText="PDF"
        onClick={handleDownload}
        width={isMobile ? "full" : "auto"}
      >
        Εξαγωγή PDF
      </Button>
    </Tooltip>
  );
};
