import React, { useEffect } from "react";
import "../styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { useRouter } from "next/router";
import * as gtag from "../config/gtag";
import Script from "next/script";
import { getTaxRules, latestTaxYear } from "../rules";

const latestRules = getTaxRules(latestTaxYear);
const formatPercent = (rate) =>
  `${new Intl.NumberFormat("el-GR", { maximumFractionDigits: 3 }).format(
    rate * 100,
  )}%`;
const formatMoney = (amount) =>
  `${new Intl.NumberFormat("el-GR", { maximumFractionDigits: 0 }).format(amount)}€`;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Πώς υπολογίζονται οι ασφαλιστικές εισφορές μισθωτού;",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Για το ${latestTaxYear}, οι εισφορές εργαζομένου υπολογίζονται με συντελεστή ${formatPercent(latestRules.employee.insurance.employeeRate)} επί του μικτού μισθού, έως το μηνιαίο όριο ασφαλιστέων αποδοχών των ${formatMoney(latestRules.employee.insurance.monthlyContributionCap)}.`,
      },
    },
    {
      "@type": "Question",
      name: "Πώς υπολογίζεται ο φόρος εισοδήματος μισθωτού;",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Για το ${latestTaxYear}, ο φόρος υπολογίζεται προοδευτικά στο ετήσιο φορολογητέο εισόδημα μετά τις ασφαλιστικές εισφορές. Οι εφαρμοζόμενοι συντελεστές εξαρτώνται από την ηλικιακή ομάδα και τον αριθμό εξαρτώμενων τέκνων.`,
      },
    },
    {
      "@type": "Question",
      name: "Πώς υπολογίζεται η μείωση φόρου μισθωτού;",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Η αρχική μείωση φόρου εξαρτάται από τον αριθμό εξαρτώμενων τέκνων. Πάνω από ${formatMoney(latestRules.employee.taxCredit.reductionStartsAbove)} μειώνεται κατά ${formatPercent(latestRules.employee.taxCredit.reductionRate)} του υπερβάλλοντος ποσού.`,
      },
    },
  ],
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Script
        id="g-1"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
      />
      <Script
        id="g-2"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_TRACKING_ID}', { page_path: window.location.pathname });
          `,
        }}
      />

      <Script
        id="g-3"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HJID},hjsv:${process.env.NEXT_PUBLIC_HJSV}};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `,
        }}
      />

      {!router.pathname.includes("/blog") &&
        router.pathname !== "/statistics" && (
        <Script
          id="structured-data"
          key="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
}

export default MyApp;
