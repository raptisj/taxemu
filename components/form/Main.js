import { useEffect, useCallback } from "react";
import { Box, Stack, Divider, Button, Text } from "@chakra-ui/react";
import { Input, Radio } from "../input";
import { useStore } from "store";

const MainForm = () => {
  const details = useStore((state) => state.userDetails);
  const addDetail = useStore((state) => state.addDetail);
  const removeUserDetails = useStore((state) => state.removeUserDetails);

  const {
    isFullYear,
    grossIncome,
    accountantFees,
    healthInsuranceFees,
    extraBusinessExpenses,
    totalBusinessExpenses,
    taxYearDuration,
    taxScales
  } = details;

  const incomeInputList = [
    {
      text: "Ετήσιος Μικτός μισθός",
      field: "grossIncome",
    },
  ];

  const expensesInputList = [
    {
      text: "Αμοιβή Λογιστή ανά μήνα",
      field: "accountantFees",
    },
    {
      text: "Κοινωνική Ασφάλιση(ΕΦΚΑ) ανά μήνα",
      field: "healthInsuranceFees",
    },
    {
      text: "Πρόσθετα Έξοδα Επιχείρησης ανά έτος",
      field: "extraBusinessExpenses",
    },
  ];

  const secondaryInputList = [
    {
      text: "Αποταμίευση ανά μήνα",
      field: "savings",
    },
  ];

  const addTotalBusinessExpensesWrapper = useCallback((value) => {
    return (
      addDetail({
        value,
        field: "totalBusinessExpenses",
      }),
      [addDetail]
    );
  });

  const addTaxableIncomeWrapper = useCallback((value) => {
    return (
      addDetail({
        value,
        field: "taxableIncome",
      }),
      [addDetail]
    );
  });

  const addTotalTaxWrapper = useCallback((value) => {
    return (
      addDetail({
        value,
        field: "totalTax",
      }),
      [addDetail]
    );
  });

  const onChangeDetail = (value, field) => {
    addDetail({
      value: parseInt(value) || 0,
      field,
    });
  };

  const handleTotalBusinessExpenses = useCallback(() => {
    let totalBusinessExpenses =
      accountantFees * taxYearDuration +
      healthInsuranceFees * taxYearDuration +
      (extraBusinessExpenses / 12) * taxYearDuration;
    return addTotalBusinessExpensesWrapper(totalBusinessExpenses);
  }, [
    accountantFees,
    healthInsuranceFees,
    extraBusinessExpenses,
    taxYearDuration,
    addTotalBusinessExpensesWrapper,
  ]);

  const handleTaxableIncome = useCallback(() => {
    let taxableIncome = grossIncome - totalBusinessExpenses;
    return addTaxableIncomeWrapper(taxableIncome);
  }, [grossIncome, totalBusinessExpenses, addTaxableIncomeWrapper]);

  const handleTotalTax = useCallback(() => {
    let totalTax = taxScales
      .map((scale) => {
        return scale.amount;
      })
      .reduce((a, b) => {
        return a + b;
      });

    return addTotalTaxWrapper(totalTax);
  }, [taxScales, addTotalTaxWrapper]);

  useEffect(() => {
    handleTotalBusinessExpenses();
  }, [
    accountantFees,
    healthInsuranceFees,
    extraBusinessExpenses,
    taxYearDuration,
  ]);

  useEffect(() => {
    handleTaxableIncome();
  }, [grossIncome, totalBusinessExpenses]);

  useEffect(() => {
    handleTotalTax();
  }, [taxScales]);

  return (
    <Box>
      <Box
        position="sticky"
        top="0"
        mt={2}
        zIndex={10}
        width="105%"
        backgroundColor="rgba(243, 243, 243, .15)"
        backdropFilter="blur(5px)"
      >
        <Button
          colorScheme="purple"
          variant="outline"
          onClick={removeUserDetails}
          isDisabled={!grossIncome}
          borderRadius={0}
          zIndex={1}
          background="#f3f3f3"
        >
          Clear fields
        </Button>
      </Box>

      <Stack spacing={4} direction="column" mt={6}>
        <Text fontWeight={600} color="gray.600">
          Έσοδα
        </Text>
        {incomeInputList.map(({ text, field }) => (
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

      <Stack spacing={4} direction="column" pt={6}>
        <Text fontWeight={600} color="gray.600">
          Έξοδα
        </Text>
        {expensesInputList.map(({ text, field }) => (
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
