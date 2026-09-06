import { calcProgressiveTax, toFixedNumber } from "./employee";

const assertTaxContext = (taxableIncome, ageGroup, children) => {
  if (!Number.isFinite(taxableIncome) || taxableIncome < 0) {
    throw new Error("taxableIncome must be non-negative");
  }
  if (!Number.isInteger(children) || children < 0) {
    throw new Error("children must be a non-negative integer");
  }
  if (!ageGroup) {
    throw new Error("invalid ageGroup");
  }
};

const selectDemographicBrackets = (policy, ageGroup, children) => {
  const group = policy.bracketsByAgeAndChildren[ageGroup];
  if (!group) {
    throw new Error("invalid ageGroup");
  }

  const exact = group[String(children)];
  if (exact) return exact;

  const configuredCounts = Object.keys(group).map(Number);
  const highestCount = Math.max(...configuredCounts);
  if (children > highestCount) return group[String(highestCount)];

  throw new Error(`No tax brackets configured for ${children} children`);
};

const resolveBusinessModifierBrackets = (
  policy,
  taxableIncome,
  ageGroup,
  children,
) => {
  const brackets = policy.brackets.map((bracket) => ({ ...bracket }));
  const childRules = policy.children;

  if (children >= 4) {
    brackets.forEach((bracket) => {
      if (
        bracket.upTo !== null &&
        bracket.upTo <= childRules.fourOrMore.exemptThrough
      ) {
        bracket.rate = 0;
      }
    });
    brackets[2].rate = Math.max(
      childRules.fourOrMore.minimumRate,
      childRules.fourOrMore.thirdBracketBaseRate -
        childRules.fourOrMore.decrementPerAdditionalChild * (children - 4),
    );
  } else {
    brackets[1].rate = Math.min(
      brackets[1].rate,
      childRules.secondBracketRates[String(children)] ?? brackets[1].rate,
    );
    brackets[2].rate = Math.min(
      brackets[2].rate,
      childRules.thirdBracketRates[String(children)] ?? brackets[2].rate,
    );
  }

  if (taxableIncome <= policy.ageRelief.maximumTaxableIncome) {
    const ageRates = policy.ageRelief.ratesByAgeGroup[ageGroup];
    if (ageRates) {
      brackets[0].rate = Math.min(brackets[0].rate, ageRates[0]);
      brackets[1].rate = Math.min(brackets[1].rate, ageRates[1]);
    }
  }

  return brackets;
};

export const calculateIncomeTaxFromPolicy = ({
  taxableIncome,
  policy,
  ageGroup = "A30P",
  children = 0,
}) => {
  if (policy.kind === "progressive") {
    return {
      tax: calcProgressiveTax(taxableIncome, policy.brackets),
      brackets: policy.brackets,
    };
  }

  assertTaxContext(taxableIncome, ageGroup, children);

  if (policy.kind === "progressiveByAgeAndChildren") {
    const brackets = selectDemographicBrackets(policy, ageGroup, children);
    return {
      tax: toFixedNumber(calcProgressiveTax(taxableIncome, brackets), 2),
      brackets,
    };
  }

  if (policy.kind === "progressiveWithAgeAndChildren") {
    const brackets = resolveBusinessModifierBrackets(
      policy,
      taxableIncome,
      ageGroup,
      children,
    );
    return {
      tax: toFixedNumber(calcProgressiveTax(taxableIncome, brackets), 2),
      brackets,
    };
  }

  throw new Error(`Unknown income-tax policy: ${policy.kind}`);
};
