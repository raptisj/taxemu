export const getWageDistributionForYear = (year, distributions) => {
  const availableYears = Object.keys(distributions)
    .map(Number)
    .sort((a, b) => a - b);
  const requestedYear = Number(year);
  const matchingOrPrevious = availableYears.filter(
    (availableYear) => availableYear <= requestedYear,
  );
  const selectedYear = matchingOrPrevious.length
    ? matchingOrPrevious[matchingOrPrevious.length - 1]
    : availableYears[0];

  return {
    ...distributions[selectedYear],
    requestedYear,
    isFallback: selectedYear !== requestedYear,
  };
};

export const calculateBinnedPercentile = (value, bins) => {
  const numericValue = Number(value);
  const total = bins.reduce((sum, bin) => sum + bin.count, 0);

  if (!Number.isFinite(numericValue) || numericValue <= 0 || total <= 0) {
    return { percentile: 0, isLowerBound: false, selectedBin: null };
  }

  let below = 0;

  for (const bin of bins) {
    const isOpenEnded = bin.upper === null;
    if (isOpenEnded || numericValue <= bin.upper) {
      if (isOpenEnded) {
        return {
          percentile: Number(((below / total) * 100).toFixed(1)),
          isLowerBound: true,
          selectedBin: bin,
        };
      }

      const width = bin.upper - bin.lower;
      const position = Math.min(
        1,
        Math.max(0, (numericValue - bin.lower) / width),
      );
      const estimatedBelow = below + bin.count * position;

      return {
        percentile: Number(((estimatedBelow / total) * 100).toFixed(1)),
        isLowerBound: false,
        selectedBin: bin,
      };
    }

    below += bin.count;
  }

  return { percentile: 100, isLowerBound: true, selectedBin: null };
};

export const getInflationRatesBetween = (fromYear, toYear, inflationByYear) =>
  Object.entries(inflationByYear)
    .map(([year, details]) => ({ year: Number(year), ...details }))
    .filter(({ year }) => year > fromYear && year <= toYear)
    .sort((a, b) => a.year - b.year);

export const calculateEmployerCostBreakdown = ({
  finalIncome,
  incomeTax,
  employeeContributions,
  employerContributions,
  totalEmployerCost,
}) => {
  const total = Number(totalEmployerCost);
  const components = [
    { key: "netIncome", label: "Καθαρός μισθός", amount: Number(finalIncome) },
    { key: "incomeTax", label: "Φόρος εισοδήματος", amount: Number(incomeTax) },
    {
      key: "employeeContributions",
      label: "Εισφορές εργαζομένου",
      amount: Number(employeeContributions),
    },
    {
      key: "employerContributions",
      label: "Εισφορές εργοδότη",
      amount: Number(employerContributions),
    },
  ];

  if (!Number.isFinite(total) || total <= 0) {
    return components.map((component) => ({
      ...component,
      amount: 0,
      perHundred: 0,
    }));
  }

  return components.map((component) => {
    const amount = Number.isFinite(component.amount)
      ? Math.max(0, component.amount)
      : 0;

    return {
      ...component,
      amount,
      perHundred: Number(((amount / total) * 100).toFixed(2)),
    };
  });
};
