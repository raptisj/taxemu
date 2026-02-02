export const insuranceScales2021 = {
  insuranceScales: {
    0: {
      amount: 136,
    },
    1: {
      amount: 220,
    },
    2: {
      amount: 262,
    },
    3: {
      amount: 312,
    },
    4: {
      amount: 373,
    },
    5: {
      amount: 445,
    },
  },
};
export const insuranceScales2022 = insuranceScales2021;

export const insuranceScales2023 = {
  insuranceScales: {
    0: {
      amount: 136,
    },
    1: {
      amount: 230,
    },
    2: {
      amount: 276,
    },
    3: {
      amount: 350,
    },
    4: {
      amount: 442,
    },
    5: {
      amount: 550,
    },
    6: {
      amount: 746,
    },
  },
};

export const insuranceScales2024 = {
  insuranceScales: {
    0: {
      amount: 142,
    },
    1: {
      amount: 239,
    },
    2: {
      amount: 287,
    },
    3: {
      amount: 364,
    },
    4: {
      amount: 459,
    },
    5: {
      amount: 572,
    },
    6: {
      amount: 776,
    },
  },
};

export const insuranceScales2025 = {
  insuranceScales: {
    0: {
      amount: 147,
    },
    1: {
      amount: 244,
    },
    2: {
      amount: 293,
    },
    3: {
      amount: 351,
    },
    4: {
      amount: 422,
    },
    5: {
      amount: 507,
    },
    6: {
      amount: 660,
    },
  },
};

export const insuranceScales2026 = {
  insuranceScales: {
    0: {
      amount: 150,
    },
    1: {
      amount: 250,
    },
    2: {
      amount: 300,
    },
    3: {
      amount: 360,
    },
    4: {
      amount: 433,
    },
    5: {
      amount: 519,
    },
    6: {
      amount: 675,
    },
  },
};

export const taxScales2021 = {
  taxScales: [
    {
      multiplier: 0.09,
      amount: 0,
    },
    {
      multiplier: 0.22,
      amount: 0,
    },
    {
      multiplier: 0.28,
      amount: 0,
    },
    {
      multiplier: 0.36,
      amount: 0,
    },
    {
      multiplier: 0.44,
      amount: 0,
    },
  ],
};

export const taxScales2026 = {
  taxScales: [
    {
      multiplier: 0.09,
      amount: 0,
    },
    {
      multiplier: 0.2,
      amount: 0,
    },
    {
      multiplier: 0.26,
      amount: 0,
    },
    {
      multiplier: 0.34,
      amount: 0,
    },
    {
      multiplier: 0.44,
      amount: 0,
    },
  ],
};

export const taxScales2022 = taxScales2021;
export const taxScales2023 = taxScales2021;

export const wageData2024 = [
  { name: 0, value: 0, percentage: 0 },
  { name: 500, value: 239055, percentage: 10.0 },
  { name: 600, value: 64957, percentage: 2.72 },
  { name: 700, value: 64992, percentage: 2.72 },
  { name: 800, value: 55132, percentage: 2.31 },
  { name: 900, value: 325190, percentage: 13.61 },
  { name: 1000, value: 357832, percentage: 14.97 },
  { name: 1200, value: 462644, percentage: 19.36 },
  { name: 1500, value: 315392, percentage: 13.2 },
  { name: 2000, value: 241899, percentage: 10.12 },
  { name: 2500, value: 108573, percentage: 4.54 },
  { name: 3000, value: 154491, percentage: 6.46 },
];

export const inflationRates = [0.093, 0.042, 0.029, 0.028, 0.023]; // 9.3%, 4.2%, 2.9%, 2.8%, 2.3%
export const inflationRatesMap = {
  2022: 0.093,
  2023: 0.042,
  2024: 0.029,
  2025: 0.028,
  2026: 0.023,
};

// for employee 2026
export const AGE_GROUPS = Object.freeze({
  U25: "U25", // <= 25
  A26_30: "A26_30", // 26-30
  A30P: "A30P", // > 30
});

// Example constants (EDIT to match your exact tables)
export const SCALES_BY_AGE_GROUP = Object.freeze({
  [AGE_GROUPS.A30P]: {
    // keys: "0", "1", "2", "3", "4", "5" ... or "default"
    0: [
      { upTo: 10000, rate: 0.09 },
      { upTo: 20000, rate: 0.2 },
      { upTo: 30000, rate: 0.26 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
    1: [
      { upTo: 10000, rate: 0.09 },
      { upTo: 20000, rate: 0.18 },
      { upTo: 30000, rate: 0.24 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
    2: [
      { upTo: 10000, rate: 0.09 },
      { upTo: 20000, rate: 0.16 },
      { upTo: 30000, rate: 0.22 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
    3: [
      { upTo: 20000, rate: 0.09 },
      { upTo: 30000, rate: 0.2 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
    4: [
      { upTo: 20000, rate: 0.0 },
      { upTo: 30000, rate: 0.18 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
    5: [
      { upTo: 20000, rate: 0.0 },
      { upTo: 30000, rate: 0.16 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
  },

  [AGE_GROUPS.U25]: {
    // Example: 0% up to 20k, then child-dependent rate at 20-30k, then standard top brackets
    0: [
      { upTo: 20000, rate: 0.0 },
      { upTo: 30000, rate: 0.26 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
    1: [
      { upTo: 20000, rate: 0.0 },
      { upTo: 30000, rate: 0.24 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
    2: [
      { upTo: 20000, rate: 0.0 },
      { upTo: 30000, rate: 0.22 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
    3: [
      { upTo: 20000, rate: 0.0 },
      { upTo: 30000, rate: 0.2 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
    4: [
      { upTo: 20000, rate: 0.0 },
      { upTo: 30000, rate: 0.18 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
    5: [
      { upTo: 20000, rate: 0.0 },
      { upTo: 30000, rate: 0.16 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
  },

  // Fill in with your exact 26–30 tables
  [AGE_GROUPS.A26_30]: {
    0: [
      { upTo: 10000, rate: 0.09 },
      { upTo: 20000, rate: 0.09 },
      { upTo: 30000, rate: 0.26 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
    // add "1","2","3","4","5" as needed
    default: [
      { upTo: 10000, rate: 0.09 },
      { upTo: 20000, rate: 0.09 },
      { upTo: 30000, rate: 0.26 },
      { upTo: 40000, rate: 0.34 },
      { upTo: 60000, rate: 0.39 },
      { upTo: null, rate: 0.44 },
    ],
  },
});
