import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import MobileTableHeader from "../components/table/MobileTableHeader";
import { useStore } from "../store";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../components/keyboard/KeyboardShortcutsButton", () => function MockKeyboardShortcutsButton() { return null; });
jest.mock("../components/table/ResultsActions", () => ({
  MobileResultsActionsMenu: () => null,
}));

const renderHeader = (calculatorEntity) =>
  render(
    <ChakraProvider>
      <MobileTableHeader
        calculatorEntity={calculatorEntity}
        onSubmitAction={jest.fn()}
      />
    </ChakraProvider>,
  );

describe("MobileTableHeader", () => {
  const push = jest.fn();

  beforeEach(() => {
    push.mockReset();
    useRouter.mockReturnValue({ push });
  });

  afterEach(() => {
    useStore.getState().removeUserDetails();
  });

  it.each([
    ["employee", "μισθωτής εργασίας"],
    ["business", "ατομικής επιχείρησης"],
  ])("shows the active %s calculator in the heading", (calculator, label) => {
    renderHeader(calculator);

    expect(
      screen.getByRole("heading", { name: "Υπολογισμός εισοδήματος" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Επιλογή κατηγορίας υπολογισμού",
      }),
    ).toHaveTextContent(label);
  });

  it.each([
    ["employee", "business", "Ατομική επιχείρηση"],
    ["business", "employee", "Μισθωτή εργασία"],
  ])(
    "switches from %s to %s",
    async (currentCalculator, nextCalculator, nextLabel) => {
      useStore.getState().update({ calculatorType: currentCalculator });
      useStore.getState().updateEmployee({ grossIncomeMonthly: 2000 });
      useStore.getState().updateBusiness({ extraBusinessExpenses: 400 });
      renderHeader(currentCalculator);

      fireEvent.click(
        screen.getByRole("button", {
          name: "Επιλογή κατηγορίας υπολογισμού",
        }),
      );
      fireEvent.click(
        await screen.findByText(nextLabel, {
          selector: "[role='menuitemradio'] *",
        }),
      );

      expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
      expect(push).not.toHaveBeenCalled();
      expect(useStore.getState().userDetails.employee.grossIncomeMonthly).toBe(2000);
      fireEvent.click(screen.getByRole("button", { name: "Αλλαγή κατηγορίας" }));

      await waitFor(() => {
        expect(useStore.getState().userDetails.calculatorType).toBe(
          nextCalculator,
        );
        expect(push).toHaveBeenCalledWith(`/${nextCalculator}`);
        expect(useStore.getState().userDetails.employee.grossIncomeMonthly).toBe(0);
        expect(useStore.getState().userDetails.business.extraBusinessExpenses).toBe(0);
      });
    },
  );
});
