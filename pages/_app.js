import React from "react";
import "../styles/globals.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { hotjar } from "react-hotjar";
import { useRouter } from "next/router";
import * as gtag from "../config/gtag";
import Script from "next/script";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        // background: "#f0f0f0",
      },
    },
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  React.useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  React.useEffect(() => {
    hotjar.initialize(
      process.env.NEXT_PUBLIC_HJID,
      process.env.NEXT_PUBLIC_HJSV
    );
  }, []);

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

      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
}

export default MyApp;
