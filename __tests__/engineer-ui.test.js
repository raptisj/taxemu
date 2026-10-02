import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import EmployeeInsuranceFields from "../components/employee/EmployeeInsuranceFields";
import EmployeeContributionBreakdown from "../components/employee/EmployeeContributionBreakdown";
import { calculateEngineerContributions } from "../utils/employeeContributions";

const defaults = {
  taxationYear: 2026, salaryMonthCount: 14, insuranceProfile: "general",
  supplementaryCategory: 1, lumpSumCategory: 1, supplementaryFund: "efka",
};

const Fields = ({ initial = defaults }) => {
  const [details, setDetails] = useState(initial);
  return <EmployeeInsuranceFields details={details} onChange={(patch) => setDetails((current) => ({ ...current, ...patch }))} />;
};

describe("salaried engineer fields and breakdown", () => {
  beforeAll(() => jest.spyOn(window, "scrollTo").mockImplementation(() => {}));
  afterAll(() => window.scrollTo.mockRestore());
  test("shows one profile field for general employees and four for engineers", async () => {
    const user = userEvent.setup();
    render(<ChakraProvider><Fields /></ChakraProvider>);
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
    await user.selectOptions(screen.getByLabelText("Ασφαλιστικό προφίλ"), "engineer");
    expect(screen.getAllByRole("combobox")).toHaveLength(4);
    expect(screen.getByLabelText("Κατηγορία επικουρικής ασφάλισης")).toHaveValue("1");
    expect(screen.getByLabelText("Κατηγορία εφάπαξ παροχής")).toHaveValue("1");
    await user.selectOptions(screen.getByLabelText("Κατηγορία επικουρικής ασφάλισης"), "3");
    expect(screen.getByLabelText("Κατηγορία εφάπαξ παροχής")).toHaveValue("1");
    await user.selectOptions(screen.getByLabelText("Φορέας επικουρικής ασφάλισης"), "teka");
    expect(screen.getByLabelText("Φορέας επικουρικής ασφάλισης")).toHaveValue("teka");
    await user.selectOptions(screen.getByLabelText("Ασφαλιστικό προφίλ"), "general");
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
  });

  test("keeps an unsupported engineer selection explicit rather than falling back", () => {
    render(<ChakraProvider><Fields initial={{ ...defaults, taxationYear: 2025, insuranceProfile: "engineer" }} /></ChakraProvider>);
    expect(screen.getByLabelText("Ασφαλιστικό προφίλ")).toHaveValue("engineer");
    expect(screen.getByRole("alert")).toHaveTextContent("2025");
  });

  test("opens a breakdown showing exact annual totals, half-cent shares, and zero amounts", async () => {
    const user = userEvent.setup();
    const breakdown = calculateEngineerContributions({ ...defaults, insuranceProfile: "engineer" }, 2000);
    render(<ChakraProvider><EmployeeContributionBreakdown breakdown={breakdown} taxationYear={2026} /></ChakraProvider>);
    await user.click(screen.getByRole("button", { name: "Ανάλυση ασφαλιστικών εισφορών μηχανικού" }));
    await waitFor(() => expect(screen.getByText(/3\.555,62\s€/)).toBeVisible());
    expect(screen.getByText(/5\.540,62\s€/)).toBeVisible();
    expect(screen.getAllByText(/23,285\s€/)).toHaveLength(2);
    expect(screen.getAllByText(/^0,00\s€$/)).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Circular 4\/2026/ })).toHaveAttribute("href", expect.stringContaining("egkyklios-42026"));
  });
});
