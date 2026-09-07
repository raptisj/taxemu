const WAGE_BANDS = [
  { label: "≤500€", lower: 0, upper: 500 },
  { label: "501–600€", lower: 500, upper: 600 },
  { label: "601–700€", lower: 600, upper: 700 },
  { label: "701–800€", lower: 700, upper: 800 },
  { label: "801–900€", lower: 800, upper: 900 },
  { label: "901–1.000€", lower: 900, upper: 1000 },
  { label: "1.001–1.200€", lower: 1000, upper: 1200 },
  { label: "1.201–1.500€", lower: 1200, upper: 1500 },
  { label: "1.501–2.000€", lower: 1500, upper: 2000 },
  { label: "2.001–2.500€", lower: 2000, upper: 2500 },
  { label: "2.501–3.000€", lower: 2500, upper: 3000 },
  { label: ">3.000€", lower: 3000, upper: null },
];

const makeWageDistribution = (year, counts, sourceUrl) => ({
  year,
  sourceUrl,
  sourceName: "Π.Σ. ΕΡΓΑΝΗ, Πίνακας ΙΒ3",
  population:
    "Μισθωτοί με σχέση εργασίας ιδιωτικού δικαίου που καταγράφηκαν στο Π.Σ. ΕΡΓΑΝΗ",
  bins: WAGE_BANDS.map((band, index) => ({ ...band, count: counts[index] })),
});

export const wageDistributions = {
  2021: makeWageDistribution(
    2021,
    [
      395115, 65091, 272156, 285366, 190582, 167722, 237702, 208228, 164924,
      75480, 38528, 62716,
    ],
    "https://ypergasias.gov.gr/wp-content/uploads/2022/02/%CE%95%CE%99%CE%94%CE%99%CE%9A%CE%9F-%CE%A4%CE%95%CE%A5%CE%A7%CE%9F%CE%A3-2021-%CE%95%CE%A1%CE%93%CE%91%CE%9D%CE%97.pdf",
  ),
  2022: makeWageDistribution(
    2022,
    [
      336400, 71068, 55382, 376542, 274468, 247272, 279887, 230253, 180945,
      82164, 43207, 72011,
    ],
    "https://ypergasias.gov.gr/wp-content/uploads/2023/01/%CE%95%CE%99%CE%94%CE%99%CE%9A%CE%9F-%CE%A4%CE%95%CE%A5%CE%A7%CE%9F%CE%A3-2022.pdf",
  ),
  2023: makeWageDistribution(
    2023,
    [
      284134, 77145, 54505, 293928, 193472, 329847, 373163, 257574, 208623,
      92565, 48401, 83488,
    ],
    "https://ypergasias.gov.gr/wp-content/uploads/2024/02/%CE%95%CE%99%CE%94%CE%99%CE%9A%CE%9F-%CE%A4%CE%95%CE%A5%CE%A7%CE%9F%CE%A3-2023.pdf",
  ),
  2024: makeWageDistribution(
    2024,
    [
      239055, 64957, 64992, 55132, 325190, 357832, 462644, 315392, 241899,
      108573, 56445, 98046,
    ],
    "https://ypergasias.gov.gr/wp-content/uploads/2025/02/%CE%95%CE%A4%CE%97%CE%A3%CE%99%CE%91-%CE%95%CE%9A%CE%98%CE%95%CE%A3%CE%97-%CE%95%CE%A1%CE%93%CE%91%CE%9D%CE%97-2024.pdf",
  ),
  2025: makeWageDistribution(
    2025,
    [
      179791, 73262, 65566, 61063, 316134, 202490, 597695, 394159, 268058,
      126963, 63464, 112075,
    ],
    "https://ypergasias.gov.gr/wp-content/uploads/2026/02/EIDIKO-TEYXOS-2025.doc",
  ),
};

export const hicpInflation = {
  2022: { rate: 0.093, status: "actual" },
  2023: { rate: 0.042, status: "actual" },
  2024: { rate: 0.03, status: "actual" },
  2025: { rate: 0.029, status: "actual" },
};

// Eurostat's finalized annual-average HICP series is used for purchasing power.
export const hicpSource = {
  name: "Eurostat, HICP annual average rate of change",
  url: "https://ec.europa.eu/eurostat/databrowser/view/prc_hicp_ainr/default/table?lang=en",
};

export const purchasingPowerBaseYear = 2022;
export const latestActualInflationYear = 2025;
