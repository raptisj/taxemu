import { useState } from "react";
import { Text, Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { useStore } from "../../store";

const Vertical = () => {
  const [radioValue, setRadioValue] = useState("full");

  const addDetail = useStore((state) => state.addDetail);
  
  const handleRadioChange = (val) => {
    setRadioValue(val);

    addDetail({
      value: val === "full",
      field: "isFullYear",
    });

    addDetail({
      value: val === "full" ? 12 : 11,
      field: "taxYearDuration",
    });
  };

  return (
    <RadioGroup onChange={handleRadioChange} value={radioValue}>
      <Stack>
        <Radio size="md" name="full" colorScheme="green" value="full">
          <Text fontSize="sm" color="gray.500">
            Ολόκληρο Φορολογικό Έτος
          </Text>
        </Radio>
        <Radio size="md" name="part" colorScheme="green" value="part">
          <Text fontSize="sm" color="gray.500">
            Μη Ολόκληρο Φορολογικό Έτος
          </Text>
        </Radio>
      </Stack>
    </RadioGroup>
  );
};

export { Vertical };
