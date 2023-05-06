import { Box, Text, Flex } from "@chakra-ui/react";
import Stepper from "components/stepper";
import { useStore } from "store";

export const BusinessSecondStep = () => {
  const userDetails = useStore((state) => state.userDetails);
  const updateBusiness = useStore((state) => state.updateBusiness);

  const handleInsurance = (value) => {
    updateBusiness({
      discountOptions: {
        ...userDetails.business.discountOptions,
        specialInsuranceScale: value === "0",
      },
      insuranceScaleSelection: Number(value),
    });
  };

  return (
    <Box mt="100px">
      <Text color="gray.400">Συνεχίζοντας...</Text>
      <Flex mt={8} flexDirection="column">
        <Flex flexWrap="wrap" alignItems="center">
          <Stepper.Content text="Οι" mr={2} mb={4} />
          <Stepper.Content text="μηνιαίες" mr={2} mb={4} />

          {/* <Stepper.MenuPopover
            name={insurancePeriod}
            onChange={handleInsuranePeriod}
            options={["μηνιαίες", "ετήσιες"]}
            menuTitle="Επίλεξε περίοδο"
            mb={4}
          /> */}

          <Stepper.Content text="εισφορές μου στον ΕΦΚΑ" mr={2} mb={4} />

          <Flex alignItems="center">
            <Stepper.Content text="είναι" mr={2} mb={4} />
            <Stepper.Content
              text="€"
              fontWeight="600"
              color="gray.700"
              mb={4}
              mr={2}
            />

            <Stepper.MenuPopover
              onChange={(value) => handleInsurance(value)}
              name={userDetails.business.insuranceScaleSelection.toString()}
              label={userDetails.business.taxationYearScales[
                userDetails.business.taxationYear
              ].insuranceScales[
                userDetails.business.insuranceScaleSelection
              ].amount.toString()}
              options={[
                { value: "0", text: 136 },
                { value: "1", text: 220 },
                { value: "2", text: 262 },
                { value: "3", text: 312 },
                { value: "4", text: 373 },
                { value: "5", text: 445 },
              ]}
              menuTitle="Επίλεξε περίοδο"
              mb={4}
            />

            {/* <Stepper.NumberInput
              onChange={handleInsuranceAmount}
              value={insuranceAmount}
            /> */}
          </Flex>
        </Flex>

        <Flex flexWrap="wrap" alignItems="center">
          <Stepper.Content text="και έχω επιπλέον έξοδα" mr={2} mb={4} />

          <Flex alignItems="center">
            <Stepper.Content text="επιχείρησης" mr={2} mb={4} />
            <Stepper.Content
              text="€"
              fontWeight="600"
              color="gray.700"
              mr={2}
              mb={4}
            />

            <Stepper.NumberInput
              onChange={(value) =>
                updateBusiness({
                  extraBusinessExpenses: Number(value),
                })
              }
              value={userDetails.business.extraBusinessExpenses}
            />
          </Flex>

          {/* <Flex alignItems="center"> */}
          {/* <Stepper.Content text="τον" mr={2} mb={4} />

            <Stepper.MenuPopover
              name={expensesPeriod}
              onChange={handleExpensesPeriod}
              options={["χρόνο", "μήνα"]}
              menuTitle="Επίλεξε περίοδο"
              mb={4}
            /> */}
          {/* </Flex> */}
        </Flex>
      </Flex>
    </Box>
  );
};
