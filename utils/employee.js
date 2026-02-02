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
