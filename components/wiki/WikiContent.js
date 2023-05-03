import {
  Box,
  Text,
  Divider,
  Heading,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { WIKI } from "../../constants/content";

export const WikiContent = () => {
  const router = useRouter();
  const entity = router.pathname.replace("/", "");

  return (
    <>
      {WIKI[entity]?.content?.map((info) => (
        <>
          <Box mt={4} key={info.title}>
            <Heading as="h3" size="sm" mb={2}>
              {info.title}
            </Heading>
            <Text color="gray.600">{info.description}</Text>

            {!!info?.list?.length && (
              <UnorderedList mt={2}>
                {info.list.map((item) => (
                  <ListItem color="gray.600" key={item}>
                    {item}
                  </ListItem>
                ))}
              </UnorderedList>
            )}

            {info?.afterListDescritpion && (
              <Text color="gray.600">{info.afterListDescritpion}</Text>
            )}

            {!!info.example && (
              <Box mt={4}>
                <Text as="i" color="gray.500">
                  παράδειγμα*
                </Text>
                <Box
                  padding={4}
                  borderColor="gray.200"
                  borderWidth={1}
                  borderRadius={8}
                >
                  <Text color="gray.600">{info.example}</Text>

                  {info?.exampleList?.length && (
                    <UnorderedList mt={2}>
                      {info.exampleList.map((item) => (
                        <ListItem color="gray.600" key={item}>
                          {item}
                        </ListItem>
                      ))}
                    </UnorderedList>
                  )}
                </Box>
                {info?.afterExampleList && (
                  <Text color="gray.600" mt={2}>
                    {info.afterExampleList}
                  </Text>
                )}
              </Box>
            )}
          </Box>
          <Divider my={8} />
        </>
      ))}
    </>
  );
};
