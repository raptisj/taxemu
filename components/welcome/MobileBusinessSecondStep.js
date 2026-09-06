import { Box, Text, Flex } from "@chakra-ui/react";
import Stepper from "components/stepper";
import { useStore } from "store";
import { getBusinessRules } from "../../rules";

export const MobileBusinessSecondStep = () => {
  const userDetails = useStore((state) => state.userDetails);
  const updateBusiness = useStore((state) => state.updateBusiness);
  const businessRules = getBusinessRules(userDetails.business.taxationYear);
  const insuranceAmounts = businessRules.insurance.monthlyAmounts;

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
        <Flex alignItems="center">
          <Stepper.Content text="Οι" mr={2} mb={4} />

          <Stepper.Content text="μηνιαίες" mr={2} mb={4} />

          <Stepper.Content text="εισφορές μου" mr={2} mb={4} />
        </Flex>

        <Flex alignItems="center">
          <Stepper.Content text="στον ΕΦΚΑ είναι" mr={2} mb={4} />

          <Stepper.Content
            text="€"
            fontWeight="600"
            color="gray.700"
            mr={2}
            mb={4}
          />

          <Stepper.MenuDrawer
            onChange={(value) => handleInsurance(value)}
            name={userDetails.business.insuranceScaleSelection.toString()}
            label={insuranceAmounts[
              userDetails.business.insuranceScaleSelection
            ].toString()}
            options={insuranceAmounts.map((amount, index) => ({
              value: String(index),
              text: amount,
            }))}
            mr={2}
            mb={4}
          />
        </Flex>

        <Flex alignItems="center">
          <Stepper.Content
            text="και έχω επιπλέον έξοδα επιχείρησης"
            mr={2}
            mb={4}
          />
        </Flex>

        <Flex alignItems="center">
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

          {/* <Stepper.Content text="τον" mr={2} />

          <Stepper.MenuDrawer
            onChange={handleExpensesPeriod}
            name={expensesPeriod}
            // options={["μήνα", "χρόνο"]}
          /> */}
        </Flex>
      </Flex>
    </Box>
  );
};
