import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import { OfferComparison } from "../features/offerComparison";
import { createDefaultOfferComparisonInput, serializeOfferComparisonInput } from "../utils/offerComparison";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));

const renderComparison = () => render(<ChakraProvider><OfferComparison /></ChakraProvider>);
const salary = () => screen.getByRole("spinbutton", { name: "Μικτή πρόταση μισθωτού" });
const invoice = () => screen.getByRole("spinbutton", { name: "Πρόταση τιμολογίου freelancer (χωρίς ΦΠΑ)" });
const enter = (field, value) => fireEvent.change(field, { target: { value: String(value) } });
const secondOffer = () => screen.getByRole("checkbox", { name: "Έχω διαφορετική πρόταση για την άλλη μορφή συνεργασίας" });

beforeEach(() => {
  useRouter.mockReturnValue({ isReady: true, query: {}, pathname: "/compare", replace: jest.fn().mockResolvedValue(true) });
});

test("two perspectives lead with take-home and keep tax settings collapsed", () => {
  renderComparison();
  expect(screen.getByRole("button", { name: /Για εμένα/ })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: /Για την εταιρεία/ })).toHaveAttribute("aria-pressed", "false");
  enter(salary(), 28000);
  expect(screen.getByRole("heading", { name: /Ο μισθωτός έχει.*περισσότερα καθαρά \/ μήνα/ })).toBeInTheDocument();
  expect(screen.getAllByText("καθαρά / ημερολογιακό μήνα")).toHaveLength(2);
  expect(screen.getByText("Ίδιο ετήσιο ποσό προσφοράς")).toBeInTheDocument();
  expect(screen.getByText("Περιθώριο διαπραγμάτευσης με το ίδιο εταιρικό κόστος")).toBeInTheDocument();
  expect(screen.getByText("Διαθέσιμα μετά τους φορολογικούς συμψηφισμούς")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Φορολογικές παραδοχές/ })).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("button", { name: /Παραδοχές freelancer/ })).toHaveAttribute("aria-expanded", "false");
});

test("changing the single offer type preserves the entered amount and period", () => {
  renderComparison();
  enter(salary(), 28000);
  fireEvent.change(screen.getByRole("combobox", { name: "Η γνωστή πρόταση είναι" }), { target: { value: "freelancer" } });
  expect(invoice()).toHaveValue("28000");
  expect(screen.getByRole("combobox", { name: /Περίοδος: Πρόταση τιμολογίου/ })).toHaveValue("year");
  expect(screen.getByRole("heading", { name: /Ο μισθωτός έχει.*περισσότερα καθαρά \/ μήνα/ })).toBeInTheDocument();
});

test("a second actual offer replaces the assumed alternative and can be removed", () => {
  renderComparison();
  enter(salary(), 28000);
  fireEvent.click(secondOffer());
  expect(screen.getByRole("heading", { name: "Συμπλήρωσε και τις δύο προτάσεις" })).toBeInTheDocument();
  enter(invoice(), 3500);
  expect(screen.getByText("Σύγκριση των δύο πραγματικών προτάσεων")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /Ο freelancer έχει.*περισσότερα καθαρά \/ μήνα/ })).toBeInTheDocument();
  fireEvent.click(secondOffer());
  expect(screen.queryByRole("spinbutton", { name: /Πρόταση τιμολογίου/ })).not.toBeInTheDocument();
  expect(screen.getByText("Ίδιο ετήσιο ποσό προσφοράς")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /Ο μισθωτός έχει.*περισσότερα καθαρά \/ μήνα/ })).toBeInTheDocument();
});

test("company budget changes the basis without losing the personal offer", () => {
  renderComparison();
  enter(salary(), 28000);
  fireEvent.click(screen.getByRole("button", { name: /Για την εταιρεία/ }));
  enter(screen.getByRole("spinbutton", { name: "Συνολικό ετήσιο εταιρικό budget" }), 34104);
  expect(screen.getByText("Ίδιο συνολικό ετήσιο κόστος εταιρείας")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /Ο freelancer έχει.*περισσότερα καθαρά \/ μήνα/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Για εμένα/ }));
  expect(salary()).toHaveValue("28000");
  expect(screen.getByText("Ίδιο ετήσιο ποσό προσφοράς")).toBeInTheDocument();
});

test("shared links restore perspective, offers and assumptions", () => {
  const shared = { ...createDefaultOfferComparisonInput(), perspective: "company", companyBudget: 34104, taxationYear: 2026, unpaidLeaveDays: 0, businessExpensesAnnual: 0 };
  useRouter.mockReturnValue({ isReady: true, pathname: "/compare", query: { offer: serializeOfferComparisonInput(shared) } });
  renderComparison();
  expect(screen.getByRole("button", { name: /Για την εταιρεία/ })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("spinbutton", { name: "Συνολικό ετήσιο εταιρικό budget" })).toHaveValue("34104");
  expect(screen.getByText("Ίδιο συνολικό ετήσιο κόστος εταιρείας")).toBeInTheDocument();
});

test("sharing includes both actual offers and the selected perspective", async () => {
  const replace = jest.fn().mockResolvedValue(true);
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  useRouter.mockReturnValue({ isReady: true, pathname: "/compare", query: {}, replace });
  renderComparison();
  enter(salary(), 28000);
  fireEvent.click(secondOffer());
  enter(invoice(), 3500);
  fireEvent.click(screen.getByRole("button", { name: "Κοινοποίηση" }));
  await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
  const url = new URL(writeText.mock.calls[0][0]);
  expect(JSON.parse(url.searchParams.get("offer"))).toMatchObject({ version: 2, input: { perspective: "personal", hasSecondOffer: true, employeeOfferAmount: 28000, freelancerOfferAmount: 3500 } });
  expect(replace).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/compare" }), undefined, { shallow: true });
});
