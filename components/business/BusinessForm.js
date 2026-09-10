import {
  Box,
  Text,
  Grid,
  Divider,
  GridItem,
  FormControl,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useStore } from "store";
import { SidebarSubSection, SidebarSubSectionAccordion } from "../layout";
import FormElements from "../input";
import { useCalculateBusiness, useBusinessActions } from "hooks";
import { BusinessNegotiateWidget } from "../../features";
import { getTaxRules, supportedTaxYears } from "../../rules";
import { isBusinessGrossIncomeMissing } from "../../utils/formState";
import { formatRatePercentage } from "../../utils";
import { inlineLinkStyles } from "../../styles/inlineLink";

const BusinessForm = ({ showCalculatorType = true }) => {
  const [minimumIncomeSectionOpen, setMinimumIncomeSectionOpen] =
    useState(false);
  const [shouldScrollToBusinessAge, setShouldScrollToBusinessAge] =
    useState(false);
  const businessAgeFieldRef = useRef(null);
  const userDetails = useStore((state) => state.userDetails.business);
  const updateBusiness = useStore((state) => state.updateBusiness);
  const update = useStore((state) => state.update);
  const { push, pathname } = useRouter();
  const { getInsuranceTotal, hasError } = useCalculateBusiness();

  const {
    onSelectTaxationYear,
    onChangeTaxYearDuration,
    onChangeGrossIncome,
    onSelectGrossIncomeMonthOfYear,
    onChangeBusinessExpensesMonthOrYear,
    onChangeInsuranceScales,
    onChangeExtraBusinessExpenses,
    onChangePreviousYearTaxInAdvance,
    onChangeNumberOfChildren,
    onSelectAgeGroup,
    updateMinimumPresumedIncome,
  } = useBusinessActions();

  const {
    grossIncome,
    taxationYear,
    taxYearDuration,
    grossMonthOrYear,
    businessExpensesMonthOrYear,
    discountOptions,
    withholdingTax,
    extraBusinessExpenses,
    prePaidNextYearTax,
    insuranceScaleSelection,
    numberOfChildren,
    ageGroup,
    minimumPresumedIncome,
  } = userDetails;
  const rules = getTaxRules(taxationYear);
  const firstYearsDiscount = rules.business.firstYearsDiscount;
  const minimumIncomeRules = rules.business.minimumPresumedIncome;
  const grossIncomeMissing = isBusinessGrossIncomeMissing(grossIncome);

  useEffect(() => {
    if (!minimumIncomeSectionOpen || !shouldScrollToBusinessAge) return;

    const animationFrame = window.requestAnimationFrame(() => {
      businessAgeFieldRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setShouldScrollToBusinessAge(false);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [minimumIncomeSectionOpen, shouldScrollToBusinessAge]);

  const showBusinessAgeField = () => {
    setMinimumIncomeSectionOpen(true);
    setShouldScrollToBusinessAge(true);
  };

  const onChange = (value) => {
    update({
      calculatorType: value,
    });

    push(`/${value}`);
  };

  const calculatorTypeValue = pathname?.split("/")[1];

  return (
    <>
      <Box>
        {showCalculatorType && (
          <FormElements.RadioGroup
            label="Κατηγορία"
            onChange={onChange}
            value={calculatorTypeValue}
            options={[
              { title: "Ελέυθερος επαγγελματίας", key: "business" },
              { title: "Μισθωτός", key: "employee" },
            ]}
          />
        )}

        <Box mt={4}>
          <FormElements.Select
            label="Φορολογικό έτος"
            onChange={onSelectTaxationYear}
            defaultValue={taxationYear}
            options={supportedTaxYears.map((year) => ({
              value: String(year),
              text: String(year),
            }))}
          />
        </Box>

        <Box mt={4}>
          <Text fontWeight="500" color="gray.700">
            Αριθμός μηνών φορολογίας
          </Text>
          <NumberInput
            mt={2}
            defaultValue={12}
            max={12}
            min={1}
            clampValueOnBlur={false}
            onChange={onChangeTaxYearDuration}
          >
            <NumberInputField readOnly />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Box>

        <Text color="gray.500" fontSize="14px" mt={2}>
          Επίλεξε τους μήνες για τους οποίους θα γίνει ο υπολογισμός
        </Text>

        {(rules.ui.business.showChildren || rules.ui.business.showAgeGroup) && (
          <>
            {rules.ui.business.showChildren && (
              <Box mt={4}>
                <Text fontWeight="500" color="gray.700">
                  Αριθμός τέκνων
                </Text>
                <NumberInput
                  mt={2}
                  defaultValue={0}
                  max={rules.ui.business.maximumChildren}
                  min={0}
                  clampValueOnBlur={false}
                  onChange={onChangeNumberOfChildren}
                  value={numberOfChildren}
                >
                  <NumberInputField readOnly />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
            )}

            {rules.ui.business.showAgeGroup && (
              <Box mt={4}>
                <FormElements.Select
                  label="Ηλικιακή ομάδα"
                  onChange={onSelectAgeGroup}
                  defaultValue={ageGroup}
                  options={rules.ui.ageGroups}
                />
              </Box>
            )}
            <Box mt={3}>
              <Link href="/blog/forologia-atomikis-epixirisis-2026">
                <Text fontSize="sm" {...inlineLinkStyles}>
                  Δες τι έχει αλλάξει για το 2026
                </Text>
              </Link>
            </Box>
          </>
        )}
      </Box>

      <Divider pt={6} />
      <SidebarSubSection title="Έσοδα">
        <Grid gridTemplateColumns="2fr 1fr" gap="0 16px">
          <GridItem>
            <Text fontWeight="500" color="gray.700" mt={4}>
              Μικτό εισόδημα
            </Text>
            <FormControl isInvalid={hasError && grossIncomeMissing}>
              <NumberInput
                mt={2}
                onChange={(value) =>
                  onChangeGrossIncome(value, taxYearDuration)
                }
                value={
                  grossMonthOrYear === "month"
                    ? grossIncome.month || ""
                    : grossIncome.year || ""
                }
              >
                <NumberInputField />
              </NumberInput>

              <FormErrorMessage>
                Απαιτείται η προσθήκη αυτού του πεδίου
              </FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem mt={4}>
            <FormElements.Select
              label="Ανά"
              onChange={onSelectGrossIncomeMonthOfYear}
              options={[
                {
                  value: "year",
                  text: taxYearDuration === 12 ? "Έτος" : "Περίοδο",
                },
                { value: "month", text: "Μήνα" },
              ]}
            />
          </GridItem>
          {minimumIncomeRules.enabled && !grossIncomeMissing && (
            <GridItem gridColumn="1 / -1">
              <Button
                mt={2}
                p={0}
                height="auto"
                maxWidth="100%"
                variant="link"
                {...inlineLinkStyles}
                fontSize="sm"
                fontWeight="normal"
                justifyContent="flex-start"
                textAlign="left"
                whiteSpace="normal"
                onClick={showBusinessAgeField}
              >
                {minimumPresumedIncome.businessAge}ο έτος δραστηριότητας
                {minimumPresumedIncome.businessAge === 1
                  ? " (προεπιλογή)"
                  : ""}
                — Αλλαγή;
              </Button>
            </GridItem>
          )}
        </Grid>

        {firstYearsDiscount.enabled && (
          <FormElements.CheckboxWithTooltip
            label={`${formatRatePercentage(1 - firstYearsDiscount.taxMultiplier)} έκπτωση για τα 3 πρώτα χρόνια άσκησης`}
            tootipText={`Για τα τρία πρώτα έτη άσκησης της δραστηριότητας, εφόσον
              το ετήσιο ακαθάριστο εισόδημα δεν υπερβαίνει τις
              ${firstYearsDiscount.maximumGrossIncome.toLocaleString("el-GR")} €,
              ο φόρος μειώνεται κατά ${formatRatePercentage(1 - firstYearsDiscount.taxMultiplier)}.`}
            isChecked={discountOptions.firstScaleDiscount}
            isDisabled={
              grossIncome.year > firstYearsDiscount.maximumGrossIncome ||
              !grossIncome.year
            }
            onChange={() =>
              updateBusiness({
                discountOptions: {
                  ...discountOptions,
                  firstScaleDiscount: !discountOptions.firstScaleDiscount,
                },
              })
            }
          />
        )}
      </SidebarSubSection>

      {minimumIncomeRules.enabled && (
        <>
          <Divider pt={6} />
          <SidebarSubSectionAccordion
            title="Ελάχιστο τεκμαρτό εισόδημα"
            isOpen={minimumIncomeSectionOpen}
            onToggle={setMinimumIncomeSectionOpen}
          >
            <Box mt={4} ref={businessAgeFieldRef}>
              <Text fontWeight="500" color="gray.700">
                Έτος άσκησης δραστηριότητας
              </Text>
              <FormControl
                isInvalid={hasError && !minimumPresumedIncome.businessAge}
              >
                <NumberInput
                  mt={2}
                  min={1}
                  max={60}
                  value={minimumPresumedIncome.businessAge ?? ""}
                  onChange={(value) =>
                    updateMinimumPresumedIncome({
                      businessAge: value === "" ? null : Number(value),
                    })
                  }
                >
                  <NumberInputField />
                </NumberInput>
                <FormErrorMessage>
                  Συμπλήρωσε το έτος δραστηριότητας
                </FormErrorMessage>
              </FormControl>
              <Text color="gray.500" fontSize="xs" mt={1}>
                Από την πρώτη έναρξη, χωρίς τα διαστήματα διακοπής.
              </Text>
            </Box>

            <Box mt={4}>
              <FormElements.RadioGroup
                label="Υπάρχουν ειδικές προσαρμογές;"
                value={
                  minimumPresumedIncome.hasAdjustments === null
                    ? ""
                    : minimumPresumedIncome.hasAdjustments
                      ? "yes"
                      : "no"
                }
                onChange={(value) =>
                  updateMinimumPresumedIncome({
                    hasAdjustments: value === "yes",
                  })
                }
                options={[
                  { title: "Όχι", key: "no" },
                  { title: "Ναι", key: "yes" },
                ]}
              />
              {hasError && minimumPresumedIncome.hasAdjustments === null && (
                <Text color="red.500" fontSize="xs" mt={1}>
                  Επίλεξε αν υπάρχουν προσαρμογές
                </Text>
              )}
            </Box>

            {minimumPresumedIncome.hasAdjustments && (
              <Box mt={3}>
                <FormElements.CheckboxNested
                  label="Απασχολώ προσωπικό"
                  isChecked={minimumPresumedIncome.employeeAdjustment}
                  show={minimumPresumedIncome.employeeAdjustment}
                  onChange={() =>
                    updateMinimumPresumedIncome({
                      employeeAdjustment:
                        !minimumPresumedIncome.employeeAdjustment,
                    })
                  }
                >
                  <Text fontSize="sm" color="gray.700">
                    Ετήσιο κόστος μισθοδοσίας
                  </Text>
                  <NumberInput
                    value={minimumPresumedIncome.annualPayrollCost || ""}
                    onChange={(value) =>
                      updateMinimumPresumedIncome({
                        annualPayrollCost: Number(value),
                      })
                    }
                  >
                    <NumberInputField />
                  </NumberInput>
                  <Text fontSize="sm" color="gray.700">
                    Μικτές ετήσιες αποδοχές υψηλότερα αμειβόμενου
                  </Text>
                  <NumberInput
                    value={minimumPresumedIncome.highestPaidEmployeeGross || ""}
                    onChange={(value) =>
                      updateMinimumPresumedIncome({
                        highestPaidEmployeeGross: Number(value),
                      })
                    }
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormElements.CheckboxNested>

                <FormElements.CheckboxNested
                  label="Εφαρμόζεται προσαύξηση τζίρου βάσει ΚΑΔ"
                  isChecked={minimumPresumedIncome.turnoverAdjustment}
                  show={minimumPresumedIncome.turnoverAdjustment}
                  onChange={() =>
                    updateMinimumPresumedIncome({
                      turnoverAdjustment:
                        !minimumPresumedIncome.turnoverAdjustment,
                    })
                  }
                >
                  <Text fontSize="sm" color="gray.700">
                    Επίσημος μέσος ετήσιος τζίρος ΚΑΔ
                  </Text>
                  <NumberInput
                    value={minimumPresumedIncome.kadAverageTurnover || ""}
                    onChange={(value) =>
                      updateMinimumPresumedIncome({
                        kadAverageTurnover: Number(value),
                      })
                    }
                  >
                    <NumberInputField />
                  </NumberInput>
                  <Link href="https://www.aade.gr/shediasmos-apologismos/statistika/mesos-oros-etisioy-kykloy-ergasion-ana-kad">
                    <Text fontSize="xs" {...inlineLinkStyles}>
                      Πίνακες μέσου τζίρου ανά ΚΑΔ της ΑΑΔΕ
                    </Text>
                  </Link>
                </FormElements.CheckboxNested>

                <FormElements.CheckboxNested
                  label="Έχω εισόδημα από μισθό, σύνταξη ή αγροτική δραστηριότητα"
                  isChecked={minimumPresumedIncome.otherIncomeAdjustment}
                  show={minimumPresumedIncome.otherIncomeAdjustment}
                  onChange={() =>
                    updateMinimumPresumedIncome({
                      otherIncomeAdjustment:
                        !minimumPresumedIncome.otherIncomeAdjustment,
                    })
                  }
                >
                  <Text fontSize="sm" color="gray.700">
                    Συνολικό ετήσιο ποσό
                  </Text>
                  <NumberInput
                    value={minimumPresumedIncome.otherIncome || ""}
                    onChange={(value) =>
                      updateMinimumPresumedIncome({
                        otherIncome: Number(value),
                      })
                    }
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormElements.CheckboxNested>

                <FormElements.CheckboxNested
                  label="Δικαιούμαι εξαίρεση ή μείωση"
                  isChecked={minimumPresumedIncome.reliefAdjustment}
                  show={minimumPresumedIncome.reliefAdjustment}
                  onChange={() =>
                    updateMinimumPresumedIncome({
                      reliefAdjustment: !minimumPresumedIncome.reliefAdjustment,
                    })
                  }
                >
                  <FormElements.Select
                    label="Νόμιμη μεταχείριση"
                    value={minimumPresumedIncome.reliefType}
                    onChange={(event) =>
                      updateMinimumPresumedIncome({
                        reliefType: event.target.value,
                      })
                    }
                    options={[
                      { value: "none", text: "Επίλεξε" },
                      { value: "exempt", text: "Πλήρης εξαίρεση" },
                      { value: "half", text: "Μείωση 50%" },
                      { value: "limited", text: "Περιορισμένη διάρκεια" },
                    ]}
                  />
                  {minimumPresumedIncome.reliefType === "limited" && (
                    <Box>
                      <Text fontSize="sm" color="gray.700">
                        Επιλέξιμες ημέρες λειτουργίας
                      </Text>
                      <NumberInput
                        min={1}
                        max={365}
                        value={
                          minimumPresumedIncome.eligibleOperatingDays || ""
                        }
                        onChange={(value) =>
                          updateMinimumPresumedIncome({
                            eligibleOperatingDays: Number(value),
                          })
                        }
                      >
                        <NumberInputField />
                      </NumberInput>
                    </Box>
                  )}
                  <Link href="https://www.aade.gr/sites/default/files/2026-03/Odigies_E1_2026_0.pdf">
                    <Text fontSize="xs" {...inlineLinkStyles}>
                      Δες ποιες περιπτώσεις αναγνωρίζει η ΑΑΔΕ
                    </Text>
                  </Link>
                </FormElements.CheckboxNested>
              </Box>
            )}
          </SidebarSubSectionAccordion>
        </>
      )}

      <Box mt={6}>
        <BusinessNegotiateWidget />
      </Box>

      <Divider pt={6} />

      <SidebarSubSection title="Έξοδα">
        <FormElements.RadioGroup
          onChange={onChangeBusinessExpensesMonthOrYear}
          value={businessExpensesMonthOrYear}
          options={[
            { title: "Ανά μήνα", key: "month" },
            { title: "Ανά έτος", key: "year" },
          ]}
        />

        <Grid gridTemplateColumns="2fr 1fr" gap="0 16px" mt={4}>
          <GridItem>
            <Text fontWeight="500" color="gray.700">
              Κοινωνική ασφάλιση (ΕΦΚΑ)
            </Text>
            <NumberInput readOnly value={getInsuranceTotal()}>
              <NumberInputField />
            </NumberInput>
          </GridItem>
          <GridItem>
            <Text fontWeight="500" color="gray.700">
              Κλίμακα
            </Text>

            <NumberInput
              isDisabled={discountOptions.specialInsuranceScale}
              defaultValue={1}
              value={
                insuranceScaleSelection === 0 ? 1 : insuranceScaleSelection
              }
              max={rules.business.insurance.monthlyAmounts.length - 1}
              min={1}
              clampValueOnBlur={false}
              onChange={onChangeInsuranceScales}
            >
              <NumberInputField readOnly />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </GridItem>
        </Grid>

        <FormElements.Checkbox
          label="Ειδική (Νέοι ελεύθεροι επαγγελματίες μέχρι 5 έτη)"
          isChecked={discountOptions.specialInsuranceScale}
          onChange={() =>
            updateBusiness({
              discountOptions: {
                ...discountOptions,
                specialInsuranceScale: !discountOptions.specialInsuranceScale,
              },
              insuranceScaleSelection: !discountOptions.specialInsuranceScale
                ? 1
                : insuranceScaleSelection,
            })
          }
        />

        {rules.business.insurance.monthlyUnemploymentContribution > 0 && (
          <Text mt={2} fontSize="xs" color="gray.500">
            Το ποσό περιλαμβάνει εισφορά ανεργίας €
            {rules.business.insurance.monthlyUnemploymentContribution} ανά
            ασφαλισμένο μήνα. Δεν περιλαμβάνει τυχόν εισφορές επικουρικής
            ασφάλισης, εφάπαξ παροχής ή Στέγης Υγειονομικών.
          </Text>
        )}

        <Box mt={4}>
          <Text fontWeight="500" color="gray.700">
            Πρόσθετα έξοδα επιχείρησης
          </Text>
          <NumberInput
            mt={2}
            onChange={onChangeExtraBusinessExpenses}
            value={extraBusinessExpenses || ""}
          >
            <NumberInputField />
          </NumberInput>
        </Box>
      </SidebarSubSection>

      <Divider pt={6} />

      <SidebarSubSectionAccordion title="Φόροι & κρατήσεις">
        <Box>
          <Box mt={4}>
            <Text fontWeight="500" color="gray.700">
              Περσινή προκαταβολή φόρου
            </Text>
            <NumberInput mt={2} onChange={onChangePreviousYearTaxInAdvance}>
              <NumberInputField />
            </NumberInput>
          </Box>

          <Box mt={4}>
            <Text fontWeight="500" color="gray.700">
              Κρατήσεις
            </Text>

            <FormElements.CheckboxNested
              label={`Προκαταβολή φόρου (${formatRatePercentage(rules.business.taxPrepayment.rate)} με αφαίρεση παρακράτησης)`}
              isChecked={prePaidNextYearTax}
              show={prePaidNextYearTax}
              onChange={() =>
                updateBusiness({
                  prePaidNextYearTax: !prePaidNextYearTax,
                })
              }
            >
              <FormElements.CheckboxWithTooltip
                label={`Έκπτωση ${formatRatePercentage(1 - rules.business.taxPrepayment.discountMultiplier)} στην προκαταβολή`}
                tootipText={`Η προκαταβολή ξεκινά από το ${formatRatePercentage(rules.business.taxPrepayment.rate)} του φόρου και μειώνεται κατά την παρακράτηση.
                    Ποσό έως ${rules.business.taxPrepayment.minimumAssessmentAmount}€ δεν βεβαιώνεται. Για τα πρώτα τρία (3) έτη λειτουργίας υπάρχει
                    έκπτωση ${formatRatePercentage(1 - rules.business.taxPrepayment.discountMultiplier)}.`}
                isChecked={discountOptions.prePaidTaxDiscount}
                onChange={() =>
                  updateBusiness({
                    discountOptions: {
                      ...discountOptions,
                      prePaidTaxDiscount: !discountOptions.prePaidTaxDiscount,
                    },
                  })
                }
              />
            </FormElements.CheckboxNested>

            <FormElements.Checkbox
              label="Παρακράτηση φόρου"
              isChecked={withholdingTax}
              onChange={() =>
                updateBusiness({
                  withholdingTax: !withholdingTax,
                })
              }
            />
          </Box>
        </Box>
      </SidebarSubSectionAccordion>
    </>
  );
};

export default BusinessForm;
