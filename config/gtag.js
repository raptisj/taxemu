export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const getAnalyticsPagePath = (url) => {
  if (typeof url !== "string") return "/";

  try {
    return new URL(url, "https://www.taxemu.gr").pathname;
  } catch {
    return url.split(/[?#]/, 1)[0] || "/";
  }
};

export const pageview = (url) => {
  if (typeof window !== "undefined") {
    window.gtag("config", GA_TRACKING_ID, {
      // Calculator inputs can be present in the query string. Analytics only
      // needs the route, never a user's financial or household parameters.
      page_path: getAnalyticsPagePath(url),
    });
  }
};

export const event = ({ action, category, label, value }) => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
