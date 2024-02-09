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
