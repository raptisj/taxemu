import { Button, Box, Flex } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { SubmitButtonContent } from "../form";

export const Sidebar = ({ children, onSubmitAction, onClear }) => {
  return (
    <>
      <Box minHeight="calc(100vh - 258px)">{children}</Box>
      <Flex
        position="sticky"
        bottom={0}
        mt="auto"
        py={4}
        pr={4}
        borderTop=" 1px solid #E2E8F0"
        width="106%"
        background="#fff"
      >
        <Button
          width={{ base: "full" }}
          colorScheme="purple"
          mr={{ base: 0, sm: 3 }}
          onClick={onSubmitAction}
        >
          <SubmitButtonContent />
        </Button>

        <Button
          leftIcon={<CloseIcon fontSize={8} />}
          colorScheme="gray"
          variant="outline"
          fontSize="12px"
          p={4}
          width="140px"
          onClick={onClear}
        >
          Εκκαθάριση
        </Button>
      </Flex>
    </>
  );
};
