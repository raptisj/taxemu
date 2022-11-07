import { Button, Box, Flex } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useStore } from "store";

export const Sidebar = ({ children, onClick }) => {
  const removeUserDetails = useStore((state) => state.removeUserDetails);

  return (
    <>
      <Box minHeight='calc(100vh - 260px)'>{children}</Box>
      <Flex
        position="sticky"
        bottom={0}
        mt="32px"
        p="16px"
        borderTop=" 1px solid #E2E8F0"
        borderLeft=" 1px solid #E2E8F0"
        boxShadow="0px -4px 16px -1px rgb(0 0 0 / 5%)"
        width="106%"
        background="#fff"
      >
        <Button
          width={{ base: "full" }}
          colorScheme="purple"
          mr={{ base: 0, sm: 3 }}
          onClick={onClick}
        >
          Υπολόγισε αποτέλεσμα
        </Button>

        <Button
          leftIcon={<CloseIcon fontSize={8} />}
          colorScheme="gray"
          variant="outline"
          fontSize="12px"
          p={4}
          width="140px"
          onClick={removeUserDetails}
        >
          Εκκαθάριση
        </Button>
      </Flex>
    </>
  );
};
