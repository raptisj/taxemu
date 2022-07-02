import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../pages";

describe("Input field to calculate business expenses", () => {
  it("should add expenses", async () => {
    render(<Home />);

    const accountantFeesInputField = screen.getByTestId("accountantFees_form");
    const healthInsuranceInputField = screen.getByTestId(
      "healthInsuranceFees_form"
    );
    const extraBusinessExpensesInputField = screen.getByTestId(
      "extraBusinessExpenses_form"
    );
    
    await userEvent.type(accountantFeesInputField, "50");
    await userEvent.type(healthInsuranceInputField, "136");
    await userEvent.type(extraBusinessExpensesInputField, "120");

    expect(accountantFeesInputField).toHaveValue("50");
    expect(healthInsuranceInputField).toHaveValue("136");
    expect(extraBusinessExpensesInputField).toHaveValue("120");

    const tableFieldMonth = screen.getByTestId(
      "totalBusinessExpenses_tableCell_month"
    );
    const tableFieldYear = screen.getByTestId(
      "totalBusinessExpenses_tableCell_year"
    );

    const totalExpenses =
      ((Number(accountantFeesInputField.value) +
      Number(healthInsuranceInputField.value)) * 12) + Number(extraBusinessExpensesInputField.value);

    expect(tableFieldYear).toHaveTextContent(
      "€" + totalExpenses.toLocaleString("en-US").split(".")[0]
    );
    expect(tableFieldMonth).toHaveTextContent(
      String("€" + (totalExpenses / 12).toFixed(0))
    );
  });
});
