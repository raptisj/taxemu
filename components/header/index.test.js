import { render, screen } from "@testing-library/react";
import Heading from "./Hero";

describe("Heading", () => {
    render(<Heading />);
    const heading = screen.getByTestId("heading");
  
    it("renders", () => {
      expect(heading).toBeInTheDocument();
    });
  
    it("renders with title", () => {
      expect(heading).toHaveTextContent("Taxemu");
      expect(heading).toHaveTextContent("Alpha Version");
    });
  
    it("renders with version", () => {
      expect(heading).toHaveTextContent("Alpha Version");
    });
  });