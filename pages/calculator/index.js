// import { useState } from "react";
// import {
//   Radio,
//   RadioGroup,
//   Box,
//   Stack,
//   Text,
//   Select,
//   Divider,
//   Grid,
//   GridItem,
//   NumberInput,
//   NumberInputField,
//   Flex,
//   NumberInputStepper,
//   NumberIncrementStepper,
//   NumberDecrementStepper,
//   Checkbox,
// } from "@chakra-ui/react";
// import { useRouter } from "next/router";
// import { useStore } from "store";
// import { ChevronDownIcon } from "@chakra-ui/icons";
// import { Navigation } from "../../components/navigation";
// import { Layout } from "../../components/layout";

// const Calculator = () => {
//   const details = useStore((state) => state.welcomeDetails);
//   const addWelcomeDetail = useStore((state) => state.addWelcomeDetail);
//   const { query, push } = useRouter();
//   const po = useRouter();
//   const [showSection, setShowSection] = useState(false);
// // console.log(po, 'ppo')
//   const onChange = (value) => {
//     addWelcomeDetail({
//       value,
//       field: "calculatorType",
//     });

//     // push({ query: { ...query, calculatorType: value } });
//     push(`calculator/${value}`);
//   };

//   const onSelect = (e) => {
//     addWelcomeDetail({
//       value: Number(e.target.value),
//       field: "taxYearDuration",
//     });
//   };

//   const calculatorTypeValue = query?.calculatorType || details.calculatorType;

//   return (
//     <Layout>
//       <Navigation />

//       <Grid
//         width="100%"
//         templateColumns="386px 1fr"
//         gap={6}
//         maxW="1200px"
//         mt={16}
//         p={4}
//         pb={14}
//       >
//         <GridItem>
//           <Box>
//             <Box>
//               <Text fontWeight="500" color="gray.700">
//                 Κατηγορία
//               </Text>
//               <RadioGroup
//                 onChange={onChange}
//                 value={calculatorTypeValue}
//                 mt={2}
//               >
//                 <Stack direction="row">
//                   <Radio value="business">
//                     <Text fontSize="14px">Ελέυθερος επαγγελματίας</Text>
//                   </Radio>
//                   <Radio value="employee" fontSize="14px">
//                     <Text fontSize="14px">Μισθωτός</Text>
//                   </Radio>
//                 </Stack>
//               </RadioGroup>
//             </Box>

//             <Box mt={4}>
//               <Text fontWeight="500" color="gray.700">
//                 Ετήσιοι μισθοί
//               </Text>
//               <Select onChange={onSelect} mt={2}>
//                 <option value="12">12</option>
//                 <option value="14">14</option>
//                 <option value="14.5">14.5</option>
//               </Select>
//             </Box>
//           </Box>

//           <Divider pt={6} />

//           <Box mt={6}>
//             <Text fontWeight="500" color="gray.500" fontSize="18px">
//               Έσοδα
//             </Text>
//             <Grid gridTemplateColumns="2fr 1fr" gap="0 16px">
//               <GridItem>
//                 <Text fontWeight="500" color="gray.700" mt={4}>
//                   Μικτό εισόδημα
//                 </Text>
//                 <NumberInput
//                   mt={2}
//                   // borderColor="gray.400"
//                   // onChange={onChange}
//                   // value={value || ""}
//                 >
//                   <NumberInputField />
//                 </NumberInput>
//               </GridItem>
//               <GridItem>
//                 <Text fontWeight="500" color="gray.700" mt={4}>
//                   Ανά
//                 </Text>

//                 <Select onChange={onSelect} borderColor="gray.200" mt={2}>
//                   <option value="Έτος">Έτος</option>
//                   <option value="Μήνα" selected="selected">Μήνα</option>
//                 </Select>
//               </GridItem>
//             </Grid>

//             <Text my={4} textAlign="center" color="blackAlpha.300">
//               Ή
//             </Text>

//             <Grid gridTemplateColumns="2fr 1fr" gap="0 16px">
//               <GridItem>
//                 <Text fontWeight="500" color="gray.700" mt={4}>
//                   Καθαρό εισόδημα
//                 </Text>
//                 <NumberInput
//                   mt={2}
//                   // borderColor="gray.400"
//                   // onChange={onChange}
//                   // value={value || ""}
//                 >
//                   <NumberInputField />
//                 </NumberInput>
//               </GridItem>
//               <GridItem>
//                 <Text fontWeight="500" color="gray.700" mt={4}>
//                   Ανά
//                 </Text>

//                 <Select onChange={onSelect} borderColor="gray.200" mt={2}>
//                   <option value="Έτος">Έτος</option>
//                   <option value="Μήνα">Μήνα</option>
//                 </Select>
//               </GridItem>
//             </Grid>
//           </Box>

//           <Divider pt={6} />

//           <Box mt={6}>
//             <Flex
//               onClick={() => setShowSection(!showSection)}
//               justifyContent="space-between"
//               alignItems="center"
//               cursor="pointer"
//             >
//               <Text fontWeight="500" color="gray.500" fontSize="18px">
//                 Επιπλέον παράμετροι
//               </Text>
//               <ChevronDownIcon
//                 fontSize={22}
//                 style={{ transform: `rotate(${showSection ? "180deg" : "0"})` }}
//               />
//             </Flex>

//             {showSection && (
//               <Box>
//                 <Box mt={4}>
//                   <Text fontWeight="500" color="gray.700">
//                     Φορολογικό έτος
//                   </Text>
//                   <Select onChange={onSelect} mt={2}>
//                     <option value="2021">2021</option>
//                     <option value="220">2020</option>
//                     <option value="2019">2019</option>
//                   </Select>
//                 </Box>

//                 <Box mt={4}>
//                   <Text fontWeight="500" color="gray.700">
//                     Ασφαλιστικός φορέας
//                   </Text>
//                   <Select onChange={onSelect} mt={2}>
//                     <option value="ΕΦΚΑ">ΕΦΚΑ</option>
//                     <option value="ΤΣΜΕΔΕ">ΤΣΜΕΔΕ</option>
//                   </Select>
//                 </Box>

//                 <Box mt={4}>
//                   <Text fontWeight="500" color="gray.700">
//                     Αριθμός τέκνων
//                   </Text>
//                   <NumberInput
//                     mt={2}
//                     defaultValue={12}
//                     max={12}
//                     min={1}
//                     clampValueOnBlur={false}
//                   >
//                     <NumberInputField readOnly />
//                     <NumberInputStepper>
//                       <NumberIncrementStepper />
//                       <NumberDecrementStepper />
//                     </NumberInputStepper>
//                   </NumberInput>
//                 </Box>

//                 <Box mt={4}>
//                   <Text fontWeight="500" color="gray.700">
//                     Επιστροφή στην Ελλάδα
//                   </Text>

//                   <Checkbox
//                     mt={2}
//                     colorScheme="purple"
//                     // isDisabled={previousYearTaxInAdvance}
//                     // isChecked={discountOptions.prePaidNextYearTax}
//                     // onChange={() =>
//                     //   addDetail({
//                     //     value: {
//                     //       ...discountOptions,
//                     //       prePaidNextYearTax:
//                     //         !discountOptions.prePaidNextYearTax,
//                     //     },
//                     //     field: "discountOptions",
//                     //   })
//                     // }
//                   >
//                     <Text fontSize="sm" color="gray.500">
//                       Μεταφορά φορολογικής κατοικίας
//                     </Text>
//                   </Checkbox>
//                 </Box>
//               </Box>
//             )}
//           </Box>
//         </GridItem>
//         <GridItem></GridItem>
//       </Grid>
//     </Layout>
//   );
// };

// export default Calculator;
