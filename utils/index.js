export const formatCellValue = (val, submitGuard = true) =>
  val && submitGuard
    ? `€${val.toLocaleString("en-US").split(".")[0]}`
    : "------";

export const calcFinal = (obj, type) => {
  return Object.keys(obj)
    .map((p) => obj[p][type])
    .reduce((pre, cur) => (cur = pre - cur));
};

export const sortByMultiplier = (a, b) => {
  if (a.multiplier < b.multiplier) {
    return -1;
  }
  if (a.multiplier > b.multiplier) {
    return 1;
  }
  return 0;
};

export const roundNumberWithFixed = (num, decimalPlaces = 2) => {
  const fixedString = num.toFixed(decimalPlaces);
  return parseFloat(fixedString);
};

export const calculateComparisonPercentile = (value, data) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  let cumulativeValue = 0;
  let lowerBound = 0;
  let upperBound = 0;
  let rangeValue = 0;

  for (let i = 0; i < data.length; i++) {
    const currentKey = Number(data[i].name);
    const currentValue = data[i].value;

    if (value <= currentKey) {
      upperBound = currentKey;
      rangeValue = currentValue;

      lowerBound = i > 0 ? Number(data[i - 1].name) : 0;

      cumulativeValue = data
        .slice(0, i)
        .reduce((sum, item) => sum + item.value, 0);
      break;
    }
  }

  if (value > Number(data[data.length - 1].name)) {
    return 100;
  }

  const rangeWidth = upperBound - lowerBound;
  const valueOffset = value - lowerBound;
  const proportionInRange = rangeWidth > 0 ? valueOffset / rangeWidth : 0;
  const additionalValue = rangeValue * proportionInRange;

  const totalUpToValue = cumulativeValue + additionalValue;

  const percentile = (totalUpToValue / totalValue) * 100;

  return Number(percentile.toFixed(2));
};

export const calculateInflationDetails = (initialAmount, inflationRates) => {
  let amount = initialAmount;
  const amountsOnly = [initialAmount];

  for (let rate of inflationRates) {
    amount *= 1 + rate;
    amountsOnly.push(Number(amount.toFixed(2)));
  }
  const finalAmount = amount;
  const increaseAmount = finalAmount - initialAmount;
  const increasePercentage = (increaseAmount / initialAmount) * 100;

  return {
    finalAmount: finalAmount.toFixed(2),
    increaseAmount: increaseAmount.toFixed(2),
    increasePercentage: increasePercentage.toFixed(2),
    amounts: amountsOnly,
  };
};

export const formatEuroCurrency = (value) => {
  return (
    new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + "€"
  );
};

// Re-export tax utility functions
export {
  assertFiniteNonNegative,
  getBrackets,
  calcProgressiveTax,
} from "./employee";
