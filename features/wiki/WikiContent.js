import {
  Box,
  Text,
  Divider,
  Heading,
  Link,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { Fragment, useMemo } from "react";
import { useStore } from "store";
import { buildExplanation } from "./explanations";

const ExplanationList = ({ items = [] }) =>
  items.length ? (
    <UnorderedList mt={2} spacing={1}>
      {items.map((item) => (
        <ListItem color="gray.600" key={item}>
          {item}
        </ListItem>
      ))}
    </UnorderedList>
  ) : null;

export const WikiContent = () => {
  const router = useRouter();
  const entity = router.pathname.replace("/", "");
  const details = useStore((state) => state.userDetails[entity]);
  const explanation = useMemo(
    () => buildExplanation(entity, details),
    [details, entity],
  );

  return (
    <>
      <Box
        mt={4}
        p={3}
        borderRadius={8}
        background="purple.50"
        color="gray.700"
      >
        <Text fontWeight="600">Φορολογικό έτος {explanation.year}</Text>
        <Text fontSize="sm" mt={1}>
          {explanation.intro}
        </Text>
        {!explanation.hasCalculation && (
          <Text fontSize="sm" mt={2}>
            Συμπλήρωσε ένα ποσό στη φόρμα για να εμφανιστεί και προσωπικό
            αριθμητικό παράδειγμα.
          </Text>
        )}
      </Box>

      {explanation.sections.map((section, index) => (
        <Fragment key={section.title}>
          <Box mt={5}>
            <Heading as="h3" size="sm" mb={2}>
              {section.title}
            </Heading>
            <Text color="gray.600">{section.description}</Text>

            <ExplanationList items={section.rules} />

            {!!section.example?.length && (
              <Box
                mt={4}
                padding={4}
                borderColor="gray.200"
                borderWidth={1}
                borderRadius={8}
              >
                <Text fontWeight="600" color="gray.700" fontSize="sm">
                  {section.exampleTitle}
                </Text>
                <ExplanationList items={section.example} />
              </Box>
            )}

            <ExplanationList items={section.items} />
          </Box>
          {explanation.sections.length - 1 > index && <Divider my={7} />}
        </Fragment>
      ))}

      <Divider my={7} />
      <Box pb={4}>
        <Heading as="h3" size="sm" mb={2}>
          Επίσημες πηγές για το {explanation.year}
        </Heading>
        <UnorderedList spacing={2}>
          {explanation.sources.map((source) => (
            <ListItem color="gray.600" key={source.url}>
              <Link
                href={source.url}
                isExternal
                color="purple.600"
                textDecoration="underline"
              >
                {source.name}
              </Link>
            </ListItem>
          ))}
        </UnorderedList>
        <Text color="gray.500" fontSize="xs" mt={3}>
          Οι υπολογισμοί είναι ενδεικτικοί και δεν αποτελούν λογιστική ή
          φοροτεχνική συμβουλή.
        </Text>
      </Box>
    </>
  );
};
