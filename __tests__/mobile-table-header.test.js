import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import MobileTableHeader from "../components/table/MobileTableHeader";
import { useStore } from "../store";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../components/keyboard/KeyboardShortcutsButton", () => () => null);
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
    ["employee", "μισθωτού"],
    ["business", "ελεύθερου επαγγελματία"],
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
    ["employee", "business", "Ελεύθερος επαγγελματίας"],
    ["business", "employee", "Μισθωτός"],
  ])(
    "switches from %s to %s",
    async (currentCalculator, nextCalculator, nextLabel) => {
      useStore.getState().update({ calculatorType: currentCalculator });
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

      await waitFor(() => {
        expect(useStore.getState().userDetails.calculatorType).toBe(
          nextCalculator,
        );
        expect(push).toHaveBeenCalledWith(`/${nextCalculator}`);
      });
    },
  );
});
