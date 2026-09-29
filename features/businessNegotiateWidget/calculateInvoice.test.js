import {
  calculateInvoice,
  getEffectiveVatRate,
} from "./calculateInvoice";

describe("calculateInvoice", () => {
  it("separates invoice total, client payment, and available amount", () => {
    expect(
      calculateInvoice({ fee: 1000, vatRate: 0.24, withholdingRate: 0.2 }),
    ).toEqual({
      fee: 1000,
      vat: 240,
      withholding: 200,
      invoiceTotal: 1240,
      clientPayment: 1040,
      availableAfterVat: 800,
    });
  });

  it("supports cases without VAT or withholding", () => {
    expect(
      calculateInvoice({ fee: 1000, vatRate: 0, withholdingRate: 0 }),
    ).toEqual({
      fee: 1000,
      vat: 0,
      withholding: 0,
      invoiceTotal: 1000,
      clientPayment: 1000,
      availableAfterVat: 1000,
    });
  });

  it.each([
    [0.24, 240, 1240],
    [0.13, 130, 1130],
    [0.06, 60, 1060],
    [0.04, 40, 1040],
  ])(
    "calculates a €1,000 invoice with VAT rate %s",
    (vatRate, expectedVat, expectedTotal) => {
      const result = calculateInvoice({
        fee: 1000,
        vatRate,
        withholdingRate: 0,
      });

      expect(result.vat).toBe(expectedVat);
      expect(result.invoiceTotal).toBe(expectedTotal);
    },
  );

  it.each([
    [0.24, 0.17],
    [0.13, 0.09],
    [0.06, 0.04],
    [0.04, 0.03],
  ])(
    "uses the prescribed island rate for base rate %s",
    (baseVatRate, expectedRate) => {
      expect(
        getEffectiveVatRate({
          baseVatRate,
          applyIslandVatReduction: true,
          islandVatRates: {
            "0.24": 0.17,
            "0.13": 0.09,
            "0.06": 0.04,
            "0.04": 0.03,
          },
        }),
      ).toBe(expectedRate);
    },
  );

  it("does not reduce a no-VAT or standard-rate selection", () => {
    expect(
      getEffectiveVatRate({
        baseVatRate: 0,
        applyIslandVatReduction: true,
        islandVatRates: { "0.24": 0.17 },
      }),
    ).toBe(0);
    expect(
      getEffectiveVatRate({
        baseVatRate: 0.24,
        applyIslandVatReduction: false,
        islandVatRates: { "0.24": 0.17 },
      }),
    ).toBe(0.24);
  });
});
