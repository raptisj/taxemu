import React, { useEffect } from "react";
import "../styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { useRouter } from "next/router";
import * as gtag from "../config/gtag";
import Script from "next/script";

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
            gtag('config', '${gtag.GA_TRACKING_ID}');
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

      <Script
        id="structured-data"
        key="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
              "@type": "Question",
              "name": "Πως υπολογίζονται οι ασφαλιστικές εισφορές μισθωτού",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "<p>Οι ασφαλιστικές εισφορές του εργαζομένου προκύπτουν από την εφαρμογή ενός ποσοστού επί το μικτού μισθού.</p> <br /> <p><strong>Παράδειγμα:</strong> Για ένα μικτό μηνιαίο 2000€ και με το ποσοστό των ασφαλιστικών εισφορών που παρακρατούνται να είναι στο 13.867%: μικτό μηνιαίο * 0.13867 = ασφαλιστικές εισφορές ανά μήνα</p>"
              }
            }, {
              "@type": "Question",
              "name": "Πως υπολογίζεται ο φόρος εισοδήματος μισθωτού",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "<p>Για τον υπολογισμό χρησιμοποιείται το ετήσιο φορολογητέο εισόδημα αφότου γίνει η αφαίρεση τον ασφαλιστικών εισφορών, και ο φόρος υπολογίζεται κλιμακωτά:</p> <br /> <ul><li>0€-10.000€ → 9%</li><li>10.000€-€20.000€ → 22%</li><li>20.000€-€30.000€ → 28%</li><li>30.000€-€40.000€ → 36%</li><li>40.000€+ → 44%</li></ul> <br/> <p><strong>παράδειγμα:</strong> Με ετήσιο φορολογητέο εισόδημα 17.232€ προκύπτει:</p> <ul><li>10.000€ * 0.09 = €900</li><li>7.232€ * 0.22 = 1591€</li><li>σύνολο = 2491€</li></ul>"
              }
            }, {
              "@type": "Question",
              "name": "Πως υπολογίζεται η έκπτωση φόρου μισθωτού",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "<p>Η έκπτωση φόρου εισοδήματος για μισθωτούς εξαρτάται από τον αριθμό των προστατευόμενων τέκνων. Για εισοδήματα κάτω των 12.000€ είναι οι εξής:</p> <ul> <li>777€, εάν δεν υπάρχουν προστατευόμενα τέκνα</li><li>810€, εάν υφίσταται ένα προστατευόμενο τέκνο</li><li>900€, εάν υπάρχουν δύο προστατευόμενα τέκνα</li><li>1.120€, εάν υφίστανται τρία προστατευόμενα τέκνα</li><li>1.340€, εάν υφίστανται τέσσερα προστατευόμενα τέκνα</li><li>επιπλέον 220€ για κάθε προστατευόμενο τέκνο από το πέμπτο και πάνω</li> </ul> <p>Αν το εισοδήματα υπερβαίνει τα 12.000€ η έκπτωση μειώνεται κατά 20€ ανά 1.000€.</p>"
            }
          }]
          }
          `,
        }}
      />

      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
}

export default MyApp;
