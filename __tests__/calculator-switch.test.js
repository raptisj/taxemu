import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import EmployeeForm from "../components/employee/EmployeeForm";
import BusinessForm from "../components/business/BusinessForm";
import { Navigation } from "../components/navigation/Navigation";
import { useStore } from "../store";

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
const setup = (pathname) => {
  useRouter.mockReturnValue({ pathname, query: {}, isReady: true, push, replace });
  useStore.getState().update({ calculatorType: pathname.slice(1) });
  useStore.getState().updateEmployee({ grossIncomeMonthly: 2000 });
  useStore.getState().updateBusiness({ extraBusinessExpenses: 400 });
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
