export const oecdTaxWedge2025 = Object.freeze({
  year: 2025,
  publicationYear: 2026,
  averageGrossWageGreece: 26563,
  referenceProfile: "Άγαμος εργαζόμενος χωρίς παιδιά με τον μέσο μισθό",
  greece: Object.freeze({
    total: 39.3,
    rank: 19,
    incomeTax: 10.5,
    employeeContributions: 11.0,
    employerContributions: 17.9,
  }),
  oecd: Object.freeze({
    total: 35.1,
    incomeTax: 13.4,
    employeeContributions: 8.1,
    employerContributions: 13.5,
  }),
  householdProfiles: Object.freeze([
    Object.freeze({
      key: "single-average",
      title: "Άγαμος, χωρίς παιδιά",
      description: "Μικτός μισθός ίσος με τον μέσο μισθό κάθε χώρας",
      greece: 39.3,
      oecd: 35.1,
    }),
    Object.freeze({
      key: "single-parent",
      title: "Άγαμος, 2 παιδιά",
      description:
        "Μικτός μισθός ίσος με το 67% του μέσου μισθού κάθε χώρας",
      greece: 29.0,
      oecd: 16.3,
    }),
    Object.freeze({
      key: "one-earner-family",
      title: "Ζευγάρι, 1 εργαζόμενος, 2 παιδιά",
      description:
        "Ένας μικτός μισθός ίσος με τον μέσο μισθό κάθε χώρας",
      greece: 37.5,
      oecd: 26.2,
    }),
  ]),
  sources: Object.freeze({
    report:
      "https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en.html",
    greece:
      "https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en/full-report/greece_027f4efa.html",
    methodology:
      "https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en/full-report/methodology-and-limitations_f25b8cbc.html",
    dataExplorer:
      "https://data-explorer.oecd.org/vis?df%5Bag%5D=OECD.CTP.TPS&df%5Bid%5D=DSD_TAX_WAGES_COMP%40DF_TW_COMP",
  }),
});
