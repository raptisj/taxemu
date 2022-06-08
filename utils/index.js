export const formatCellValue = (val) =>
  val ? `€${val.toLocaleString("en-US").split(".")[0]}` : "------";

export const calcFinal = (obj, type) => {
  return Object.keys(obj)
    .map((p) => obj[p][type])
    .reduce((pre, cur) => (cur = pre - cur));
};

export const finalIncome = (amount, type) =>
  calcFinal(amount, type) > 0 ? calcFinal(amount, type) : "------";
