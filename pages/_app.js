import React from "react";
import "../styles/globals.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { hotjar } from 'react-hotjar'

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
  React.useEffect(() => {
    hotjar.initialize(
      process.env.NEXT_PUBLIC_HJID,
      process.env.NEXT_PUBLIC_HJSV
    );
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
