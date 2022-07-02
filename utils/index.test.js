import { formatCellValue } from "utils";

describe("Helper functions", () => {
  it("should print number in string value and euro sign", () => {
    expect(formatCellValue(200)).toBe("€200");
  });

  it("should print dash if value is not valid", () => {
    expect(formatCellValue()).toBe("------");
    expect(formatCellValue(null)).toBe("------");
  });
});
