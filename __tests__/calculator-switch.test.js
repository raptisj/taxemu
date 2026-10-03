import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import EmployeeForm from "../components/employee/EmployeeForm";
import BusinessForm from "../components/business/BusinessForm";
import { Navigation } from "../components/navigation/Navigation";
import { useStore } from "../store";
import { getComparisonInput } from "../utils/yearComparison";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("next/image", () => function MockImage() { return null; });
jest.mock("../features", () => ({ Wiki: () => null, BusinessNegotiateWidget: () => null }));
jest.mock("next/link", () => {
  const React = require("react");
  const { useRouter } = require("next/router");
  return React.forwardRef(function MockLink({ href, onClick, children, ...props }, ref) {
    const router = useRouter();
    return <a {...props} href={href} ref={ref} onClick={(event) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        event.preventDefault();
        router.push(href);
      }
    }}>{children}</a>;
  });
});

const push = jest.fn();
const replace = jest.fn();
const setup = (pathname, { calculated = true } = {}) => {
  useRouter.mockReturnValue({ pathname, query: {}, isReady: true, push, replace });
  useStore.getState().update({ calculatorType: pathname.slice(1) });
  useStore.getState().updateEmployee({ grossIncomeMonthly: 2000 });
  useStore.getState().updateBusiness({ extraBusinessExpenses: 400 });
  const entity = pathname.slice(1);
  if (calculated && ["employee", "business"].includes(entity)) {
    const state = useStore.getState();
    const commit = entity === "employee"
      ? state.commitEmployeeCalculation
      : state.commitBusinessCalculation;
    commit({
      newState: {},
      tableResults: { calculationInput: getComparisonInput(entity, state.userDetails[entity]) },
    });
  }
};
const renderUI = (component) => render(<ChakraProvider>{component}</ChakraProvider>);
const openMenu = async () => {
  // The trigger is hidden at desktop widths, which jsdom uses by default.
  fireEvent.click(screen.getByRole("button", { name: "Άνοιγμα μενού πλοήγησης", hidden: true }));
  return screen.findByRole("menu");
};
const confirm = () => fireEvent.click(screen.getByRole("button", { name: "Αλλαγή κατηγορίας" }));

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
});
afterEach(() => useStore.getState().removeUserDetails());

it.each([
  ["employee", "business", EmployeeForm, "Ατομική επιχείρηση"],
  ["business", "employee", BusinessForm, "Μισθωτή εργασία"],
])("switches desktop %s to %s immediately with uncalculated inputs", (current, next, Form, label) => {
  setup(`/${current}`, { calculated: false });
  useStore.getState().setHasError({ entity: current, value: true });
  renderUI(<Form />);
  fireEvent.click(screen.getByRole("radio", { name: label }));

  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(push).toHaveBeenCalledTimes(1);
  expect(push).toHaveBeenCalledWith(`/${next}`);
  expect(useStore.getState().userDetails.calculatorType).toBe(next);
  expect(useStore.getState().userDetails.employee.grossIncomeMonthly).toBe(0);
  expect(useStore.getState().userDetails.business.extraBusinessExpenses).toBe(0);
});

it.each([
  ["employee", "business", "Ατομική επιχείρηση"],
  ["business", "employee", "Μισθωτή εργασία"],
])("switches the burger menu from %s to %s immediately on a fresh calculator", async (current, next, label) => {
  setup(`/${current}`, { calculated: false });
  useStore.getState().removeUserDetails();
  useStore.getState().update({ calculatorType: current });
  renderUI(<Navigation />);
  await openMenu();
  fireEvent.click(screen.getByRole("menuitem", { name: label }));

  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(push).toHaveBeenCalledTimes(1);
  expect(push).toHaveBeenCalledWith(`/${next}`);
  expect(useStore.getState().userDetails.calculatorType).toBe(next);
});

it("still confirms when inputs are emptied after a completed calculation", async () => {
  setup("/employee");
  useStore.getState().updateEmployee({ grossIncomeMonthly: 0, grossIncomeYearly: 0 });
  renderUI(<EmployeeForm />);
  fireEvent.click(screen.getByRole("radio", { name: "Ατομική επιχείρηση" }));

  expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
  expect(push).not.toHaveBeenCalled();
});

it("protects a completed calculation in the other calculator too", async () => {
  setup("/business");
  useRouter.mockReturnValue({ pathname: "/employee", query: {}, push, replace });
  useStore.getState().update({ calculatorType: "employee" });
  renderUI(<EmployeeForm />);
  fireEvent.click(screen.getByRole("radio", { name: "Ατομική επιχείρηση" }));

  expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
  expect(push).not.toHaveBeenCalled();
});

it("switches without prompting again after the previous calculation was cleared", async () => {
  setup("/employee");
  const { unmount } = renderUI(<EmployeeForm />);
  fireEvent.click(screen.getByRole("radio", { name: "Ατομική επιχείρηση" }));
  await screen.findByRole("alertdialog");
  confirm();
  unmount();

  useRouter.mockReturnValue({ pathname: "/business", query: {}, push, replace });
  renderUI(<BusinessForm />);
  fireEvent.click(screen.getByRole("radio", { name: "Μισθωτή εργασία" }));

  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(push.mock.calls).toEqual([["/business"], ["/employee"]]);
});

it.each([
  ["employee", "business", EmployeeForm, "Ατομική επιχείρηση"],
  ["business", "employee", BusinessForm, "Μισθωτή εργασία"],
])("confirms and clears a desktop switch from %s to %s", async (current, next, Form, label) => {
  setup(`/${current}`);
  renderUI(<Form />);
  const previous = useStore.getState().userDetails;
  const activeRadio = screen.getByRole("radio", { name: current === "employee" ? "Μισθωτή εργασία" : "Ατομική επιχείρηση" });
  fireEvent.click(screen.getByRole("radio", { name: label }));

  expect(await screen.findByRole("alertdialog")).toHaveTextContent("θα διαγραφούν");
  expect(useStore.getState().userDetails).toBe(previous);
  expect(push).not.toHaveBeenCalled();
  expect(activeRadio).toBeChecked();
  confirm();

  expect(push).toHaveBeenCalledWith(`/${next}`);
  expect(useStore.getState().userDetails.calculatorType).toBe(next);
  expect(useStore.getState().userDetails.employee.grossIncomeMonthly).toBe(0);
  expect(useStore.getState().userDetails.business.extraBusinessExpenses).toBe(0);
});

it("cancels a desktop switch without changing inputs, results, or comparison query", async () => {
  setup("/employee");
  const query = { compare: "2025,2026", compareInput: "shared calculation" };
  useRouter.mockReturnValue({ pathname: "/employee", query, push, replace });
  renderUI(<EmployeeForm />);
  const previous = useStore.getState().userDetails;
  fireEvent.click(screen.getByRole("radio", { name: "Ατομική επιχείρηση" }));
  await screen.findByRole("alertdialog");
  await waitFor(() => expect(screen.getByRole("button", { name: "Ακύρωση" })).toHaveFocus());
  fireEvent.click(screen.getByRole("button", { name: "Ακύρωση" }));

  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  expect(useStore.getState().userDetails).toBe(previous);
  expect(push).not.toHaveBeenCalled();
  expect(replace).not.toHaveBeenCalled();
  expect(query).toEqual({ compare: "2025,2026", compareInput: "shared calculation" });
});

it.each([
  ["employee", "business", "Ατομική επιχείρηση"],
  ["business", "employee", "Μισθωτή εργασία"],
])("confirms a burger menu switch from %s to %s", async (current, next, label) => {
  setup(`/${current}`);
  renderUI(<Navigation />);
  const previous = useStore.getState().userDetails;
  await openMenu();
  fireEvent.click(screen.getByRole("menuitem", { name: label }));

  expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
  expect(push).not.toHaveBeenCalled();
  expect(useStore.getState().userDetails).toBe(previous);
  confirm();
  expect(push).toHaveBeenCalledWith(`/${next}`);
  expect(useStore.getState().userDetails.employee.grossIncomeMonthly).toBe(0);
  expect(useStore.getState().userDetails.business.extraBusinessExpenses).toBe(0);
});

it("dismisses a burger switch with Escape without clearing or navigating", async () => {
  setup("/employee");
  renderUI(<Navigation />);
  const previous = useStore.getState().userDetails;
  await openMenu();
  fireEvent.click(screen.getByRole("menuitem", { name: "Ατομική επιχείρηση" }));
  const dialog = await screen.findByRole("alertdialog");
  fireEvent.keyDown(dialog, { key: "Escape", code: "Escape", keyCode: 27 });

  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  expect(useStore.getState().userDetails).toBe(previous);
  expect(push).not.toHaveBeenCalled();
});

it.each([
  ["/employee", "Μισθωτή εργασία", "/employee"],
  ["/compare", "Ατομική επιχείρηση", "/business"],
  ["/blog", "Μισθωτή εργασία", "/employee"],
  ["/welcome", "Ατομική επιχείρηση", "/business"],
  ["/employee", "Στατιστικά", "/statistics"],
])("preserves values when navigating from %s to %s", async (pathname, label, destination) => {
  setup(pathname);
  renderUI(<Navigation />);
  const previous = useStore.getState().userDetails;
  await openMenu();
  fireEvent.click(screen.getByRole("menuitem", { name: label }));

  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(useStore.getState().userDetails).toBe(previous);
  expect(push).toHaveBeenCalledWith(destination);
});
