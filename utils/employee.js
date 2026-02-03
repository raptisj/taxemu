/** Tax calculation utility functions */

/**
 * Asserts that a value is a finite non-negative number
 * @param {number} n - The number to validate
 * @param {string} name - The name of the parameter for error messages
 * @throws {Error} If the number is not finite or negative
 */
export function assertFiniteNonNegative(n, name) {
  if (!Number.isFinite(n) || n < 0)
    throw new Error(`${name} must be a finite non-negative number`);
}

/**
 * Gets the appropriate tax brackets for a given age group and number of children
 * @param {Object} scalesByAgeGroup - The scales organized by age group
 * @param {string} ageGroup - The age group to look up
 * @param {number} children - The number of children
 * @returns {Array} The tax brackets for the given parameters
 * @throws {Error} If no appropriate scale is found
 */
export function getBrackets(scalesByAgeGroup, ageGroup, children) {
  const group = scalesByAgeGroup?.[ageGroup];
  if (!group) throw new Error(`Unknown ageGroup: ${ageGroup}`);

  const keyExact = String(children);
  if (group[keyExact]) return group[keyExact];

  // Optional cap: if you store up to "5", reuse "5" for 6+
  const cappedKey = group["5"] && children > 5 ? "5" : null;
  if (cappedKey) return group[cappedKey];

  if (group.default) return group.default;

  throw new Error(
    `No scale found for ageGroup=${ageGroup}, children=${children}`,
  );
}

/**
 * Calculates progressive tax based on income and tax brackets
 * @param {number} income - The income to calculate tax for
 * @param {Array} brackets - The tax brackets to apply
 * @returns {number} The calculated tax amount
 * @throws {Error} If brackets contain invalid data
 */
export function calcProgressiveTax(income, brackets) {
  let tax = 0;
  let prevCap = 0;

  for (const b of brackets) {
    const cap = b.upTo; // number or null
    const rate = b.rate;
    if (!Number.isFinite(rate) || rate < 0)
      throw new Error(`Invalid rate: ${rate}`);

    if (cap === null) {
      const amount = Math.max(0, income - prevCap);
      tax += amount * rate;
      return tax;
    }

    if (!Number.isFinite(cap) || cap < prevCap)
      throw new Error(`Invalid bracket cap: ${cap}`);

    const amount = Math.max(0, Math.min(income, cap) - prevCap);
    tax += amount * rate;
    prevCap = cap;

    if (income <= cap) break;
  }
  return tax;
}

const roundTo2 = (value) => Math.round(value * 100) / 100;

export const roundMoney = (value) => Math.round(value);
export const ceilMoney = (value) => Math.ceil(value);
export const toFixedNumber = (value, digits = 0) =>
  Number(value.toFixed(digits));

/**
 * Calculates income tax using a progressive bracket system.
 * @param {Object} params
 * @param {number} params.taxableIncome
 * @param {string} params.ageGroup
 * @param {number} params.children
 * @param {Object} params.scalesByAgeGroup
 * @returns {{taxableIncome:number, ageGroup:string, children:number, grossTax:number}}
 */
export function calculateIncomeTax({
  taxableIncome,
  ageGroup,
  children = 0,
  scalesByAgeGroup,
}) {
  assertFiniteNonNegative(taxableIncome, "taxableIncome");
  if (!Number.isInteger(children) || children < 0) {
    throw new Error("children must be a non-negative integer");
  }

  const brackets = getBrackets(scalesByAgeGroup, ageGroup, children);
  const grossTax = calcProgressiveTax(taxableIncome, brackets);

  return {
    taxableIncome,
    ageGroup,
    children,
    grossTax: roundTo2(grossTax),
  };
}

/**
 * Calculates tax using fixed scales.
 * @param {Object} params
 * @param {Array} params.currentScales
 * @param {number} params.sumToBeTaxed
 * @param {number} params.threshold
 * @returns {number}
 */
export function calculateEmployeeScalesTax({
  currentScales,
  sumToBeTaxed,
  threshold = 10000,
}) {
  const initial = { remaining: sumToBeTaxed, totalTax: 0 };

  const result = currentScales.reduce((acc, scale, index) => {
    const taxableAmount =
      acc.remaining <= 0
        ? 0
        : index < 4
          ? Math.min(acc.remaining, threshold)
          : acc.remaining;

    return {
      remaining: Math.max(0, acc.remaining - taxableAmount),
      totalTax: acc.totalTax + taxableAmount * scale.multiplier,
    };
  }, initial);

  return result.totalTax;
}

/**
 * Calculates the child discount, with a reduction above a threshold.
 * @param {Object} params
 * @param {number} params.amount
 * @param {number} params.childDiscountAmount
 * @returns {{discount:number}}
 */
export function calculateChildrenDiscount({ amount, childDiscountAmount }) {
  if (amount > 12000) {
    const aboveThresholdAmount = amount - 12000;
    const result = aboveThresholdAmount * 0.02;
    return { discount: childDiscountAmount - result };
  }
  return { discount: childDiscountAmount };
}

/**
 * Applies a conditional base reduction for inland return.
 * @param {number} sumToBeTaxed
 * @param {boolean} returnBaseInland
 * @param {number} percentage
 * @returns {number}
 */
export function applyReturnBaseInland(
  sumToBeTaxed,
  returnBaseInland,
  percentage = 0.5,
) {
  return returnBaseInland ? sumToBeTaxed * percentage : sumToBeTaxed;
}

/**
 * Omits a discount if it results in a negative tax.
 * @param {number} taxBefore
 * @param {number} discount
 * @returns {number}
 */
export function omitDiscountIfNegative(taxBefore, discount) {
  if (discount < 0) {
    return Math.ceil(taxBefore);
  }
  return Math.round(Math.ceil(taxBefore) - Math.ceil(discount));
}
