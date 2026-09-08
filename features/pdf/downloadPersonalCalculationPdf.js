import React from "react";
import { pdf } from "@react-pdf/renderer";
import { PersonalCalculationPdfDocument } from "./PersonalCalculationPdfDocument";

const getFilename = (data) => {
  const entity = data.entity === "employee" ? "misthotos" : "epaggelmatias";
  const years = data.comparison
    ? data.comparison.years.join("-")
    : String(data.taxationYear);
  return `taxemu-${entity}-${years}.pdf`;
};

export const downloadPersonalCalculationPdf = async (data) => {
  const blob = await pdf(
    React.createElement(PersonalCalculationPdfDocument, { data }),
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getFilename(data);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

