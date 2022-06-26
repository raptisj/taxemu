import React from "react";
import { Pie } from "react-chartjs-2";


export default function PieChart({ amount, finalIncome }) {
  const preData = [
    {
      label: "Φόρος",
      value: amount.totalTax.year,
    },
    {
      label: "Καθαρά",
      value: finalIncome(),
    },
    {
      label: "Έξοδα Επιχείρησης",
      value: amount.totalBusinessExpenses.year,
    },
    {
      label: "Αμοιβή Λογιστή",
      value: amount.accountantFees.year,
    },
    {
      label: "Κοινωνική Ασφάλιση(ΕΦΚΑ)",
      value: amount.healthInsuranceFees.year,
    },
    {
      label: "Αποταμίευση",
      value: amount.savings.year,
    },
  ];

  const data = {
    labels: preData
      .filter((l) => l.value !== 0 && typeof l.value !== "string")
      .map((l) => l.label),
    datasets: [
      {
        data: preData.map((l) => l.value),
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = ` ${context.label}`;
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "EUR",
              }).format(context.parsed);
            }
            return label;
          },
          footer: function (context) {
            let str = `${(
              (context[0].parsed / amount.grossIncome.year) *
              100
            ).toFixed(1)} % των εσόδων`;
            return str;
          },
        },
      },
    },
  };

  return <Pie data={data} options={options} />;
}
