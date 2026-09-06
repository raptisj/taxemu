import {
  calcFinal,
  calculateComparisonPercentile,
  calculateInflationDetails,
  formatCellValue,
  formatEuroCurrency,
  roundNumberWithFixed,
  sortByMultiplier,
} from "utils";

describe("Helper functions", () => {
  it("should print number in string value and euro sign", () => {
    expect(formatCellValue(200)).toBe("€200");
  });

  it("should print dash if value is not valid", () => {
    expect(formatCellValue()).toBe("------");
    expect(formatCellValue(null)).toBe("------");
    expect(formatCellValue(200, false)).toBe("------");
  });

  it("subtracts table amounts from the first value", () => {
    expect(
      calcFinal(
        {
          gross: { year: 30000 },
          tax: { year: 5000 },
          insurance: { year: 3000 },
        },
        "year",
      ),
    ).toBe(22000);
  });

  it("sorts scale entries by multiplier", () => {
    const values = [{ multiplier: 0.4 }, { multiplier: 0.1 }, { multiplier: 0.2 }];
    expect(values.sort(sortByMultiplier)).toEqual([
      { multiplier: 0.1 },
      { multiplier: 0.2 },
      { multiplier: 0.4 },
    ]);
    expect(sortByMultiplier(values[0], values[0])).toBe(0);
  });

  it("rounds to the requested decimal places", () => {
    expect(roundNumberWithFixed(1.2345)).toBe(1.23);
    expect(roundNumberWithFixed(1.2355, 3)).toBe(1.236);
  });

  test.each([
    [0, 0],
    [50, 12.5],
    [150, 62.5],
    [250, 100],
  ])("calculates percentile for value %s", (value, expected) => {
    const data = [
      { name: 0, value: 0 },
      { name: 100, value: 10 },
      { name: 200, value: 30 },
    ];
    expect(calculateComparisonPercentile(value, data)).toBe(expected);
  });

  it("calculates compounded inflation details", () => {
    expect(calculateInflationDetails(100, [0.1, 0.1])).toEqual({
      finalAmount: "121.00",
      increaseAmount: "21.00",
      increasePercentage: "21.00",
      amounts: [100, 110, 121],
    });
  });

  it("formats whole euro amounts", () => {
    expect(formatEuroCurrency(1234.5)).toBe("1.235€");
  });
});
