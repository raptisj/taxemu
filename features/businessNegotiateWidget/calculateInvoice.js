export const calculateInvoice = ({ fee, vatRate, withholdingRate }) => {
  const safeFee = Math.max(0, Number(fee) || 0);
  const vat = safeFee * (Number(vatRate) || 0);
  const withholding = safeFee * (Number(withholdingRate) || 0);

  return {
    fee: safeFee,
    vat,
    withholding,
    invoiceTotal: safeFee + vat,
    clientPayment: safeFee + vat - withholding,
    availableAfterVat: safeFee - withholding,
  };
};
