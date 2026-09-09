import { calculateInvoice } from "./calculateInvoice";

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
});
