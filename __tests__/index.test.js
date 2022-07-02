import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../pages";

describe("Input field to calculate first scale(below 10000) income", () => {
  it("should set input gross income value", async () => {
    render(<Home />);

    const inputField = screen.getByTestId("grossIncome_form");
    await userEvent.type(inputField, "2400");

    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveValue("2400");
  });

  it("should print yearly and monthly gross income in table", async () => {
    render(<Home />);

    const tableFieldMonth = screen.getByTestId("grossIncome_tableCell_month");
    const tableFieldYear = screen.getByTestId("grossIncome_tableCell_year");

    expect(tableFieldYear).toHaveTextContent("€2,400");
    expect(tableFieldMonth).toHaveTextContent(
      String("€" + (2400 / 12).toFixed(0))
    );
  });

  it("should print yearly and monthly tax in table", async () => {
    render(<Home />);
    const tableFieldMonth = screen.getByTestId("totalTax_tableCell_month");
    const tableFieldYear = screen.getByTestId("totalTax_tableCell_year");

    expect(tableFieldYear).toHaveTextContent("€216");
    expect(tableFieldMonth).toHaveTextContent(
      String("€" + (216 / 12).toFixed(0))
    );
  });

  it("should print yearly and monthly final income in table", async () => {
    render(<Home />);

    const tableFieldMonth = screen.getByTestId("finalIncome_tableCell_month");
    const tableFieldYear = screen.getByTestId("finalIncome_tableCell_year");

    expect(tableFieldYear).toHaveTextContent("€2,184");
    expect(tableFieldMonth).toHaveTextContent(
      String("€" + (2184 / 12).toFixed(0))
    );
  });
});

describe("Taxable year duration radio(11 months)", () => {
  it("is changed to non full year", async () => {
    render(<Home />);
    
    const user = userEvent;
    expect(
      screen.getByLabelText("Ολόκληρο Φορολογικό Έτος")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Μη Ολόκληρο Φορολογικό Έτος")
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText("Μη Ολόκληρο Φορολογικό Έτος"));
  });

  it("should change yearly gross income in table", async () => {
    render(<Home />);

    const tableFieldMonth = screen.getByTestId("grossIncome_tableCell_month");
    const tableFieldYear = screen.getByTestId("grossIncome_tableCell_year");

    expect(tableFieldYear).toHaveTextContent("€2,200");
    // monthly should be constant with initial gross income
    expect(tableFieldMonth).toHaveTextContent(
      String("€" + (2400 / 12).toFixed(0))
    );
  });


  it("should change yearly and monthly tax in table", async () => {
    render(<Home />);

    const tableFieldMonth = screen.getByTestId("totalTax_tableCell_month");
    const tableFieldYear = screen.getByTestId("totalTax_tableCell_year");

    expect(tableFieldYear).toHaveTextContent("€198");
    expect(tableFieldMonth).toHaveTextContent(
      String("€" + (199 / 11).toFixed(0))
    );
  });

  it("should change yearly and monthly final income in table", async () => {
    render(<Home />);

    const tableFieldMonth = screen.getByTestId("finalIncome_tableCell_month");
    const tableFieldYear = screen.getByTestId("finalIncome_tableCell_year");

    expect(tableFieldYear).toHaveTextContent("€2,002");
    expect(tableFieldMonth).toHaveTextContent(
      String("€" + (2002 / 11).toFixed(0))
    );
  });
});
