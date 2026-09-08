import { getAnalyticsPagePath, pageview } from "../config/gtag";

describe("analytics page paths", () => {
  beforeEach(() => {
    window.gtag = jest.fn();
  });

  afterEach(() => {
    delete window.gtag;
  });

  it("removes calculator inputs and all other query data", () => {
    const url =
      "/employee?compare=2025%2C2026&compareInput=%7B%22income%22%3A28000%7D#wiki";

    expect(getAnalyticsPagePath(url)).toBe("/employee");
  });

  it("sends only the sanitized route to Google Analytics", () => {
    pageview("/business?compareInput=private-financial-data");

    expect(window.gtag).toHaveBeenCalledWith("config", undefined, {
      page_path: "/business",
    });
  });
});
